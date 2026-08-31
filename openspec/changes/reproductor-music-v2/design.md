# Design: Reproductor de Música v2

## Technical Approach

Extracción de metadata ID3 en el main process usando `music-metadata-browser`, retornando datos junto con el buffer de audio via IPC. El renderer consume la metadata para mostrar título real, artista, portada y duración.

## Architecture Decisions

### Decision: music-metadata-browser para ID3

**Choice**: `music-metadata-browser`
**Alternatives considered**: `jsmediatags` (menos maintained), extracción manual
**Razón**: API moderna, soporta mp3/wav/ogg/m4a, extrae cover como Uint8Array, browser-compatible

### Decision: Metadata en main process

**Choice**: Extraer metadata en `electron/main.js` al leer el archivo
**Alternatives considered**: Extraer en renderer (más carga en UI thread)
**Razón**: El main process ya lee el archivo para el buffer; una sola pasada de lectura

### Decision: Cover como data URL

**Choice**: Convertir cover image a base64 data URL en main process
**Alternatives considered**: Blob URL, URL temporal
**Razón**: Data URL es serializable via IPC, se cachea en el store, sin problemas de lifecycle

## Data Flow

```
Renderer (musica.tsx)
  │ invoke("get-audio-data", filePath)
  ▼
Main Process (main.js)
  │ fs.promises.readFile(filePath)
  │ music-metadata.parseBuffer(buffer)
  │ extraer: title, artist, album, picture, duration
  │ convertir picture → base64 data URL
  ▼
IPC Response: { buffer: Uint8Array, metadata: { title, artist, album, cover, duration } }
  │
  ▼
Renderer
  │ Crear Blob URL del buffer → audio element src
  │ Usar metadata para Song object
  │ Mostrar cover en disco giratorio
  │ Mostrar duration en playlist
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `package.json` | Modify | Agregar dependencia `music-metadata-browser` |
| `electron/main.js` | Modify | Async fs, import music-metadata, extraer metadata en `get-audio-data` |
| `src/store/usePlayerStore.ts` | Modify | Extender Song interface con artist, album, cover, duration |
| `src/pages/musica.tsx` | Modify | Consumir metadata, mostrar artista/portada/duración, fix buttons |
| `global.d.ts` | Modify | Completar tipos ElectronAPI |
| `electron/preload.js` | No change | No se exponen nuevos métodos |

## Interfaces / Contracts

```typescript
// Song interface extendida
interface Song {
  src: string
  filePath: string
  title: string
  artist?: string
  album?: string
  cover?: string    // base64 data URL o null
  duration?: number // segundos
}

// IPC Response de get-audio-data
interface AudioDataResponse {
  buffer: number[]     // Uint8Array serializado
  metadata: {
    title: string
    artist?: string
    album?: string
    cover?: string     // data URL
    duration?: number  // segundos
  }
}
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Smoke | Reproductor carga, reproduce, muestra metadata real | Manual: `npm run dev` |
| Build | Sin errores TypeScript | `npm run build` |
| Integration | IPC retorna metadata correcta | Verificar en consola del renderer |

## Migration / Rollout

No migration required. Campo `src` se mantiene por compatibilidad pero se marca como deprecated.

## Open Questions

- [ ] ¿Qué bitrate usar para cover art? (Default: 300x300 px máximo)
