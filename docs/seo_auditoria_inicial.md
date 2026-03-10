# Auditoría SEO técnica inicial — La Botica de la Bruja Lore

## Resumen ejecutivo

Esta auditoría revisa el estado técnico SEO del proyecto en su configuración actual (backend Django API + frontend Next.js App Router) y detecta riesgos de indexación antes de implementar mejoras.

### Estado general
- **No existe `robots.txt` publicado** ni en Django ni en Next.js.
- **No existe `sitemap.xml`** ni configuración de sitemaps en Django.
- El frontend sí define metadatos base (`title`, `description`) y `lang="es"` a nivel de layout.
- No se detectan bloqueos explícitos por `noindex`/`nofollow` o `X-Robots-Tag` en el código revisado.
- La estructura de URLs es limpia (slugs legibles), pero hay riesgo de **duplicación paramétrica** en colecciones por filtros (`?q`, `?in`, `?cat`, `?ord`) sin canonical.

Conclusión: el estado SEO técnico es **parcialmente preparado**, pero con carencias fundamentales para indexación y rastreo eficientes (robots/sitemap/canonical).

---

## Hallazgos críticos

### 1) Falta de `robots.txt`
**Evidencia**
- No existe archivo ni ruta equivalente en el proyecto para robots.
- En Django solo están publicadas rutas de `healthz`, `admin/` y APIs (`/api/v1/...`).

**Impacto SEO**
- Google puede rastrear sin directrices de crawling.
- No hay declaración formal de sitemap.

**Prioridad**: **P0**

---

### 2) Falta de `sitemap.xml` y ausencia de `django.contrib.sitemaps`
**Evidencia**
- `INSTALLED_APPS` no incluye `django.contrib.sitemaps`.
- No hay rutas de sitemap en `backend/configuracion_django/urls.py`.
- En frontend no existe `app/sitemap.ts` ni equivalente.

**Impacto SEO**
- Descubrimiento de URLs más lento o incompleto, especialmente para rutas profundas (detalles por slug).

**Prioridad**: **P0**

---

## Hallazgos importantes

### 3) Sin canonical en páginas con query params de filtrado
**Evidencia**
- `CatalogoColecciones` actualiza la URL con parámetros `q`, `in`, `cat`, `ord` usando `router.replace(...)`.
- No se detecta canonical en metadata global ni en metadata por página.

**Impacto SEO**
- Riesgo de URLs duplicadas o cuasi-duplicadas con variaciones de filtros.
- Dilución de señales SEO en listados.

**Prioridad**: **P1**

---

### 4) Cobertura de metadata incompleta en rutas dinámicas
**Evidencia**
- Existen `generateMetadata` en fichas dinámicas (`/hierbas/[slug]`, `/rituales/[slug]`, `/colecciones/[slug]`) con `title` y `description`.
- No hay campos de metadata técnica complementaria (canonical/robots/openGraph básico) en esas rutas.

**Impacto SEO**
- Indexación posible, pero menos robusta para controlar canibalización y consistencia de snippets.

**Prioridad**: **P1**

---

### 5) Arquitectura actual separa backend API y frontend indexable
**Evidencia**
- Django expone endpoints JSON y no contiene plantillas HTML públicas para contenido SEO.
- El SEO indexable recae en Next.js (`app/` y componentes de render).

**Impacto SEO**
- Si no se define una estrategia explícita de ownership SEO (qué capa publica robots/sitemap/canonical), pueden quedar huecos operativos.

**Prioridad**: **P1**

---

## Observaciones menores

### 6) Meta robots / headers de bloqueo
- No se detectan `noindex`, `nofollow` ni `X-Robots-Tag` configurados en código.
- Tampoco se detectan middlewares de bloqueo SEO específicos.

**Lectura**: no hay bloqueo directo, pero también falta control fino por entorno (staging/prod).

**Prioridad**: **P2**

### 7) Idioma y metadatos base
- `layout.tsx` define `<html lang="es">`.
- Hay `title` y `description` globales y metadatos en páginas clave.

**Lectura**: base correcta para comenzar, aún sin capa técnica completa.

**Prioridad**: **P2**

### 8) Semántica de encabezados y enlazado interno
- Se observan `h1` en home y páginas principales.
- Hay jerarquías `h2/h3` en bloques de contenido, listados y fichas.
- Existe enlazado interno desde cabecera/footer y enlaces contextuales entre secciones.
- Breadcrumb explícito detectado al menos en detalle de colecciones (`/colecciones/[slug]`).

**Lectura**: buena base semántica inicial para la fase demo.

**Prioridad**: **P2**

---

## Plan de mejoras recomendado

## Fase 1 (inmediata) — Bloqueos de descubrimiento/indexación
1. Publicar `robots.txt` en la capa que sirve dominio indexable.
2. Publicar `sitemap.xml` y registrarlo en `robots.txt`.
3. Definir ownership de SEO técnico: Django, Next.js o mixto (pero con fuente única por dominio).

## Fase 2 — Consolidación técnica SEO
4. Incorporar canonical en rutas de listado con filtros (`/colecciones` y otras que usen query params).
5. Homogeneizar metadata en dinámicas (`title`, `description`, canonical, política robots por tipo de página).
6. Definir reglas de indexación por entorno (evitar indexación accidental en entornos no productivos).

## Fase 3 — Mejora de calidad de indexación
7. Extender breadcrumbs estructurales a más fichas (herbal/rituales) para reforzar arquitectura de información.
8. Revisar páginas con contenido potencialmente escaso para reforzar texto indexable cuando aplique.
9. Evaluar datos estructurados (Schema.org) en una iteración posterior.

---

## Priorización sugerida

| Prioridad | Acción | Resultado esperado |
|---|---|---|
| P0 | robots.txt + sitemap.xml | Rastreo e indexación base controlados |
| P0 | Definir ownership SEO técnico por capa | Evitar huecos entre backend API y frontend público |
| P1 | Canonical en listados con filtros | Reducir duplicidad de URLs |
| P1 | Metadata técnica homogénea en dinámicas | Mejor control de snippets e indexación |
| P2 | Breadcrumbs ampliados + contenido enriquecido | Mejor comprensión semántica y enlazado interno |

---

## Checklist de cobertura de esta auditoría

- [x] Revisión de `robots.txt`
- [x] Revisión de `sitemap.xml`
- [x] Revisión de configuración de sitemap en Django
- [x] Revisión de indexabilidad (`meta robots`, headers, settings/middleware)
- [x] Revisión de metadatos (`title`, `description`, `lang`, canonical)
- [x] Revisión de semántica (`H1/H2/H3`)
- [x] Revisión de estructura de URLs y slugs
- [x] Revisión de enlazado interno, breadcrumbs y categorías
- [x] Identificación de bloqueos técnicos potenciales

