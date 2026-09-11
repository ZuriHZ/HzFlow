# Proposal: Dev Dashboard (Home v2)

## Intent

El Home actual es estático con quick links y stats genéricos. Transformarlo en un dashboard dinámico que muestre widgets de las features implementadas (PRs, notas, pomodoro, proyectos), dando una vista centralizada del estado del desarrollo diario.

## Scope

### In Scope

- Refactor completo de `src/pages/home.tsx` como dashboard de widgets
- Widget de **PRs pendientes**: preview de PRs asignados/review-requested (integra con `github-prs`)
- Widget de **notas recientes**: últimas notas creadas/editadas (integra con `dev-notes`)
- Widget de **pomodoro activo**: mini timer integrado (integra con `pomodoro-timer`)
- Widget de **proyectos recientes**: últimos proyectos accedidos (integra con `project-organizer`)
- Greeting personalizado con hora del día ("Buenos días, dev" / "Buenas tardes")
- Stats: "X notas, Y PRs, Z sesiones pomodoro esta semana"
- Layout responsive de widgets (grid o flex)
- Cada widget tiene link a su página completa

### Out of Scope

- Layout draggable/reordenable (fase futura)
- Widgets configurables (mostrar/ocultar)
- Customización de colores/tema por widget
- Widget de activity feed / timeline
- Widget de calendar
- Animaciones complejas de entrada (solo transiciones simples)

## Approach

1. **Renderer**: Refactor de `src/pages/home.tsx` + componente `DashboardWidget` reutilizable
2. **Integración**: Usa stores existentes de cada feature (PRs, notes, pomodoro, projects)
3. **Sin cambios en main process**: solo consume datos de stores ya existentes

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/pages/home.tsx` | Modified | Refactor completo como dashboard |
| `src/components/shared/DashboardWidget.tsx` (nuevo) | New | Widget reutilizable con header + contenido |
| `src/features/*/store` | Read-only | Consume datos de stores existentes |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Dashboard depende de múltiples features | Med | Widgets degradan gracefully cuando la feature no está implementada |
| Layout complejo en diferentes tamaños de ventana | Low | Usar CSS grid responsive |
| Performance con muchos widgets cargando datos | Low | Lazy loading por widget; datos ligeros |

## Rollback Plan

1. Revertir commits de la change (volver al home.tsx original)
2. No hay datos nuevos que limpiar

## Dependencies

- Todas las features anteriores deben estar implementadas (PRs, Notes, Pomodoro, Projects)
- Cada widget es opcional: si la feature no existe, el widget no se muestra

## Success Criteria

- [ ] Home muestra dashboard con widgets dinámicos
- [ ] Widget de PRs muestra PRs pendientes cuando `github-prs` está implementado
- [ ] Widget de notas muestra notas recientes cuando `dev-notes` está implementado
- [ ] Widget de pomodoro muestra timer activo cuando `pomodoro-timer` está implementado
- [ ] Widget de proyectos muestra proyectos recientes cuando `project-organizer` está implementado
- [ ] Greeting personalizado con hora funciona
- [ ] Stats resumen se muestran correctamente
- [ ] Layout responsive en diferentes tamaños de ventana
- [ ] `npm run build` sigue pasando
