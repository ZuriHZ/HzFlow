# Proposal: Reproductor de Música v2

## Intent

El reproductor de música actual tiene funcionalidad básica pero presenta bugs (botones Next/Prev con shuffle/repeat), metadata hardcodeada ("Desconocido"), código muerto (`local-audio://`), y faltan features esenciales como extracción de ID3 tags, portada de álbum, mediaSession, y búsqueda. Este cambio resuelve los bugs críticos y agrega metadata real de los archivos de audio.

## Scope

### In Scope
- Completar declaraciones TypeScript de `global.d.ts`
- Corregir comportamiento de botones Next/Prev con shuffle/repeat
- Eliminar código muerto del protocolo `local-audio://`
- Fix de race condition al cambiar canción rápidamente
- Extracción de metadata ID3 (título, artista, álbum, portada, duración)
- Mostrar metadata real en UI (Now Playing + playlist)
- Mostrar portada de álbum o fallback a ícono
- Convertir `fs.readFileSync` a async

### Out of Scope
- MediaSession / controles del SO (Phase 3)
- Atajos de teclado (Phase 3)
- Búsqueda en playlist (Phase 3)
- Tiempo restante (Phase 3)
- Múltiples playlists, crossfade, ecualizador

## Approach

Fase 1: Fixes de bugs y limpieza de código muerto + tipos completos.
Fase 2: Instalar `music-metadata-browser`, extraer metadata en main process via IPC, extender interfaz Song, mostrar en UI.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/pages/musica.tsx` | Modified | Fix buttons, mostrar metadata, portada |
| `src/store/usePlayerStore.ts` | Modified | Extender interfaz Song |
| `electron/main.js` | Modified | Async fs, metadata extraction |
| `electron/preload.js` | Modified | Exponer si aplica |
| `global.d.ts` | Modified | Completar tipos |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| `music-metadata-browser` no soporta algún formato | Low | Fallback a filename como title |
| Archivos grandes causan memory issues | Low | Solo se extrae metadata, no se copia buffer completo |
| Race condition no se resuelve completamente | Low | Usar AbortController o debounce |

## Rollback Plan

Revertir los commits de Phase 1 y Phase 2. No hay cambios de schema ni migraciones.

## Success Criteria

- [ ] Canciones muestran título real y artista (no "Desconocido")
- [ ] Portada de álbum se muestra cuando el tag existe
- [ ] Next funciona correctamente con repeat activado
- [ ] Prev se deshabilita con shuffle activado
- [ ] `npm run build` pasa sin errores
- [ ] Main process no se bloquea con archivos grandes
