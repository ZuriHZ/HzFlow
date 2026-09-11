# Tasks: Refactor Estructura (Electron + React)

## Phase 1: Electron Main Process Refactor

- [ ] **1.1** Crear carpeta `electron/core` y `electron/ipc`.
- [ ] **1.2** Mover la lógica de creación de ventana y menú de `main.js` a `electron/core/windowManager.js`.
- [ ] **1.3** Mover los handlers de audio (`select-music-files`, `process-dropped-files`, `get-audio-data`) a `electron/ipc/audioHandlers.js`.
- [ ] **1.4** Mover los handlers de ventana (`close-window`, `minimize-window`, `toggle-maximize-window`, `devtools`) a `electron/ipc/windowHandlers.js`.
- [ ] **1.5** Importar e inicializar todo limpiamente en `electron/main.js`.
- [ ] **1.6** Verificar que la app (backend) levante y los botones de la barra de título sigan funcionando.

## Phase 2: Frontend Restructuring

- [ ] **2.1** Crear estructura base en `src/`: `src/features/audio/components`, `src/features/audio/services`, `src/features/audio/store`.
- [ ] **2.2** Asegurarse que existan `src/components`, `src/hooks`, `src/services`, `src/store`.
- [ ] **2.3** Mover la lógica relacionada al audio a `src/features/audio/`. (Ej: `useAudioPlayers.ts` debería ir a `src/features/audio/hooks/` o `src/hooks/` si es muy general).
- [ ] **2.4** Mover componentes de UI puros (botones, contenedores layout) a `src/components/`.
- [ ] **2.5** Refactorizar importaciones en los archivos afectados (React).
- [ ] **2.6** Ejecutar `npm run dev` para verificar que Vite compile sin errores y la UI cargue correctamente.

## Phase 3: Testing & Cleanup

- [ ] **3.1** Realizar una prueba manual cargando archivos de audio mediante arrastrar/soltar y seleccionar.
- [ ] **3.2** Limpiar archivos vacíos, dependencias sin uso en `package.json` si las hubiera.
- [ ] **3.3** Ejecutar un build de producción (`npm run build`) para garantizar que la nueva estructura empaqueta bien.
