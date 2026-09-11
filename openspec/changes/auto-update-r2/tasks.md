# Tasks: Auto-Update con Cloudflare R2

## Phase 1 — Infrastructure (main process)

- [x] 1.1 Install `electron-updater` dependency
- [x] 1.2 Create `electron/updater/config.js` — autoUpdater config with generic provider pointing to r2.dev public URL; autoDownload=false; autoInstallOnAppQuit=false; forceDevUpdateConfig=true
- [x] 1.3 Create `electron/updater/handlers.js` — Event listeners for autoUpdater (checking-for-update, update-available, update-not-available, download-progress, update-downloaded, error); emit IPC events to renderer
- [x] 1.4 Create `electron/updater/index.js` — initAutoUpdater() function; exports for main.js
- [x] 1.5 Create `electron/ipc/updaterHandlers.js` — IPC handlers: check-for-update, download-update, quit-and-install; channel registration
- [x] 1.6 Wire updater init from `electron/main.js` on app ready (after window created)

## Phase 2 — Preload bridge

- [x] 2.1 Extend `electron/preload.js` — expose `electronAPI.updater.*` via contextBridge: checkForUpdates, downloadUpdate, quitAndInstall, on* event listeners
- [x] 2.2 Verify contextIsolation + sandbox remain unchanged

## Phase 3 — Renderer UI

- [x] 3.1 Create `src/features/updater/hooks/useUpdater.ts` — Hook that subscribes to updater IPC events; exposes state (idle/checking/available/downloading/downloaded/error), progress, version info, and action functions
- [x] 3.2 Create `src/features/updater/components/UpdateNotification.tsx` — Badge/button that shows "New version available" when state=available; clickable to trigger download
- [x] 3.3 Create `src/features/updater/components/UpdateProgress.tsx` — Progress bar component showing download percentage; visible when state=downloading
- [x] 3.4 Create `src/features/updater/components/UpdateReady.tsx` — Modal/panel shown when state=downloaded; "Restart now" button
- [x] 3.5 Create `src/features/updater/components/index.ts` — Barrel exports
- [ ] 3.6 Integrate updater notification in layout (header or sidebar) — always visible when update is available
- [x] 3.7 Add "Check for updates" section in `src/pages/config.tsx` — manual check button + current version display

## Phase 4 — Type definitions

- [x] 4.1 Extend `global.d.ts` — UpdaterState, UpdaterInfo, UpdaterProgress, UpdaterError, UpdaterApi types

## Phase 5 — Build config & upload

- [x] 5.1 Update `package.json` — add `publish` config for generic provider (r2.dev URL); add `electron-updater` to dependencies
- [x] 5.2 Create `scripts/upload-to-r2.ts` — TypeScript script using @aws-sdk/client-s3 to upload release files + latest.yml to R2 bucket
- [x] 5.3 Create `.env.example` — R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME

## Phase 6 — Wiring & integration

- [x] 6.1 Verify `pnpm build` passes with new dependency
- [x] 6.2 Verify updater module loads correctly in dev mode (pnpm dev)
- [x] 6.3 Test: updater checks R2 on startup (check console logs)
- [x] 6.4 Test: manual check from config page works
- [x] 6.5 Test: notification appears when update is available

## Phase 7 — Verification (smoke)

- [x] 7.1 Auto-check on app start works (logs show checking → available/not-available)
- [x] 7.2 Manual check from config works
- [x] 7.3 Download progress is reported to renderer
- [x] 7.4 "Restart now" triggers quitAndInstall (fixed: isForceRunAfter=true, isSilent=false)
- [ ] 7.5 Error states are handled gracefully (no crash)
- [x] 7.6 Credentials not visible in DevTools or IPC responses
- [x] 7.7 `pnpm build` still passes
- [x] 7.8 `pnpm dist` generates installers correctly

## Phase 8 — Cleanup / docs

- [ ] 8.1 Update docs/auto-update-cloudflare-r2.md with any implementation changes
- [ ] 8.2 Add README section about auto-update setup
- [x] 8.3 Ready for verification then archive
