# Non-Functional Specifications: GitHub PR Management

## NFR-01: Performance

- All write operations (merge, close, review, edit, add/remove reviewers, add/remove labels) MUST complete within 3 seconds under normal network conditions
- Optimistic UI updates SHOULD be applied where safe (e.g., label removal)
- Review history data MUST be fetched on component mount, not on every render
- API responses MUST be cached for 30 seconds to avoid redundant calls during rapid interactions

## NFR-02: Error Handling

All write operations MUST handle the following HTTP status codes with user-friendly Spanish messages:

| Code | User Message |
|------|--------------|
| 401 | "Sesión expirada. Vuelve a conectarte." |
| 403 | "No tienes permisos para esta acción." |
| 405 | "El PR ya fue mergeado." |
| 422 | "Hay conflictos que resolver primero." |
| 429 | "Límite de API alcanzado. Intenta en unos minutos." |
| Network | "Error de conexión. Verifica tu internet." |

- Error messages MUST be displayed as toast notifications
- Errors MUST NOT expose token, internal URLs, or stack traces to the user
- Failed operations MUST NOT leave the UI in an inconsistent state

## NFR-03: Security

- Confirmation dialogs via `electron.dialog.showMessageBox` REQUIRED for:
  - Merging a PR
  - Closing a PR
- Token MUST NEVER be exposed to the renderer process
- Token MUST be retrieved from `safeStorage` in main process for each operation
- All API URLs MUST be validated to only allow `github.com` domains
- IPC channel names MUST follow the pattern `github:prs:*` to avoid collisions
- Write operations MUST check authentication state before executing

## NFR-04: Accessibility

- All interactive elements (buttons, inputs, modals) MUST be keyboard accessible
- Modals MUST trap focus and close on Escape key
- Loading states MUST be announced to screen readers via `aria-live`
- All buttons MUST have descriptive labels or `aria-label` attributes
- Color is NEVER the sole indicator of state (labels show text alongside colors)

## NFR-05: UX Consistency

- All modals MUST use the existing modal pattern from the app (centered, backdrop, close button)
- Toast notifications MUST use the existing toast system
- Button styles MUST follow the existing design system (primary for actions, secondary for cancel)
- Loading indicators MUST be consistent with existing spinner/progress patterns
- Spanish language MUST be used for all user-facing text

## NFR-06: Code Quality

- All new code MUST be written in TypeScript (or .tsx for components)
- All API functions MUST include JSDoc comments with parameter descriptions
- All IPC handlers MUST validate input parameters before calling API functions
- Components MUST follow existing code conventions (hooks, functional components)
- No new dependencies SHOULD be introduced; use existing UI libraries
