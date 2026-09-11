# Spec: Mini Player Widget

## Contexto
El mini reproductor actual es una barra full-width en la parte inferior. Se necesita transformar en un widget compacto flotante que se pueda ocultar/mostrar.

## Escenarios

### SC-01: Widget compacto por defecto
**Dado** que hay canciones en la playlist
**Cuando** el usuario está en cualquier página que no sea música
**Entonces** se muestra un widget flotante abajo-derecha con:
- Cover de la canción actual (32x32px)
- Botón play/pause
- Barra de progreso delgada (2px)
- Botón para expandir/colapsar

### SC-02: Toggle visibilidad con animación
**Dado** que el widget está visible
**Cuando** el usuario hace click en el botón de ocultar (X)
**Entonces** el widget se desvanece con animación `opacity + scale` en 200ms
**Y** el estado se guarda en localStorage

### SC-03: Mostrar widget desde botón flotante
**Dado** que el widget está oculto
**Cuando** el usuario hace click en el botón flotante de música
**Entonces** el widget aparece con animación `scale + opacity` en 200ms
**Y** muestra la canción actual

### SC-04: Auto-hide al entrar a /musica
**Dado** que el usuario navega a la página de música
**Cuando** la página carga
**Entonces** el widget se oculta automáticamente
**Y** el footer de la página de música muestra los controles completos

### SC-05: Auto-show al salir de /musica
**Dado** que el usuario está en /musica y el widget estaba visible antes
**Cuando** el usuario navega a otra página
**Entonces** el widget reaparece con animación

### SC-06: Botón toggle en todas las páginas
**Dado** que hay canciones en la playlist
**Cuando** el usuario está en cualquier página
**Entonces** hay un botón flotante (esquina inferior derecha) que permite mostrar/ocultar el widget

### SC-07: Persistencia de estado
**Dado** que el usuario oculta el widget
**Cuando** recarga la app
**Entonces** el widget permanece oculto
**Y** solo se muestra al hacer click en el botón flotante

## Requisitos no funcionales
- Animaciones deben ser suaves (200-300ms)
- Widget no debe tapar contenido importante (margen mínimo 16px)
- Performance: usar `transform` y `opacity` para animaciones (GPU)
- Compatible con pantalla pequeña (min-width: 320px)

## Decisiones de diseño
- **Posición**: `fixed bottom-4 right-4` (no full-width)
- **Tamaño**: Widget de ~280px de ancho, ~60px de alto
- **Animación**: Framer Motion `AnimatePresence` con `scale` + `opacity`
- **Toggle button**: Botón circular fijo en `bottom-4 right-4` cuando widget está oculto
- **Estado**: `localStorage` para persistir visibilidad
