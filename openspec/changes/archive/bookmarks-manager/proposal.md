# Proposal: Bookmarks Manager

## Intent

Los desarrolladores acumulan links útiles (docs, Stack Overflow, repos, tools) dispersos en bookmarks del navegador, notas, chats. Esta change agrega un manager de bookmarks integrado en ZuriHZ con categorías, búsqueda, y apertura en ventana externa (integra con `external-windows`).

## Scope

### In Scope

- Página/ruta `/bookmarks` en el renderer con lista de bookmarks
- Guardar URL + título + tags + notas + categoría
- Categorías predefinidas: Docs, Tools, Stack Overflow, Design, Learning, Other
- Preview de metadata del link (título, favicon via fetch o meta tags)
- Abrir link en ventana externa custom (integra con change `external-windows`)
- Importar/exportar bookmarks (JSON)
- Búsqueda y filtros por categoría, tags, texto
- Persistencia local en `app.getPath('userData')/bookmarks.json`
- Entrada de navegación en Sidebar hacia Bookmarks
- Editar y eliminar bookmarks

### Out of Scope

- Reader mode / modo lectura para artículos
- Archivado automático de links leídos
- Sync con bookmarks del navegador
- Preview de contenido de la página (solo metadata básica)
- Tags con autocompletado
- Carpetas/anidamiento de bookmarks
- Compartir bookmarks con otros usuarios

## Approach

Arquitectura de tres capas:

1. **Main (`electron/bookmarks/`)**: CRUD en filesystem, fetch de metadata de URLs, apertura de ventana externa
2. **Preload**: expone `electronAPI.bookmarks.{getAll, create, update, delete, import, export, fetchMetadata, openInWindow}`
3. **Renderer**: nueva página `src/pages/bookmarks.tsx` + feature `src/features/bookmarks/`

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `electron/main.js` | Modified | Registrar IPC handlers de bookmarks |
| `electron/preload.js` | Modified | Exponer `electronAPI.bookmarks.*` |
| `electron/bookmarks/` (nuevo) | New | bookmarksStore.js, metadataFetcher.js, ipc.js |
| `src/App.jsx` | Modified | Ruta `/bookmarks` |
| `src/components/layout/Sidebar.tsx` | Modified | Nav item Bookmarks |
| `src/pages/bookmarks.tsx` (nuevo) | New | Página principal |
| `src/features/bookmarks/` (nuevo) | New | components, hooks, store, types |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Fetch de metadata falla por CORS/bloqueo | Med | Fallback: usar solo URL como título; metadata es opcional |
| Muchos bookmarks afectan performance | Low | Paginación; lazy loading |
| Ventana externa no disponible (external-windows no implementado) | Med | Fallback: `shell.openExternal` al navegador |

## Rollback Plan

1. Revertir commits de la change
2. Borrar `bookmarks.json` de userData
3. No hay migraciones de DB

## Dependencies

- Electron 33 APIs: `shell.openExternal`, `ipcMain.handle`, `net.fetch`
- Change `external-windows` para apertura en ventana custom (opcional, fallback a navegador)
- `app.getPath('userData')` para persistencia

## Success Criteria

- [ ] Usuario puede crear, editar y eliminar bookmarks con URL, título, tags, categoría
- [ ] Bookmarks persisten entre sesiones
- [ ] Búsqueda y filtros por categoría funcionan
- [ ] Importar/exportar JSON funciona
- [ ] Metadata básica se obtiene al agregar bookmark
- [ ] Links se abren en ventana externa o navegador
- [ ] `npm run build` sigue pasando
