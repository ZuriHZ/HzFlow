# Proposal: Auto-Update con Cloudflare R2

## Intent

ZuriHZ es una app Electron de escritorio que actualmente se distribuye manualmente (el usuario debe descargar e instalar el ejecutable cada vez que hay una nueva versión). Esta change agrega un sistema de **actualización automática** usando **Cloudflare R2** como servidor de distribución y **`electron-updater`** como cliente. El usuario recibe una notificación cuando hay una nueva versión, la descarga en segundo plano y reinicia la app para aplicarla — sin tener que ir a ninguna web.

## Scope

### In Scope

- Instalación y configuración de `electron-updater` en el proceso main
- Configuración de `publish` en electron-builder para Cloudflare R2 (provider `s3`)
- Módulo `electron/updater/` con lógica de chequeo, descarga y notificación
- IPC handlers para que el renderer pueda pedir "check for updates" y recibir estados
- Bridge en preload: `electronAPI.updater.*` (checkForUpdates, downloadUpdate, quitAndInstall)
- Componente React de notificación de actualización (badge, modal, o toast)
- Flujo completo: chequeo → notificación → descarga → reinicio
- Configuración de Cloudflare R2 (bucket público, API Token, endpoint)
- Documentación en `docs/auto-update-cloudflare-r2.md` (ya creada)
- Scripts de build y upload a R2

### Out of Scope

- GitHub Actions CI/CD automatizado (futuro)
- Firmado de código (code signing) — se mantiene sin firmar por ahora
- Actualización del proceso main de Electron (solo actualiza el contenido de la app)
- Multi-platform auto-update (solo Windows NSIS por ahora; Mac/Linux en futuro)
- Rollback automático si falla la actualización
- Notificaciones push fuera de la app
- Backend propio o base de datos para tracking de versiones
- Actualización de dependencias del sistema operativo

## Approach

Arquitectura de tres capas alineada al modelo de seguridad actual (`contextIsolation: true`, `nodeIntegration: false`, `sandbox: true`):

1. **Main (`electron/updater/`)**: Usa `electron-updater` con provider `s3` apuntando a Cloudflare R2. Escucha eventos de autoUpdater (checking, available, not-available, downloaded, error). Expone IPC handlers para control manual desde el renderer.

2. **Preload (`electron/preload.js`)**: Bridge mínimo `electronAPI.updater.*` vía `contextBridge`. Nunca expone credenciales de R2 ni tokens.

3. **Renderer (`src/`)**: Componente de notificación que muestra estado de la actualización. Botón "Buscar actualizaciones" en config o header. Modal de progreso de descarga. Botón "Reiniciar ahora" cuando la descarga termina.

**Flujo UX**: App se abre → chequeo automático en background → si hay versión nueva → badge/notificación → usuario presiona "Actualizar" → descarga en segundo plano → "Reiniciar ahora" → app se cierra y se reabre actualizada.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `electron/updater/` (nuevo) | New | Módulo de auto-update: config, handlers, eventos |
| `electron/main.js` | Modified | Importar y registrar updater on app ready |
| `electron/preload.js` | Modified | Exponer `electronAPI.updater.*` |
| `electron/ipc/updaterHandlers.js` (nuevo) | New | IPC handlers para updater |
| `src/components/updater/` (nuevo) | New | Componentes React de notificación/progreso |
| `src/pages/config.tsx` | Modified | Sección de actualizaciones (check manual) |
| `src/types/electron.d.ts` | Modified | Tipos del bridge updater |
| `package.json` | Modified | Dep: `electron-updater`; config `publish` |
| `docs/auto-update-cloudflare-r2.md` | New | Documentación del sistema |
| `scripts/upload-to-r2.js` (nuevo) | New | Script para subir builds a R2 |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| `electron-updater` falla al conectar con R2 | Med | Configurar timeout, reintentos, y UI de error clara |
| Credenciales de R2 expuestas en el binario | Bajo | API Token con permisos solo lectura/escritura en bucket específico; nunca exponer en renderer |
| Actualización corrupta o incompleta | Bajo | electron-updater valida SHA512 automáticamente; si falla, no aplica |
| Windows SmartScreen bloquea el instalador | Alto | Sin code signing es esperado; documentar que el usuario debe "Ejecutar de todas formas" |
| Bucket R2 configurado incorrectamente | Med | Testear con un build de prueba antes del primer release |
| Version mismatch (package.json vs R2) | Med | Script de build actualiza versión automáticamente; CI futura lo valida |

## Rollback Plan

1. Eliminar la sección `publish` de electron-builder config
2. Remover dependencia `electron-updater`
3. Eliminar módulo `electron/updater/` y handlers IPC
4. Remover componente de notificación del renderer
5. No hay migraciones de DB; rollback es puramente de código
6. La app sigue funcionando sin auto-update (distribución manual como antes)

## Dependencies

- **Cloudflare R2**: Bucket `zurihz-updates` creado y público con API Token
- **electron-updater**: Librería oficial de Electron (dependencia npm)
- **electron-builder**: Ya presente en devDependencies
- **Red saliente**: La app necesita acceso a `https://...r2.cloudflarestorage.com`
- Ninguna dependencia de backend propio ni de servicios externos adicionales

## Success Criteria

- [ ] Al abrir la app, se chequea automáticamente si hay versión nueva en R2
- [ ] Si hay versión nueva, el usuario ve una notificación/badge claro
- [ ] El usuario puede presionar "Buscar actualizaciones" manualmente desde config
- [ ] La descarga se realiza en segundo plano con barra de progreso
- [ ] Cuando la descarga termina, aparece "Reiniciar ahora"
- [ ] Al reiniciar, la app se cierra, aplica la actualización y se reabre
- [ ] Si no hay versión nueva, se muestra "Estás en la última versión"
- [ ] Si hay error de red o de R2, se muestra un mensaje claro sin crashear
- [ ] Las credenciales de R2 nunca son visibles en DevTools ni en el renderer
- [ ] `npm run build` sigue pasando tras la implementación
