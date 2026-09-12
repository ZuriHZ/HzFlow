# Proposal: Ventanas Externas con Diseño Custom

## Intent

Cuando el usuario hace clic en links externos (`target="_blank"`) o la app necesita crear una nueva ventana, actualmente no hay handler configurado — los links están bloqueados y no se abren en ningún lado. Esta change implementa ventanas externas custom que reemplazan el chrome default de Electron por un diseño minimalista coherente con la ventana principal de ZuriHZ.

## Scope

### In Scope

- Interceptar `window.open()` / `target="_blank"` en el main process usando `setWindowOpenHandler`
- Crear función `createExternalWindow(url)` en un nuevo módulo `electron/core/externalWindowManager.js`
- BrowserWindow custom: `frame: false`, mismo `backgroundColor`, dimensions reducidas (900×700)
- Title bar simplificado para ventanas externas: solo botón cerrar (sin minimize/maximize, para no confundir con la ventana principal)
- HTML liviano (`electron/external/external.html`) con `<webview>` que cargue la URL externa
- CSS hereda los mismos design tokens de la app principal (mismo background, colores, tipografía)
- Preload dedicado (`electron/external/externalPreload.js`) que exponga solo `closeWindow()`
- Canales IPC para control de ventana externa (`external:close`)
- Manejo de errores: webview failed-to-load, URLs inválidas

### Out of Scope

- Reusar el renderer de React para ventanas externas (cargan contenido web externo, no son parte de la app)
- Navegación dentro del webview (back/forward/refresh) — se puede agregar después
- Múltiples ventanas externas con estado compartido
- Ventanas "detached" que se salgan de la app completamente
- Cambios al TitleBar de la ventana principal

## Approach

Arquitectura de separación limpia: las ventanas externas son BrowserWindow independientes con su propio HTML/CSS/preload, sin conexión al renderer principal.

1. **Main (`electron/core/externalWindowManager.js`)** — Función factory `createExternalWindow(url)` que crea BrowserWindow con configuración de diseño custom, maneja eventos de cierre y referencia de ventanas abiertas.
2. **Preload externo (`electron/external/externalPreload.js`)** — Bridge mínimo: solo expone `closeWindow()` vía contextBridge.
3. **HTML externo (`electron/external/external.html`)** — Página autocontenida con title bar simplificado + `<webview>` que carga la URL solicitada.
4. **Interceptación** — `setWindowOpenHandler()` en windowManager.js redirige todos los `window.open()` a `createExternalWindow()`.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `electron/core/externalWindowManager.js` (nuevo) | New | Factory de BrowserWindow externas |
| `electron/external/external.html` (nuevo) | New | HTML template para ventanas externas |
| `electron/external/external.css` (nuevo) | New | Estilos de la ventana externa (tokens heredados) |
| `electron/external/externalPreload.js` (nuevo) | New | Preload dedicado para ventanas externas |
| `electron/core/windowManager.js` | Modified | Agregar `setWindowOpenHandler()` |
| `electron/ipc/windowHandlers.js` | Modified | Registrar canal `external:close` |
| `src/index.css` | Modified (opcional menor) | Exportar CSS variables para uso externo si es necesario |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Webview carga contenido malicioso | Med | Configurar `webviewTag: false` en ventanas externas; usar `BrowserWindow.loadURL` directo en vez de `<webview>` (evaluar) |
| Múltiples ventanas externas abiertas consumen memoria | Med | Límite implícito de 5 ventanas; cerrar referencias al `closed` event |
| CSS de ventana externa se desincroniza de la principal | Low | Usar los mismos CSS variables hardcodeados en el HTML externo |
| URLs con protocolos peligrosos (`file://`, `javascript:`) | Med | Validar en `setWindowOpenHandler`: solo `https:` permitido |
| Ventanas externas no respetan el theme de la app | Low | HTML externo carga paleta oscura fija (la app es dark por defecto) |

## Rollback Plan

1. Eliminar `electron/core/externalWindowManager.js`, `electron/external/` (html, css, preload).
2. Remover `setWindowOpenHandler()` de `windowManager.js`.
3. Remover canal `external:close` de `windowHandlers.js`.
4. Los links `target="_blank"` volverán a estar bloqueados (comportamiento actual).
5. No hay migraciones de DB ni cambios en el renderer.

## Dependencies

- Electron 33 APIs: `BrowserWindow`, `setWindowOpenHandler`, `contextBridge`, `ipcMain`
- No nuevas dependencias npm
- Webview tag NO se requiere (usar `loadURL` directo en BrowserWindow externo)

## Success Criteria

- [ ] Links `target="_blank"` abren una ventana externa con diseño custom (sin chrome de Electron)
- [ ] La ventana externa tiene title bar minimalista solo con botón cerrar
- [ ] Mismo background color y paleta que la ventana principal
- [ ] Cerrar ventana funciona con el botón X del title bar
- [ ] URLs con protocolo `https:` se cargan correctamente
- [ ] URLs con protocolos peligrosos (`file://`, `javascript:`) son rechazadas
- [ ] Las ventanas externas se crean con `contextIsolation: true` y `sandbox: true`
- [ ] No se rompe el comportamiento de la ventana principal
- [ ] `npm run build` sigue pasando
