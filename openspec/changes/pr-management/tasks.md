# Tasks: GitHub PR Management

## Phase 1: API + IPC + Types

### 1.1 API Functions (`electron/github/api.js`)

- [ ] 1.1.1 Add `mergePullRequest(token, owner, repo, number, opts)` — PUT `/repos/{owner}/{repo}/pulls/{number}/merge`
- [ ] 1.1.2 Add `updatePullRequest(token, owner, repo, number, data)` — PATCH `/repos/{owner}/{repo}/pulls/{number}`
- [ ] 1.1.3 Add `createReview(token, owner, repo, number, review)` — POST `/repos/{owner}/{repo}/pulls/{number}/reviews`
- [ ] 1.1.4 Add `requestReviewers(token, owner, repo, number, users)` — POST `/repos/{owner}/{repo}/pulls/{number}/requested_reviewers`
- [ ] 1.1.5 Add `removeReviewers(token, owner, repo, number, users)` — DELETE `/repos/{owner}/{repo}/pulls/{number}/requested_reviewers`
- [ ] 1.1.6 Add `addLabels(token, owner, repo, number, labels)` — POST `/repos/{owner}/{repo}/issues/{number}/labels`
- [ ] 1.1.7 Add `removeLabel(token, owner, repo, number, labelName)` — DELETE `/repos/{owner}/{repo}/issues/{number}/labels/{name}`
- [ ] 1.1.8 Add `getPrReviews(token, owner, repo, number)` — GET `/repos/{owner}/{repo}/pulls/{number}/reviews`

### 1.2 IPC Handlers (`electron/github/ipc.js`)

- [ ] 1.2.1 Add `github:prs:merge` handler
- [ ] 1.2.2 Add `github:prs:update` handler
- [ ] 1.2.3 Add `github:prs:create-review` handler
- [ ] 1.2.4 Add `github:prs:request-reviewers` handler
- [ ] 1.2.5 Add `github:prs:remove-reviewers` handler
- [ ] 1.2.6 Add `github:prs:add-labels` handler
- [ ] 1.2.7 Add `github:prs:remove-label` handler
- [ ] 1.2.8 Add `github:prs:get-reviews` handler

### 1.3 Preload Bridge (`electron/preload.js`)

- [ ] 1.3.1 Expose `mergePullRequest` method
- [ ] 1.3.2 Expose `updatePullRequest` method
- [ ] 1.3.3 Expose `createReview` method
- [ ] 1.3.4 Expose `requestReviewers` method
- [ ] 1.3.5 Expose `removeReviewers` method
- [ ] 1.3.6 Expose `addLabels` method
- [ ] 1.3.7 Expose `removeLabel` method
- [ ] 1.3.8 Expose `getPrReviews` method

### 1.4 TypeScript Types (`global.d.ts`)

- [ ] 1.4.1 Add `MergeOpts` interface
- [ ] 1.4.2 Add `ReviewData` interface
- [ ] 1.4.3 Add `Review` interface
- [ ] 1.4.4 Extend `GitHubAPI` with new method signatures

## Phase 2: UI Components

### 2.1 PrActionsToolbar (`src/components/github/PrActionsToolbar.tsx`)

- [ ] 2.1.1 Create component with Merge, Close/Reopen, Review, Edit buttons
- [ ] 2.1.2 Add disabled states based on PR status and permissions
- [ ] 2.1.3 Add loading states for each action

### 2.2 PrMergeModal (`src/components/github/PrMergeModal.tsx`)

- [ ] 2.2.1 Create modal with merge method selector (merge, squash, rebase)
- [ ] 2.2.2 Add commit title input (pre-filled with PR title)
- [ ] 2.2.3 Add commit message textarea (optional)
- [ ] 2.2.4 Add confirmation button with loading state
- [ ] 2.2.5 Wire to electron.dialog for confirmation

### 2.3 PrReviewModal (`src/components/github/PrReviewModal.tsx`)

- [ ] 2.3.1 Create modal with three verdict buttons (Aprobar, Pedir cambios, Comentar)
- [ ] 2.3.2 Add body textarea with conditional required validation
- [ ] 2.3.3 Add submit button with loading state
- [ ] 2.3.4 Wire to createReview API

### 2.4 PrEditModal (`src/components/github/PrEditModal.tsx`)

- [ ] 2.4.1 Create modal with title input and body textarea
- [ ] 2.4.2 Pre-fill with current PR values
- [ ] 2.4.3 Add save button with loading state
- [ ] 2.4.4 Wire to updatePullRequest API

### 2.5 PrReviewersManager (`src/components/github/PrReviewersManager.tsx`)

- [ ] 2.5.1 Create component showing current reviewers with avatars
- [ ] 2.5.2 Add input for adding reviewers by username
- [ ] 2.5.3 Add remove button per reviewer
- [ ] 2.5.4 Wire to requestReviewers and removeReviewers APIs

### 2.6 PrLabelManager (`src/components/github/PrLabelManager.tsx`)

- [ ] 2.6.1 Create component showing current labels with color chips
- [ ] 2.6.2 Add input/dropdown for adding labels
- [ ] 2.6.3 Add remove button per label
- [ ] 2.6.4 Wire to addLabels and removeLabel APIs

### 2.7 PrReviewHistory (`src/components/github/PrReviewHistory.tsx`)

- [ ] 2.7.1 Create component listing past reviews
- [ ] 2.7.2 Show reviewer avatar, name, verdict badge, date, body
- [ ] 2.7.3 Sort by date descending
- [ ] 2.7.4 Wire to getPrReviews API

## Phase 3: Integration

### 3.1 Page Integration (`src/pages/prs.tsx`)

- [ ] 3.1.1 Integrate PrActionsToolbar into PrDetail view
- [ ] 3.1.2 Integrate PrReviewersManager into PrDetail view
- [ ] 3.1.3 Integrate PrLabelManager into PrDetail view
- [ ] 3.1.4 Integrate PrReviewHistory into PrDetail view

### 3.2 Confirmation Dialogs

- [ ] 3.2.1 Add confirmation dialog for merge operations
- [ ] 3.2.2 Add confirmation dialog for close operations

### 3.3 Feedback

- [ ] 3.3.1 Add success toasts for all write operations
- [ ] 3.3.2 Add error toasts with Spanish messages for all failure cases
- [ ] 3.3.3 Add loading states for all async operations

### 3.4 Optimistic Updates

- [ ] 3.4.1 Implement optimistic label removal
- [ ] 3.4.2 Implement optimistic reviewer removal

## Phase 4: Polish

### 4.1 Review History Display

- [ ] 4.1.1 Style verdict badges (green for approved, red for changes requested, gray for commented)
- [ ] 4.1.2 Format dates using locale formatting

### 4.2 Label Colors

- [ ] 4.2.1 Display label color chips with proper contrast
- [ ] 4.2.2 Ensure text is readable on all label colors

### 4.3 Keyboard Navigation

- [ ] 4.3.1 Ensure all modal interactions are keyboard accessible
- [ ] 4.3.2 Add Escape key to close modals
- [ ] 4.3.3 Trap focus within modals

### 4.4 Error Boundaries

- [ ] 4.4.1 Add error boundary around management components
- [ ] 4.4.2 Graceful fallback when review history fails to load
