# Design: GitHub PR Management

## Architecture Overview

Extends the existing `github-prs` three-layer architecture with write operations. All mutations flow through the same secure IPC bridge pattern: renderer → preload → ipcMain → api.js → GitHub REST API.

```
Renderer (React)          Preload (Bridge)           Main Process
┌──────────────┐         ┌──────────────┐         ┌──────────────────┐
│ PrActionsToolbar│──IPC──▶│ electronAPI. │──handle──▶│ ipc.js handlers  │
│ PrMergeModal   │        │ github.*     │         │ api.js functions │
│ PrReviewModal  │        └──────────────┘         │ safeStorage      │
│ ...            │                                 └──────────────────┘
└──────────────┘                                          │
                                                          ▼
                                                  GitHub REST API
```

## API Layer (`electron/github/api.js`)

### New Functions

| Function | HTTP | Endpoint | Purpose |
|----------|------|----------|---------|
| `mergePullRequest` | PUT | `/repos/{owner}/{repo}/pulls/{number}/merge` | Merge a PR |
| `updatePullRequest` | PATCH | `/repos/{owner}/{repo}/pulls/{number}` | Edit title/body |
| `createReview` | POST | `/repos/{owner}/{repo}/pulls/{number}/reviews` | Submit review |
| `requestReviewers` | POST | `/repos/{owner}/{repo}/pulls/{number}/requested_reviewers` | Add reviewers |
| `removeReviewers` | DELETE | `/repos/{owner}/{repo}/pulls/{number}/requested_reviewers` | Remove reviewers |
| `addLabels` | POST | `/repos/{owner}/{repo}/issues/{number}/labels` | Add labels |
| `removeLabel` | DELETE | `/repos/{owner}/{repo}/issues/{number}/labels/{name}` | Remove label |
| `getPrReviews` | GET | `/repos/{owner}/{repo}/pulls/{number}/reviews` | Get review history |

### Function Signatures

```javascript
// Merge
mergePullRequest(token, owner, repo, number, {
  merge_method: 'merge' | 'squash' | 'rebase',
  commit_title: string,      // optional, defaults to PR title
  commit_message: string     // optional
})

// Update
updatePullRequest(token, owner, repo, number, {
  title: string,             // optional
  body: string               // optional
})

// Review
createReview(token, owner, repo, number, {
  event: 'APPROVE' | 'REQUEST_CHANGES' | 'COMMENT',
  body: string               // required for REQUEST_CHANGES and COMMENT
})

// Reviewers
requestReviewers(token, owner, repo, number, { reviewers: string[] })
removeReviewers(token, owner, repo, number, { reviewers: string[] })

// Labels
addLabels(token, owner, repo, number, { labels: string[] })
removeLabel(token, owner, repo, number, labelName)

// Reviews history
getPrReviews(token, owner, repo, number)
```

### Error Handling

All functions must handle these HTTP status codes:

| Code | Meaning | User Message |
|------|---------|--------------|
| 401 | Unauthorized | "Sesión expirada. Vuelve a conectarte." |
| 403 | Forbidden | "No tienes permisos para esta acción." |
| 405 | Method Not Allowed | "El PR ya fue mergeado." |
| 422 | Unprocessable | "Hay conflictos que resolver primero." |
| 403 (rate) | Rate Limited | "Límite de API alcanzado. Intenta en unos minutos." |

## IPC Handlers (`electron/github/ipc.js`)

### New Channels

```javascript
ipcMain.handle('github:prs:merge', async (event, { owner, repo, number, opts }) => { ... })
ipcMain.handle('github:prs:update', async (event, { owner, repo, number, data }) => { ... })
ipcMain.handle('github:prs:create-review', async (event, { owner, repo, number, review }) => { ... })
ipcMain.handle('github:prs:request-reviewers', async (event, { owner, repo, number, users }) => { ... })
ipcMain.handle('github:prs:remove-reviewers', async (event, { owner, repo, number, users }) => { ... })
ipcMain.handle('github:prs:add-labels', async (event, { owner, repo, number, labels }) => { ... })
ipcMain.handle('github:prs:remove-label', async (event, { owner, repo, number, labelName }) => { ... })
ipcMain.handle('github:prs:get-reviews', async (event, { owner, repo, number }) => { ... })
```

Each handler:
1. Retrieves token from safeStorage
2. Validates parameters
3. Calls the corresponding api.js function
4. Returns result or throws structured error

## Preload Bridge (`electron/preload.js`)

```javascript
contextBridge.exposeInMainWorld('electronAPI', {
  github: {
    // ... existing methods ...
    mergePullRequest: (owner, repo, number, opts) =>
      ipcRenderer.invoke('github:prs:merge', { owner, repo, number, opts }),
    updatePullRequest: (owner, repo, number, data) =>
      ipcRenderer.invoke('github:prs:update', { owner, repo, number, data }),
    createReview: (owner, repo, number, review) =>
      ipcRenderer.invoke('github:prs:create-review', { owner, repo, number, review }),
    requestReviewers: (owner, repo, number, users) =>
      ipcRenderer.invoke('github:prs:request-reviewers', { owner, repo, number, users }),
    removeReviewers: (owner, repo, number, users) =>
      ipcRenderer.invoke('github:prs:remove-reviewers', { owner, repo, number, users }),
    addLabels: (owner, repo, number, labels) =>
      ipcRenderer.invoke('github:prs:add-labels', { owner, repo, number, labels }),
    removeLabel: (owner, repo, number, labelName) =>
      ipcRenderer.invoke('github:prs:remove-label', { owner, repo, number, labelName }),
    getPrReviews: (owner, repo, number) =>
      ipcRenderer.invoke('github:prs:get-reviews', { owner, repo, number }),
  }
})
```

## TypeScript Types (`global.d.ts`)

Extend the existing `GitHubAPI` interface:

```typescript
interface MergeOpts {
  merge_method: 'merge' | 'squash' | 'rebase'
  commit_title?: string
  commit_message?: string
}

interface ReviewData {
  event: 'APPROVE' | 'REQUEST_CHANGES' | 'COMMENT'
  body?: string
}

interface Review {
  id: number
  user: { login: string; avatar_url: string }
  state: 'APPROVED' | 'CHANGES_REQUESTED' | 'COMMENTED' | 'DISMISSED' | 'PENDING'
  body: string | null
  submitted_at: string
}

interface GitHubAPI {
  // ... existing methods ...
  mergePullRequest(owner: string, repo: string, number: number, opts: MergeOpts): Promise<void>
  updatePullRequest(owner: string, repo: string, number: number, data: { title?: string; body?: string }): Promise<void>
  createReview(owner: string, repo: string, number: number, review: ReviewData): Promise<void>
  requestReviewers(owner: string, repo: string, number: number, users: string[]): Promise<void>
  removeReviewers(owner: string, repo: string, number: number, users: string[]): Promise<void>
  addLabels(owner: string, repo: string, number: number, labels: string[]): Promise<void>
  removeLabel(owner: string, repo: string, number: number, labelName: string): Promise<void>
  getPrReviews(owner: string, repo: string, number: number): Promise<Review[]>
}
```

## UI Components

### Component Tree

```
PrDetail (existing page)
├── PrActionsToolbar          (merge, close, review buttons)
│   ├── PrMergeModal          (merge method selector + confirmation)
│   ├── PrReviewModal         (approve/request changes/comment)
│   └── PrEditModal           (edit title/body)
├── PrReviewersManager        (add/remove reviewers)
├── PrLabelManager            (add/remove labels)
└── PrReviewHistory           (past reviews list)
```

### Component Specs

#### PrActionsToolbar
- Horizontal button bar below PR title
- Buttons: Merge (if mergeable), Cerrar/Reabrir, Revisar, Editar
- Disabled states based on PR permissions and status

#### PrMergeModal
- Dropdown: merge method (merge, squash, rebase) — default squash
- Input: commit title (pre-filled with PR title)
- Textarea: commit message (optional)
- Confirmation button: "Confirmar merge"
- Loading state during API call

#### PrReviewModal
- Three buttons: Aprobar, Pedir cambios, Comentar
- Textarea: body (required for Pedir cambios and Comentar, optional for Aprobar)
- Submit button with loading state

#### PrEditModal
- Input: title (pre-filled)
- Textarea: body (pre-filled)
- Save button

#### PrReviewersManager
- List of current reviewers with avatars
- Input to add reviewer by username
- Remove button per reviewer

#### PrLabelManager
- List of current labels with color chips
- Dropdown/search to add labels from repo
- Remove button per label

#### PrReviewHistory
- List of past reviews
- Each entry: reviewer avatar, name, verdict badge, date, body
- Sorted by date descending

## Security Considerations

1. **Confirmation dialogs**: All destructive operations (merge, close) require explicit user confirmation via `electron.dialog.showMessageBox`
2. **Token scope**: The existing `repo` scope already covers write permissions; no additional scopes needed
3. **Validation**: All URLs validated to only allow `github.com` API calls
4. **Error sanitization**: API errors logged in main process but never expose token or internal details to renderer

## Sequences

### Merge PR Flow

```
User clicks "Merge" → PrMergeModal opens →
User selects method → clicks "Confirmar" →
electron.dialog.showMessageBox (confirm) →
electronAPI.github.mergePullRequest() →
IPC invoke → api.mergePullRequest() →
PUT /repos/{owner}/{repo}/pulls/{number}/merge →
Success → toast "PR mergeado correctamente" →
Refresh PR detail
```

### Create Review Flow

```
User clicks "Revisar" → PrReviewModal opens →
User selects verdict (Aprobar/Pedir cambios/Comentar) →
User types body → clicks "Enviar revisión" →
electronAPI.github.createReview() →
IPC invoke → api.createReview() →
POST /repos/{owner}/{repo}/pulls/{number}/reviews →
Success → toast "Revisión enviada" →
Refresh PR detail + review history
```
