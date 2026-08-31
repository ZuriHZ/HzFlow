# Tasks: Reproductor de Música v2

## Phase 1: Fundamentos y Fixes

- [x] 1.1 Completar `global.d.ts` con todos los métodos de `electronAPI` (selectMusicFiles, processDroppedFiles, getAudioData, window controls)
- [x] 1.2 Corregir botón Next en `src/pages/musica.tsx`: habilitar cuando `isRepeat` está activo (remover `disabled` en última canción si repeat)
- [x] 1.3 Corregir botón Prev en `src/pages/musica.tsx`: deshabilitar cuando `isShuffle` está activo
- [x] 1.4 Eliminar código muerto: remover registro de protocolo `local-audio://` en `electron/main.js` y campo `src` de `formatSongPath`
- [x] 1.5 Limpiar comentario desactualizado línea 142-143 en `musica.tsx`
- [x] 1.6 Fix race condition: usar AbortController o flag para cancelar blob load previo al cambiar canción

## Phase 2: Metadata ID3 y Portada

- [x] 2.1 Instalar `music-metadata-browser` via npm
- [x] 2.2 Extender interfaz `Song` en `usePlayerStore.ts`: agregar artist, album, cover, duration
- [x] 2.3 Crear función `extractMetadata` en `electron/main.js` usando music-metadata
- [x] 2.4 Modificar handler IPC `get-audio-data` para retornar metadata junto con buffer
- [x] 2.5 Actualizar `formatSongPath` o eliminarlo (usar metadata del IPC)
- [x] 2.6 Mostrar artista real en Now Playing y playlist rows
- [x] 2.7 Mostrar portada de álbum en disco giratorio (o fallback a IconMusic)

## Phase 3: Verificación (post-commit)

- [ ] 3.1 Smoke test: `npm run dev` — reproductor carga, reproduce, muestra metadata
- [ ] 3.2 Build test: `npm run build` — sin errores TypeScript
