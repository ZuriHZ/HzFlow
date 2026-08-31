# Tasks: GitHub PRs in-app

## Phase 1 — Infrastructure (main / preload / types)

- [ ] 1.1 Create `electron/github/tokenStore.js` — load/save/clear token; `safeStorage` encrypt when available; session-memory fallback if unavailable (no plaintext disk)
- [ ] 1.2 Create `electron/github/openExternal.js` — parse URL; allowlist `https` + `github.com` (and needed GitHub hosts); wrap `shell.openExternal`; reject otherwise with `INVALID_URL`
- [ ] 1.3 Create `electron/github/deviceFlow.js` — start (device/code), poll (access_token), cancel/abort; map expiry/deny/cancel errors; never log token
- [ ] 1.4 Create `electron/github/api.js` — `getAuthenticatedUser`, `listPullRequests(filter)`, `getPullRequest(owner, repo, number)`; GitHub headers; map 401/403-rate/network → stable error codes
- [ ] 1.5 Create `electron/github/ipc.js` — register handlers: get-status, device-flow start/wait/cancel, logout, prs list/get, open-external; optional `login-pat` behind dev guard; never return access_token
- [ ] 1.6 Wire registration from `electron/main.js` on app ready (import ipc module only)
- [ ] 1.7 Extend `electron/preload.js` — `contextBridge` expose `electronAPI.github.*` matching design contract only
- [ ] 1.8 Add/extend `src/types/electron.d.ts` — `GithubApi`, DTOs, error codes
- [ ] 1.9 Document/configure `GITHUB_CLIENT_ID` (env dev + how main reads it); no client secret in repo/binary

## Phase 2 — UI (renderer)

- [ ] 2.1 Create `src/pages/prs.tsx` shell — layout states: unauthenticated | device-flow | loading | list | detail | error | empty
- [ ] 2.2 Device Flow UI — show `user_code`, copy-to-clipboard, open verification via bridge, cancel, retry on expiry/deny
- [ ] 2.3 PR list UI — title, repo, state, author, updatedAt, draft/labels if present; manual refresh; select item → detail
- [ ] 2.4 PR detail UI — title, body, state, repo, author, refs, timestamps, checks summary optional; back to list; "Abrir en GitHub"
- [ ] 2.5 Logout control on `/prs` (and clear local UI state)
- [ ] 2.6 Optional dev-only PAT entry — visible only in development; submit once via IPC; do not keep PAT in React state after submit

## Phase 3 — Wiring (app shell)

- [ ] 3.1 Register HashRouter route `/prs` in `src/App.jsx`
- [ ] 3.2 Add Sidebar nav item → `/prs`
- [ ] 3.3 Optional: GitHub status + logout snippet on `src/pages/config.tsx`
- [ ] 3.4 Guards: no list/detail API calls when `authenticated === false`; show connect CTA
- [ ] 3.5 User-visible messages for `RATE_LIMITED`, `NETWORK`, `UNAUTHENTICATED`, device-flow errors (no aggressive auto-retry loops)

## Phase 4 — Verification (smoke)

- [ ] 4.1 Device Flow happy path in dev (approve in browser → status authenticated)
- [ ] 4.2 Confirm token absent from renderer storage and IPC payloads (DevTools check)
- [ ] 4.3 List + empty + detail + refresh + open external allowlist (reject bad URL manually if testable)
- [ ] 4.4 Logout → re-auth required for list
- [ ] 4.5 Confirm no multi-window manager / no webview-primary path introduced
- [ ] 4.6 `npm run build` passes; isolation flags unchanged (`contextIsolation`, `sandbox`, `nodeIntegration: false`)

## Phase 5 — Cleanup / docs

- [ ] 5.1 Remove dead code / unused exports from github modules
- [ ] 5.2 Short README or comment block: OAuth App setup, scopes, `GITHUB_CLIENT_ID`, Device Flow UX
- [ ] 5.3 Align any open questions resolved during apply into proposal/spec notes if needed
- [ ] 5.4 Ready for `/sdd-verify` then archive (promote spec under `openspec/specs/github-prs/`)
