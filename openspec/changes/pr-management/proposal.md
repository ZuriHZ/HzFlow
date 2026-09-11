# Proposal: GitHub PR Management

## Intent

Transform the GitHub PRs module from read-only viewer to full PR management tool. The existing `github-prs` change provides listing and viewing capabilities; this change adds merge, close/reopen, review, edit, reviewer management, and label management — so users can manage their entire PR workflow without leaving the app.

## Scope

### In Scope

- **Merge PRs**: merge, squash, rebase methods with confirmation
- **Close/Reopen PRs**: toggle PR state with confirmation for closing
- **Create Reviews**: approve, request changes, or comment on PRs
- **Edit PRs**: modify title and description
- **Manage Reviewers**: add/remove requested reviewers
- **Manage Labels**: add/remove labels from the repo's label set
- **Review History**: display past reviews with verdict, reviewer, date, and body

### Out of Scope

- CI/CD management or workflow triggers
- Issue management (separate feature)
- Branch management or creation
- Inline code review with diff comments
- PR draft/ready toggle

## Approach

Extend the existing three-layer architecture (main process → preload bridge → renderer) with write operations:

1. **API Layer** (`electron/github/api.js`): Add REST endpoints for merge, update, reviews, reviewers, and labels
2. **IPC Handlers** (`electron/github/ipc.js`): Register new channels for each write operation
3. **Preload Bridge** (`electron/preload.js`): Expose new methods under `window.electronAPI.github`
4. **UI Components** (`src/components/github/`): Extract reusable components for each management action

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `electron/github/api.js` | Modified | 8 new API functions for write operations |
| `electron/github/ipc.js` | Modified | 8 new IPC handlers |
| `electron/preload.js` | Modified | Expose new bridge methods |
| `global.d.ts` | Modified | Extend TypeScript interfaces |
| `src/components/github/` (nuevo) | New | 7 new UI components |
| `src/pages/prs.tsx` | Modified | Integrate management toolbar |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Destructive operations (merge, close) without confirmation | Med | Confirmation dialogs for all destructive actions |
| Token permissions insufficient for write operations | Med | Token scope `repo` already covers writes; handle 403 gracefully |
| Race conditions on concurrent PR modifications | Low | Optimistic UI with server-side validation |
| Error messages too technical for users | Med | All errors translated to user-friendly Spanish messages |

## Rollback Plan

1. Revert commits for the pr-management change
2. Existing `github-prs` read-only functionality remains intact
3. No database migrations; rollback is purely code removal
4. Remove new IPC handlers and preload methods

## Success Criteria

- [ ] Users can merge PRs with method selection and confirmation
- [ ] Users can close and reopen PRs
- [ ] Users can create reviews (approve/request changes/comment)
- [ ] Users can edit PR title and description
- [ ] Users can add and remove reviewers
- [ ] Users can add and remove labels
- [ ] Review history is displayed with all details
- [ ] All destructive operations require confirmation
- [ ] Error messages are user-friendly and in Spanish
- [ ] `npm run build` passes after implementation
