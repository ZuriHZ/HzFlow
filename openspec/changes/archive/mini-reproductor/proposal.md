# Proposal: Mini Reprotector — widget flotante y ocultable

## Intento
Mejorar la experiencia del mini reproductor actual (barra fija en bottom) para que sea más compacto, se pueda ocultar/mostrar con animaciones suaves, y eventualmente moverse por la pantalla.

## Problema actual
- El MiniPlayer actual ocupa toda la parte inferior (full width, `fixed bottom-0`)
- No se puede ocultar cuando no se necesita
- No hay transición suave al aparecer/desaparecer
- En páginas que no son música, siempre visible y ocupa espacio

## Solución propuesta
1. **Modo compacto**: MiniPlayer más pequeño (solo cover + controles básicos)
2. **Posición fija abajo-derecha**: En vez de full-width, es un widget flotante
3. **Toggle visibility**: Botón flotante para mostrar/ocultar con animación
4. **Auto-hide**: Se oculta automáticamente al entrar a la página de música
5. **Persistencia**: Guardar estado de visibilidad en localStorage

## Alcance
- Modificar `MiniPlayer.tsx` (UI compacta + animaciones)
- Modificar `AudioManager.tsx` (lógica de visibilidad)
- Agregar botón toggle flotante
- Actualizar `routes.tsx` (remover `pb-20` ya no necesario)
- Agregar estado de visibilidad al store o localStorage

## Fuera de alcance
- Drag & drop para mover el widget (fase futura)
- Cambiar posición del widget (fase futura)

## Módulos afectados
- `src/components/player/MiniPlayer.tsx` — UI completa
- `src/components/player/AudioManager.tsx` — lógica de visibilidad
- `src/routes/routes.tsx` — ajustar padding
- `src/store/usePlayerStore.ts` — possible visibility state

## Riesgos
- Las animaciones de Framer Motion pueden causar re-renders innecesarios
- El estado de visibilidad necesita persistir entre sesiones
- En pantallas pequeñas el widget puede tapar contenido

## Rollback
- Revertir cambios en MiniPlayer.tsx al diseño anterior (full-width bar)
- Restaurar `pb-20` en routes.tsx
