# Proposal: GitHub PRs in-app

## Intent

Los usuarios de ZuriHZ revisan Pull Requests en GitHub con frecuencia y hoy deben saltar al navegador constantemente. Esta change agrega una sección nativa en la app Electron para listar y revisar PRs propias (y filtrables) sin abandonar el desktop shell, con opción de abrir el PR completo en GitHub cuando haga falta.

## Scope

### In Scope

- Página/ruta `/prs` en el renderer (React + HashRouter) con listado y detalle básico de PRs
- Entrada de navegación en `Sidebar` hacia PRs
- Autenticación GitHub vía **Device Flow** (preferida) y **PAT opcional solo para desarrollo**
- Almacenamiento del token **solo en el proceso main**, cifrado con `safeStorage` (nunca en `localStorage` del renderer)
- Cliente GitHub API en **main process** (fetch a `api.github.com`)
- Bridge seguro en preload: `electronAPI.github.*` vía `contextBridge` + `ipcMain.handle`
- Acciones in-app: listar PRs, ver detalle (título, estado, repo, autor, labels, checks summary si está disponible), refresh
- Acción de soporte: `shell.openExternal` para "Abrir en GitHub"
- UI de conexión/desconexión de cuenta GitHub (en `/prs` y/o sección en `/config`)
- Manejo de estados: no autenticado, loading, vacío, error de red/API, rate limit

### Out of Scope

- Sistema multi-ventana, social windows, window manager
- Ventanas secundarias de auth (OAuth popup BrowserWindow) salvo que Device Flow resulte inviable; **preferir Device Flow sin ventanas extra**
- Embed de github.com vía `<webview>` como path principal de review
- Crear/editar/merge/close PRs desde la app
- Reviews con comentarios inline, CI logs completos, o diff viewer completo
- Notificaciones push de PRs / webhooks
- Integración con otros providers (GitLab, Bitbucket)
- Backend propio o base de datos
- Cambios a electron-builder identity / code signing

## Approach

Arquitectura híbrida de tres capas, alineada al shell actual (`contextIsolation: true`, `nodeIntegration: false`, `sandbox: true`):

1. **Main (`electron/main.js` + módulos GitHub)**: Device Flow + token en `safeStorage`; llamadas REST a GitHub; IPC handlers invokable.
2. **Preload (`electron/preload.js`)**: expone solo APIs tipadas `electronAPI.github.{getStatus, startDeviceFlow, cancelDeviceFlow, logout, listPullRequests, getPullRequest, openExternal}`.
3. **Renderer**: nueva página `src/pages/prs.tsx` (+ componentes locales), ruta en `App.jsx`, nav en `Sidebar`; consume solo el bridge (sin secrets).

Flujo UX: conectar cuenta → ver lista de PRs (default: assigned/created/review-requested del usuario) → abrir detalle in-app → opcionalmente "Abrir en GitHub".

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `electron/main.js` | Modified | Registrar IPC GitHub, `shell`, lifecycle token |
| `electron/preload.js` | Modified | Exponer `electronAPI.github.*` |
| `electron/github/` (nuevo) | New | Auth Device Flow, token store, API client |
| `src/App.jsx` | Modified | Ruta `/prs` |
| `src/components/layout/Sidebar.tsx` | Modified | Nav item PRs |
| `src/pages/prs.tsx` (nuevo) | New | Página listado/detalle/auth UX |
| `src/pages/config.tsx` | Modified (opcional menor) | Estado de sesión GitHub / logout |
| `src/types/electron.d.ts` (nuevo o extend) | New | Tipos del bridge |
| `package.json` | Modified (posible) | Deps mínimas si se agregan (ideal: cero; usar `fetch` nativo) |
| `openspec/specs/github-prs/` | New (al archivar) | Spec de dominio |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Token expuesto al renderer por IPC mal diseñado | Med | Nunca devolver el token al renderer; solo status booleano + login/user público |
| Rate limit GitHub API (no autenticado o abuso) | Med | Auth obligatoria para listar; cache corto en main; UI de rate-limit |
| Device Flow confuso para usuarios nuevos | Med | UI con user_code copiable, deep link de verificación, polling con cancel |
| `safeStorage` no disponible en algunos entornos | Low | Fallback documentado: no persistir / pedir re-auth; mensaje claro |
| Scope creep a multi-window / webview | Med | Scope explícito; openExternal solo para URLs https de github.com |
| Secretos en logs o errores IPC | Med | Sanitizar errores; no loguear Authorization headers |

## Rollback Plan

1. Revertir commits de la change (o eliminar ruta `/prs`, nav item, handlers IPC y módulos `electron/github/`).
2. Borrar token persistido (handler `logout` o borrar archivo de credentials de la app).
3. No hay migraciones de DB; rollback es puramente de código + limpiar credential store.
4. Si se publicó un build: ship hotfix quitando la entrada de menú y los handlers IPC.

## Dependencies

- Cuenta GitHub + OAuth App (o GitHub App) con Device Flow habilitado; Client ID configurable (env en dev / embebido no-secreto en main — **no client secret en public clients** para Device Flow)
- Electron 33 APIs: `safeStorage`, `shell.openExternal`, `ipcMain.handle`, `net`/`fetch`
- Red saliente a `github.com` y `api.github.com`
- Ninguna dependencia de multi-window ni de auth providers externos (Clerk, etc.)

## Success Criteria

- [ ] Usuario puede autenticarse con GitHub Device Flow sin ventanas secundarias de la app
- [ ] Token nunca es legible desde DevTools del renderer ni `localStorage`
- [ ] Usuario ve lista de sus PRs relevantes en `/prs` con refresh manual
- [ ] Usuario puede ver detalle básico de un PR y abrirlo en el navegador con "Abrir en GitHub"
- [ ] Usuario puede cerrar sesión y la lista deja de estar disponible hasta re-auth
- [ ] `contextIsolation` + `sandbox` se mantienen; `nodeIntegration` sigue en `false`
- [ ] No se introduce window manager ni webview de github.com como path principal
- [ ] `npm run build` sigue pasando tras la implementación
