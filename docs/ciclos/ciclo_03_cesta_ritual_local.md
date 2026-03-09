# Ciclo 03 — Feature 06: Cesta ritual local sin pago

## Alcance implementado
- Se añade una cesta ritual **solo frontend** en `frontend/contenido/catalogo/cestaRitual.ts` y `frontend/infraestructura/catalogo/almacenCestaRitual.ts`.
- La cesta permite: añadir, quitar, actualizar cantidad, vaciar, contar unidades, subtotal visible orientativo y serialización segura con fallback.
- Se habilita ruta dedicada `/cesta` para revisar la selección y derivarla a `/encargo`.

## Integración con `/encargo`
- El flujo de encargo mantiene compatibilidad con preselección por producto (`?producto=slug`).
- Se amplía para aceptar selección múltiple desde cesta (`?cesta=<json-url-encoded>`), reutilizando el formulario existente.
- No se añade checkout, pago ni persistencia de servidor.

## Persistencia local
- Se usa `localStorage` encapsulado en infraestructura con clave `botica:cesta-ritual`.
- Se recupera estado de forma segura ante JSON inválido o estructura corrupta.
- Se dispara evento de sincronización (`cesta-ritual:actualizada`) para mantener coherencia entre vistas.

## UX añadida
- Botón “Añadir a la cesta ritual” en tarjetas de catálogo y ficha de producto.
- Indicador de unidades en acceso rápido a cesta dentro de `/colecciones`.
- Vista de cesta con estados vacía / con líneas, control de cantidad, quitar, vaciar y CTA a encargo.

## Evolución recomendada (sin convertirlo en checkout)
- Añadir validaciones de disponibilidad editorial cuando una pieza pase a no visible.
- Incorporar mensaje de persistencia por sesión (última actualización) sin acoplar lógica comercial.
- Mantener la cesta como pre-flujo de consulta artesanal, no como paso transaccional.
