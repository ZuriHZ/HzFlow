# Design: Mini Player Widget

## Arquitectura actual
```
AudioManager (routes.tsx)
├── <audio> element (useAudioPlayer hook)
└── MiniPlayer (fixed bottom-0, full-width)
    ├── Progress bar (full width)
    ├── Cover + Info + Controls
    └── Expanded playlist view
```

## Arquitectura propuesta
```
AudioManager (routes.tsx)
├── <audio> element (useAudioPlayer hook)
├── MiniPlayerWidget (fixed bottom-4 right-4, compact)
│   ├── Cover (32x32)
│   ├── Controls (play/pause, prev/next)
│   ├── Progress bar (2px)
│   └── Close button (X)
├── ToggleButton (fixed bottom-4 right-4, visible when widget hidden)
│   └── Music icon
└── AnimatePresence wrapper
```

## Estados del widget
```
 visibility: VISIBLE | HIDDEN
 position: BOTTOM_RIGHT (futuro: draggable)
```

## Flujo de navegación
```
User navigates to /musica
  → Check if playlist has songs
  → If yes: hide widget, show footer controls
  → Store previous visibility state

User navigates from /musica
  → Restore previous visibility state
  → Show widget with animation
```

## Componentes modificados

### MiniPlayer.tsx (refactor completo)
- Cambiar de full-width bar a widget compacto
- Agregar props: `isVisible`, `onClose`
- Mantener expanded playlist (toggle interno)
- Animación: `motion.div` con `initial/animate/exit`

### AudioManager.tsx (nueva lógica)
- Agregar estado `widgetVisible`
- Escuchar cambios de ruta con `useLocation`
- Auto-hide en `/musica`, auto-show al salir
- Persistir en localStorage

### Nuevo: MiniPlayerToggle.tsx
- Botón flotante circular
- Icono de música
- Click → toggle widget visibility
- Animación de entrada/salida

### routes.tsx
- Remover `pb-20` (ya no necesario)
- El widget es flotante, no afecta layout

## Decisiones técnicas

### Por qué Framer Motion
- `AnimatePresence` maneja unmount con animación
- `motion.div` con `initial/animate/exit` es declarativo
- Performance: usa transform y opacity (GPU)

### Por qué localStorage (no Zustand)
- La visibilidad es un偏好 del usuario, no estado de la app
- Persiste entre sesiones sin complicar el store
- Simple de implementar y debuggear

### Por qué no draggable (aún)
- Complejidad adicional (hit areas, boundaries)
- En desktop el mouse puede tapar el widget
- Se puede agregar en fase futura

## Secuencia de animación
```
Widget appears:
  initial: { opacity: 0, scale: 0.8, y: 20 }
  animate: { opacity: 1, scale: 1, y: 0 }
  transition: { duration: 0.2, ease: "easeOut" }

Widget hides:
  initial: { opacity: 1, scale: 1, y: 0 }
  animate: { opacity: 0, scale: 0.8, y: 20 }
  transition: { duration: 0.15, ease: "easeIn" }
```

## Impacto en UX
- **Positivo**: Menos espacio ocupado, más control del usuario
- **Neutro**: Aprendizaje del toggle button
- **Riesgo**: Usuario puede no notar el widget si está muy pequeño
