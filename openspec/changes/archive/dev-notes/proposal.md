# Proposal: Dev Notes

## Intent

Los desarrolladores necesitan guardar rápidamente snippets, ideas, comandos, TODOs y descubrimientos del día a día. Actualmente esto se hace en apps externas (Notion, VS Code notes, post-its). Esta change agrega una sección nativa de notas con Markdown, code blocks con syntax highlighting y búsqueda rápida, integrada directamente en ZuriHZ.

## Scope

### In Scope

- Página/ruta `/notes` en el renderer con editor Markdown + preview
- CRUD completo de notas (crear, leer, actualizar, eliminar)
- Categorías/tags para organizar: snippets, ideas, debug, TIL (Today I Learned), TODO
- Búsqueda rápida con filtros (Ctrl+K global)
- Notas pinneadas (favoritas) que aparecen primero
- Code blocks con syntax highlighting (usar-highlight.js o prismjs ligero)
- Timestamps automáticos (creado, editado)
- Persistencia local en `app.getPath('userData')/notes.json`
- Entrada de navegación en Sidebar hacia Notes
- Estados UI: vacío, loading, error, resultados de búsqueda

### Out of Scope

- Editor WYSIWYG tipo Notion (solo Markdown puro)
- Sincronización entre dispositivos / cloud
- Colaboración multi-usuario
- Importación/exportar a otros formatos (Obsidian, Notion, etc.)
- Búsqueda full-text avanzada (solo substring match)
- Tags con autocompletado inteligente
- Versionado de notas

## Approach

Arquitectura de tres capas, consistente con el patrón existente del proyecto:

1. **Main (`electron/notes/`)**: CRUD en filesystem, lectura/escritura de `notes.json`, manejo de categorías
2. **Preload (`electron/preload.js`)**: expone `electronAPI.notes.{getAll, getById, create, update, delete, search}`
3. **Renderer**: nueva página `src/pages/notes.tsx` + feature `src/features/notes/` con components, hooks, store

Persistencia: archivo JSON en `app.getPath('userData')/notes.json` — sin base de datos, simple y portable.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `electron/main.js` | Modified | Registrar IPC handlers de notas |
| `electron/preload.js` | Modified | Exponer `electronAPI.notes.*` |
| `electron/notes/` (nuevo) | New | notesStore.js (CRUD) + ipc.js (handlers) |
| `src/App.jsx` | Modified | Ruta `/notes` |
| `src/components/layout/Sidebar.tsx` | Modified | Nav item Notes |
| `src/pages/notes.tsx` (nuevo) | New | Página principal de notas |
| `src/features/notes/` (nuevo) | New | components, hooks, store, types |
| `src/types/electron.d.ts` | Modified | Tipos del bridge de notas |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Archivo notes.json corrupto o inaccessible | Low | Try/catch en CRUD; backup automático antes de write |
| Notas con contenido sensible en JSON plain | Med | Considerar encriptación futura; por ahora documentar que no usar para secrets |
| Performance con muchas notas (>1000) | Low | Paginación en UI; lazy loading |
| Syntax highlighting agrega bundle size | Med | Usar highlight.js con lazy load o import dinámico |

## Rollback Plan

1. Revertir commits de la change (eliminar ruta `/notes`, nav item, handlers IPC y módulos `electron/notes/`)
2. Borrar `notes.json` de userData si se desea limpiar
3. No hay migraciones de DB; rollback es puramente de código

## Dependencies

- Electron 33 APIs: `app.getPath('userData')`, `fs`, `ipcMain.handle`
- highlight.js o prismjs para syntax highlighting (lazy loaded)
- Ninguna dependencia externa de backend

## Success Criteria

- [ ] Usuario puede crear, editar y eliminar notas con editor Markdown
- [ ] Las notas persisten entre sesiones (cerrar y reabrir app)
- [ ] Búsqueda rápida funciona con Ctrl+K
- [ ] Code blocks muestran syntax highlighting
- [ ] Notas pinneadas aparecen primero en la lista
- [ ] Sidebar tiene entrada funcional a `/notes`
- [ ] `contextIsolation` + `sandbox` se mantienen
- [ ] `npm run build` sigue pasando
