# Proposal: Project Organizer

## Intent

Los desarrolladores trabajan con múltiples proyectos y necesitan acceso rápido, estado del repo, y acciones como abrir en VS Code o terminal. Actualmente esto se hace navegando el file explorer del SO. Esta change agrega un dashboard de proyectos con detección automática de stack, estado de git, y quick actions.

## Scope

### In Scope

- Página/ruta `/projects` en el renderer con dashboard de proyectos
- Agregar proyectos via file picker (`dialog.showOpenDialog`)
- Lista de proyectos con metadata: nombre, path, stack detectado, último acceso
- Detección automática de stack: lee `package.json` (framework, lenguaje), `.gitignore`, archivos de config
- Quick actions: Abrir en VS Code (`code .`), abrir en terminal, abrir folder en Explorer
- Estado del repo: branch actual, commits ahead/behind (via git CLI o isomorphic-git)
- Badges visuales: framework (React, Vue, Angular), lenguaje (TS, JS), último commit
- Filtros y búsqueda por nombre, stack,tag
- Persistencia local en `app.getPath('userData')/projects.json`
- Entrada de navegación en Sidebar hacia Projects
- Confirmación antes de eliminar proyecto de la lista

### Out of Scope

- Editor de código integrado
- Terminal integrada (solo openExternal a terminal del SO)
- Git graph viewer / diff viewer
- Crear proyectos nuevos desde la app
- CI/CD status de proyectos
- Monorepo support avanzado
- Métricas de código (LOC, complejidad, etc.)

## Approach

Arquitectura de tres capas:

1. **Main (`electron/projects/`)**: CRUD en filesystem, ejecución de comandos git, detección de stack, apertura de apps externas
2. **Preload (`electron/preload.js`)**: expone `electronAPI.projects.{getAll, add, remove, openInVSCode, openInTerminal, openInExplorer, getGitInfo}`
3. **Renderer**: nueva página `src/pages/projects.tsx` + feature `src/features/projects/`

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `electron/main.js` | Modified | Registrar IPC handlers de proyectos |
| `electron/preload.js` | Modified | Exponer `electronAPI.projects.*` |
| `electron/projects/` (nuevo) | New | projectsStore.js, gitInfo.js, stackDetector.js, ipc.js |
| `src/App.jsx` | Modified | Ruta `/projects` |
| `src/components/layout/Sidebar.tsx` | Modified | Nav item Projects |
| `src/pages/projects.tsx` (nuevo) | New | Dashboard de proyectos |
| `src/features/projects/` (nuevo) | New | components, hooks, store, types |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Git CLI no disponible en PATH | Med | Fallback: mostrar info básica sin git; tooltip de error |
| Proyecto eliminado del disco | Med | Validar existencia al listar; marcar como "missing" |
| Detección de stack incorrecta | Low | Heurísticas simples; permitir override manual |
| Permisos de filesystem | Low | Usar dialog.showOpenDialog que maneja permisos |

## Rollback Plan

1. Revertir commits de la change
2. Borrar `projects.json` de userData
3. No hay migraciones de DB

## Dependencies

- Electron 33 APIs: `dialog.showOpenDialog`, `shell.openExternal`, `child_process.exec`
- Git CLI en PATH (para info de repo)
- isomorphic-git como alternativa sin CLI (futuro)

## Success Criteria

- [ ] Usuario puede agregar proyectos via file picker
- [ ] Dashboard muestra lista con metadata y badges de stack
- [ ] Quick actions abren VS Code, terminal, y Explorer correctamente
- [ ] Info de git (branch, ahead/behind) se muestra cuando disponible
- [ ] Proyectos persisten entre sesiones
- [ ] Búsqueda y filtros funcionan
- [ ] `npm run build` sigue pasando
