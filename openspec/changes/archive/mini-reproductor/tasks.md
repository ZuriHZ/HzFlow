# Tasks: Mini Player Widget

## Fase 1: Refactor del MiniPlayer actual
- [ ] 1.1 Modificar `MiniPlayer.tsx` para que sea widget compacto (no full-width)
  - Cambiar posición de `fixed bottom-0 left-0 right-0` a `fixed bottom-4 right-4`
  - Reducir tamaño: ancho ~280px, altura ~60px
  - Mantener cover (32x32), controles básicos, barra de progreso
  - Agregar prop `onClose` para cerrar el widget
  - Mantener expanded playlist como toggle interno
- [ ] 1.2 Agregar animación de entrada/salida con Framer Motion
  - `initial: { opacity: 0, scale: 0.8, y: 20 }`
  - `animate: { opacity: 1, scale: 1, y: 0 }`
  - `exit: { opacity: 0, scale: 0.8, y: 20 }`
  - `transition: { duration: 0.2 }`

## Fase 2: Lógica de visibilidad
- [ ] 2.1 Crear estado de visibilidad en `AudioManager.tsx`
  - `const [isVisible, setIsVisible] = useState(() => localStorage.getItem("miniPlayerVisible") !== "false")`
  - Guardar en localStorage al cambiar
- [ ] 2.2 Detectar navegación a /musica
  - Usar `useLocation()` para escuchar cambios de ruta
  - Auto-hide cuando `pathname === "/musica"`
  - Auto-show al salir de /musica (restaurar estado anterior)
- [ ] 2.3 Crear `MiniPlayerToggle.tsx`
  - Botón flotante circular `fixed bottom-4 right-4`
  - Icono de música (IconMusic de Tabler)
  - Click → toggle `isVisible`
  - Solo visible cuando hay canciones en playlist
  - Animación de entrada/salida

## Fase 3: Integración y ajustes
- [ ] 3.1 Actualizar `AudioManager.tsx`
  - Renderizar `MiniPlayerToggle` cuando widget oculto
  - Renderizar `MiniPlayer` con prop `isVisible`
  - Pasar `onClose` para cerrar widget
- [ ] 3.2 Actualizar `routes.tsx`
  - Remover `pb-20` del contenido principal
  - El widget es flotante, no afecta el layout
- [ ] 3.3 Ajustar `Musica.tsx`
  - Cuando el usuario está en /musica, mostrar controles en el footer (ya existe)
  - No duplicar controles del mini player

## Fase 4: Testing y polish
- [ ] 4.1 Probar animaciones en diferentes navegaciones
- [ ] 4.2 Verificar persistencia en localStorage
- [ ] 4.3 Probar en pantalla pequeña
- [ ] 4.4 Verificar que no hay conflictos con el footer de /musica
