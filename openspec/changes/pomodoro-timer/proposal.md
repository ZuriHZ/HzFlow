# Proposal: Pomodoro Timer

## Intent

Los desarrolladores necesitan gestionar sesiones de trabajo enfocado sin salir de la app. Un timer Pomodoro integrado complementa el reproductor de música existente y mejora la productividad. Esta change agrega un widget de timer configurable con notificaciones del sistema.

## Scope

### In Scope

- Timer Pomodoro configurable: 25/5 min (default), 50/10 min, custom
- Notificaciones del sistema (Electron `Notification` API) al terminar sesiones
- Mini widget siempre visible (en el footer o como widget flotante)
- Control: iniciar, pausar, resetear, saltar a siguiente sesión
- Historial de sesiones del día (cuántas pomodoros completados)
- Integración con Dev Notes: prompt "¿En qué estás trabajando?" al iniciar sesión
- Sonido de alarma al terminar (usa el sistema de audio existente o notificación nativa)
- Stats básicas: sesiones completadas hoy, tiempo total enfocado hoy
- Configuración de duración en `/config` o en el widget mismo

### Out of Scope

- Estadísticas avanzadas por semana/mes/gráficos
- Integración con calendario o Google Calendar
- Tracking de qué proyecto estás trabajando
- Modo "break" con suggestions (ej: "salta, estira")
- Sincronización entre dispositivos
- Tags por sesión de pomodoro
- Dashboard de productividad completo

## Approach

Arquitectura híbrida:

1. **Main (`electron/notifications/`)**: Handlers de notificaciones nativas del sistema
2. **Preload**: expone `electronAPI.notifications.{send, requestPermission}`
3. **Renderer**: feature `src/features/pomodoro/` con store Zustand, hooks, components
4. **Widget**: componente `PomodoroWidget` en footer o floating

El timer corre en el renderer (no necesita main process). Las notificaciones se envían via IPC al main process.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `electron/main.js` | Modified | Registrar IPC de notificaciones |
| `electron/preload.js` | Modified | Exponer `electronAPI.notifications.*` |
| `electron/notifications/` (nuevo) | New | ipc.js para notificaciones nativas |
| `src/features/pomodoro/` (nuevo) | New | store, hooks, components |
| `src/components/layout/Footer.tsx` | Modified | Integrar widget de pomodoro |
| `src/pages/config.tsx` | Modified | Configuración de pomodoro |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Timer se detiene al perder foco de la ventana | Med | Usar setInterval robusto con drift correction |
| Notificaciones nativas bloqueadas por SO | Med | Fallback: notificación in-app + sonido |
| Widget en footer aumenta complejidad de layout | Low | Opción floating como alternativa |

## Rollback Plan

1. Revertir commits de la change
2. Eliminar widget del footer
3. No hay persistencia que limpiar (historial es volatile por sesión)

## Dependencies

- Electron 33 APIs: `Notification`, `ipcMain.handle`
- Ninguna dependencia externa

## Success Criteria

- [ ] Timer funciona con opciones 25/5, 50/10, y custom
- [ ] Notificación nativa se muestra al terminar sesión
- [ ] Widget visible en footer o floating
- [ ] Control de iniciar/pausar/resetear funciona
- [ ] Historial de sesiones del día se muestra
- [ ] Configuración accesible desde widget o config
- [ ] `npm run build` sigue pasando
