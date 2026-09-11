# Proposal: Refactor Estructura (Electron + React)

## Context
Actualmente, todo el código de Electron vive en `main.js` (177 líneas), lo que incluye la ventana, los menús, y la lógica de archivos de audio. El Frontend en React tiene una estructura básica y se requiere migrar a una arquitectura mixta (Componentes Globales + Features).

## Objectives
- Modularizar `electron/main.js` usando el patrón Controller/Service.
- Estructurar el Frontend en `src/` para soportar `features/`, separando la lógica de dominio (ej. `audio`) de los componentes genéricos.

## Affected Modules
- **Electron Main**: `electron/main.js` será refactorizado y se crearán `electron/core/windowManager.js`, `electron/ipc/audioHandlers.js`, `electron/ipc/windowHandlers.js`.
- **Renderer (React)**: Se reestructurará `src/` moviendo lógica a `src/features/audio/`, `src/hooks/`, `src/services/`, etc.

## Security Implications
- Se mantiene `contextIsolation: true` y `nodeIntegration: false` en todo momento (ya configurado en `main.js`). No hay cambios en la postura de seguridad, solo reorganización del código IPC.

## Rollback Plan
- Dado que los cambios son mayoritariamente de movimiento de archivos y refactorización estructural, el rollback consistirá simplemente en revertir los commits asociados en esta rama o eliminar la rama de refactorización si se detectan problemas críticos.
