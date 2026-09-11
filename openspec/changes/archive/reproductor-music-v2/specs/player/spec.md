# Player Specification

## Purpose

Especificación del dominio del reproductor de música: reproducción de audio local, gestión de playlist, controles de playback y visualización de metadata.

## Requirements

### Requirement: Metadata ID3

The system SHALL extract title, artist, album, cover art, and duration from audio file ID3 tags.

#### Scenario: Archivo con metadata válida

- GIVEN un archivo MP3 con tags ID3 válidos (título "Hello", artista "Adele")
- WHEN el usuario agrega el archivo a la playlist
- THEN la canción se muestra con título "Hello" y artista "Adele" en la playlist
- AND la duración se muestra en formato mm:ss

#### Scenario: Archivo sin metadata

- GIVEN un archivo de audio sin tags ID3
- WHEN el usuario agrega el archivo a la playlist
- THEN la canción se muestra con el nombre del archivo como título
- AND el artista se muestra como "Desconocido"

#### Scenario: Archivo corrupto o inválido

- GIVEN un archivo que no se puede leer como audio
- WHEN el usuario intenta agregarlo
- THEN el archivo se omite silenciosamente

### Requirement: Cover Art

The system SHALL display album artwork from ID3 tags, or fallback to IconMusic.

#### Scenario: Archivo con portada

- GIVEN un archivo MP3 con imagen ID3 embebida
- WHEN la canción está reproduciéndose
- THEN el disco giratorio muestra la imagen del álbum

#### Scenario: Archivo sin portada

- GIVEN un archivo sin imagen ID3
- WHEN la canción está reproduciéndose
- THEN el disco giratorio muestra el ícono IconMusic como fallback

### Requirement: Next Button con Repeat

The system SHALL enable the Next button when repeat mode is active, even on the last song.

#### Scenario: Repeat ON, última canción

- GIVEN repeat activado y reproduciendo la última canción de la playlist
- WHEN el usuario presiona Next
- THEN la reproducción vuelve a la primera canción de la playlist

#### Scenario: Repeat OFF, última canción

- GIVEN repeat desactivado y reproduciendo la última canción
- WHEN se observa el botón Next
- THEN el botón Next está deshabilitado

### Requirement: Prev Button con Shuffle

The system SHALL disable the Prev button when shuffle mode is active.

#### Scenario: Shuffle ON

- GIVEN shuffle activado
- WHEN se observa el botón Prev
- THEN el botón Prev está deshabilitado

#### Scenario: Shuffle OFF

- GIVEN shuffle desactivado
- WHEN el usuario presiona Prev
- THEN la reproducción avanza a la canción anterior (currentIndex - 1)

### Requirement: Async File Read

The system SHALL use async file I/O in the main process to avoid blocking the event loop.

#### Scenario: Archivo grande

- GIVEN un archivo de audio de 50MB
- WHEN el renderer solicita los datos via IPC
- THEN el main process lee el archivo sin bloquear otros eventos
- AND los datos se retornan al renderer correctamente

### Requirement: Song Interface Completeness

The system SHALL include artist, album, cover, and duration fields in the Song interface.

#### Scenario: Nueva canción agregada

- GIVEN un archivo con metadata completa
- WHEN se agrega a la playlist
- THEN el objeto Song contiene campos: title, artist, album, cover (base64 o null), duration (number)
