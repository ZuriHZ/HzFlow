# Tasks: Auto-Update con Cloudflare R2

## Phase 1 — Infrastructure (main process)

- [ ] 1.1 Install `electron-updater` dependency
- [ ] 1.2 Create `electron/updater/config.js` — autoUpdater config with S3 provider pointing to R2 bucket; autoDownload=false; autoInstallOnAppQuit=false
- [ ] 1.3 Create `electron/updater/handlers.js` — Event listeners for autoUpdater (checking-for-update, update-available, update-not-available, download-progress, update-downloaded, error); emit IPC events to renderer
- [ ] 1.4 Create `electron/updater/index.js` — initAutoUpdater() function; exports for main.js
- [ ] 1.5 Create `electron/ipc/updaterHandlers.js` — IPC handlers: check-for-update, download-update, quit-and-install; channel registration
- [ ] 1.6 Wire updater init from `electron/main.js` on app ready (after window created)

## Phase 2 — Preload bridge

- [ ] 2.1 Extend `electron/preload.js` — expose `electronAPI.updater.*` via contextBridge: checkForUpdates, downloadUpdate, quitAndInstall, on* event listeners
- [ ] 2.2 Verify contextIsolation + sandbox remain unchanged

## Phase 3 — Renderer UI

- [ ] 3.1 Create `src/hooks/useUpdater.ts` — Hook that subscribes to updater IPC events; exposes state (idle/checking/available/downloading/downloaded/error), progress, version info, and action functions
- [ ] 3.2 Create `src/components/updater/UpdateNotification.tsx` — Badge/button that shows "New version available" when state=available; clickable to trigger download
- [ ] 3.3 Create `src/components/updater/UpdateProgress.tsx` — Progress bar component showing download percentage; visible when state=downloading
- [ ] 3.4 Create `src/components/updater/UpdateReady.tsx` — Modal/panel shown when state=downloaded; "Restart now" button
- [ ] 3.5 Create `src/components/updater/index.ts` — Barrel exports
- [ ] 3.6 Integrate updater notification in layout (header or sidebar) — always visible when update is available
- [ ] 3.7 Add "Check for updates" section in `src/pages/config.tsx` — manual check button + current version display

## Phase 4 — Type definitions

- [ ] 4.1 Extend `src/types/electron.d.ts` — UpdaterState, UpdaterInfo, UpdaterProgress, UpdaterError, UpdaterApi types

## Phase 5 — Build config & upload

- [ ] 5.1 Update `package.json` — add `publish` config for S3/R2 provider; add `electron-updater` to dependencies
- [ ] 5.2 Create `scripts/upload-to-r2.js` — Node.js script using @aws-sdk/client-s3 to upload release files + latest.yml to R2 bucket
- [ ] 5.3 Create `.env.example` — R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME

## Phase 6 — Wiring & integration

- [ ] 6.1 Verify `npm run build` passes with new dependency
- [ ] 6.2 Verify updater module loads correctly in dev mode (npm run dev)
- [ ] 6.3 Test: updater checks R2 on startup (check console logs)
- [ ] 6.4 Test: manual check from config page works
- [ ] 6.5 Test: notification appears when update is available (simulate with lower version)

## Phase 7 — Verification (smoke)

- [ ] 7.1 Auto-check on app start works (logs show checking → available/not-available)
- [ ] 7.2 Manual check from config works
- [ ] 7.3 Download progress is reported to renderer
- [ ] 7.4 "Restart now" triggers quitAndInstall
- [ ] 7.5 Error states are handled gracefully (no crash)
- [ ] 7.6 Credentials not visible in DevTools or IPC responses
- [ ] 7.7 `npm run build` still passes
- [ ] 7.8 `pnpm dist` generates installers correctly

## Phase 8 — Cleanup / docs

- [ ] 8.1 Update docs/auto-update-cloudflare-r2.md with any implementation changes
- [ ] 8.2 Add README section about auto-update setup
- [ ] 8.3 Ready for verification then archive
