# SEO rendimiento frontend — Prompt 11

## Alcance auditado
Rutas públicas indexables prioritarias:
- `/`
- `/hierbas`
- `/rituales`
- `/colecciones`
- `/hierbas/[slug]`
- `/rituales/[slug]`
- `/colecciones/[slug]`
- `/la-botica`
- `/envios-y-preparacion`

## Lastres reales detectados
1. **Imagen LCP de Home cargada por CSS** (`background-image`):
   - bypass de optimización de `next/image`,
   - sin control de `sizes`,
   - asset de ~479 KB con descarga potencialmente sobredimensionada en móvil.
2. **Doble coste de fetch en fichas dinámicas** (`generateMetadata` + render de página):
   - `/hierbas/[slug]` y `/rituales/[slug]` repetían solicitud de datos en el mismo request.
3. **Hidratación evitable en FAQ Home**:
   - componente cliente para interacción simple de acordeón, sin necesidad de estado React.
4. **Hidratación no crítica en CTA de cesta de `/colecciones`**:
   - contador de cesta cargado en primer render aunque no bloquea comprensión SEO de la landing.

## Cambios aplicados
1. **LCP Home optimizado**
   - Hero migrado a `next/image` con `priority`, `fetchPriority="high"` y `sizes` responsive.
   - Se eliminó `background-image` en CSS y se estabilizó capa visual con `.hero-portada__imagen`.
2. **Dedupe de fetch en fichas SEO dinámicas**
   - Se introdujo `cache()` de React en `/hierbas/[slug]` y `/rituales/[slug]` para reutilizar resultados entre metadata y render.
3. **Reducción de JS/hidratación en Home**
   - FAQ pasó de cliente (`useState`) a render server con `<details>/<summary>`.
4. **Carga diferida de bloque secundario en `/colecciones`**
   - `IndicadorCestaRitual` se movió a `dynamic(..., { ssr: false })` con fallback server estático.

## Lo que no se tocó (intencionadamente)
- Metadata SEO, canonical, robots y JSON-LD existentes.
- Contenido textual SEO y semántica principal (`h1`, secciones editoriales clave).
- Nuevas páginas/blog/social/meta Open Graph.
- Backend y despliegue fuera de frontend perf.

## Evidencia de mejora disponible en repositorio
- Menos JS inicial en Home al retirar estado React del FAQ.
- Menos trabajo de red y serialización en fichas dinámicas al eliminar fetch duplicado por request.
- Estrategia de carga LCP explícita y mantenible para Hero Home.
- Carga diferida de UI no crítica de cesta en landing `/colecciones`.

## Siguiente ciclo recomendado (CWV fino)
1. Añadir presupuesto de bundle por ruta (build analyzer en CI).
2. Revisar granularidad cliente de `CatalogoColecciones` para extraer submódulos no críticos.
3. Evaluar split de bloques inferiores de Home con `dynamic` + placeholders semánticos.
4. Medición con Lighthouse/Web Vitals en entorno estable con backend activo y datos representativos.
