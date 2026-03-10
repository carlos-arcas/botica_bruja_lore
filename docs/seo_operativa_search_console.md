# SEO Operativa — Search Console Ready

## 1) Objetivo del documento
Dejar una operativa SEO reproducible para despliegue e indexación en Google Search Console sin depender de memoria del equipo.

## 2) Variables necesarias

| Variable | Capa | Uso | Valor en producción |
|---|---|---|---|
| `PUBLIC_SITE_URL` | Backend Django + frontend SSR | Dominio canónico para `robots.txt`, `sitemap.xml`, canonical y JSON-LD en utilidades SEO SSR. | `https://DOMINIO_FINAL` |
| `NEXT_PUBLIC_SITE_URL` | Frontend público | Fallback para resolver base canónica cuando no exista `PUBLIC_SITE_URL`. | `https://DOMINIO_FINAL` |
| `GOOGLE_SITE_VERIFICATION_TOKEN` | Frontend SSR | Emite `<meta name="google-site-verification" ...>` en metadata global solo si existe token. | Token entregado por Search Console |

### Regla operativa de dominio canónico
- En producción, `PUBLIC_SITE_URL` y `NEXT_PUBLIC_SITE_URL` deben ser idénticas (`https://DOMINIO_FINAL`).
- Si divergen, puede haber señales SEO inconsistentes (canonical/JSON-LD en frontend SSR vs expectativas del cliente).
- El backend usa `PUBLIC_SITE_URL` para `robots.txt` y `sitemap.xml`.
- El frontend prioriza `PUBLIC_SITE_URL` y solo usa `NEXT_PUBLIC_SITE_URL` como fallback.

## 3) Verificación de propiedad en Google Search Console

### Método recomendado (implementado)
1. Crear propiedad de tipo **Dominio** o **Prefijo de URL** en Search Console.
2. Obtener token HTML (`google-site-verification=...`).
3. Configurar `GOOGLE_SITE_VERIFICATION_TOKEN` en el entorno del frontend.
4. Desplegar.
5. Abrir HTML de `/` y confirmar la presencia de la meta de verificación.
6. En Search Console, pulsar **Verificar**.

### Comportamiento técnico
- Si `GOOGLE_SITE_VERIFICATION_TOKEN` existe y no está vacía, se emite `verification.google` en metadata raíz de Next.
- Si no existe, no se emite meta vacía ni rota.

### Método alternativo (si política de plataforma lo exige)
- Verificación DNS (TXT) a nivel dominio.
- Mantener igualmente el flujo de variable en frontend para facilitar verificaciones por prefijo en entornos de staging.

## 4) Checklist de despliegue SEO

1. `PUBLIC_SITE_URL=https://DOMINIO_FINAL`.
2. `NEXT_PUBLIC_SITE_URL=https://DOMINIO_FINAL`.
3. `GOOGLE_SITE_VERIFICATION_TOKEN` configurada (solo cuando se vaya a verificar propiedad).
4. `https://DOMINIO_FINAL/robots.txt` accesible y con `Sitemap: https://DOMINIO_FINAL/sitemap.xml`.
5. `https://DOMINIO_FINAL/sitemap.xml` accesible y sin URLs transaccionales/noindex.
6. Canonical correcto en `/`, `/hierbas`, `/rituales`, `/colecciones`, `/la-botica`, `/envios-y-preparacion`.
7. Páginas noindex (`/encargo`, `/cesta`, `/pedido-demo`, `/privacidad`, `/condiciones-encargo`) fuera del sitemap.
8. Meta de verificación presente en HTML solo si hay token.

## 5) URLs a inspeccionar primero en Search Console

Prioridad de inspección/indexación:
1. `/`
2. `/hierbas`
3. `/rituales`
4. `/colecciones`
5. `/la-botica`
6. `/envios-y-preparacion`
7. una ficha pública real de hierba (`/hierbas/{slug-publicado}`)
8. una ficha pública real de ritual (`/rituales/{slug-publicado}`)
9. una ficha pública real de colección (`/colecciones/{slug-publicado}`)

## 6) URLs que NO solicitar indexación
- `/encargo`
- `/cesta`
- `/pedido-demo`
- `/pedido-demo/{id_pedido}`
- `/cuenta-demo`
- `/privacidad`
- `/condiciones-encargo`
- rutas administrativas/API (`/admin/`, `/api/`)

## 7) Matriz de indexación operativa

| URL o tipo | ¿Indexable? | ¿En sitemap? | ¿Canonical? | Nota operativa |
|---|---|---|---|---|
| `/` | Sí | Sí | Sí | Home prioritaria de marca y navegación. |
| `/hierbas` | Sí | Sí | Sí | Landing estratégica de catálogo herbal. |
| `/rituales` | Sí | Sí | Sí | Landing estratégica de rituales. |
| `/colecciones` | Sí | Sí | Sí | Landing estratégica comercial. |
| `/la-botica` | Sí | Sí | Sí | Página informativa pública estratégica. |
| `/envios-y-preparacion` | Sí | Sí | Sí | Informativa pública estratégica indexable. |
| `/hierbas/{slug}` (publicada) | Sí | Sí | Sí | Ficha pública individual. |
| `/rituales/{slug}` (publicado) | Sí | Sí | Sí | Ficha pública individual. |
| `/colecciones/{slug}` (publicado) | Sí | Sí | Sí | Ficha pública individual. |
| `/encargo` | No | No | No | Ruta transaccional de solicitud. |
| `/cesta` | No | No | No | Ruta transaccional no estratégica. |
| `/pedido-demo` y `/pedido-demo/{id}` | No | No | No | Flujo demo técnico/transaccional. |
| `/cuenta-demo` | No | No | No | Ruta técnica de cuenta demo. |
| `/privacidad` | No | No | No | Informativa no estratégica en este ciclo. |
| `/condiciones-encargo` | No | No | No | Informativa no estratégica en este ciclo. |

## 8) Qué esperar en Search Console (sin dramatizar)
- La indexación inicial se moverá primero por búsquedas de marca.
- `Inspección de URL` puede mostrar "Descubierta" o "Rastreada, actualmente no indexada" al inicio.
- Exclusiones por `noindex` en rutas transaccionales/informativas no estratégicas son esperables.
- El envío del sitemap acelera descubrimiento, no garantiza indexación inmediata.
- Revisar tendencias por semanas, no por horas.

## 9) Checks manuales útiles post-despliegue

```bash
curl -I https://DOMINIO_FINAL/robots.txt
curl -I https://DOMINIO_FINAL/sitemap.xml
curl -s https://DOMINIO_FINAL | rg "google-site-verification"
curl -s https://DOMINIO_FINAL/hierbas | rg 'rel="canonical"'
```

Checks complementarios:
- búsqueda `site:DOMINIO_FINAL` (solo para señal general, no como métrica final).
- inspección manual de URLs prioritarias desde Search Console.
- confirmación de que noindex permanece fuera de sitemap y sin solicitud manual.

## 10) Troubleshooting básico
- **No aparece la meta de verificación**: revisar que `GOOGLE_SITE_VERIFICATION_TOKEN` esté en el servicio correcto y redeploy completo.
- **Sitemap apunta a dominio incorrecto**: revisar `PUBLIC_SITE_URL` en backend.
- **Canonical inconsistente**: revisar `PUBLIC_SITE_URL` y `NEXT_PUBLIC_SITE_URL`; deben coincidir.
- **URL no indexada tras solicitud**: verificar que no tenga `noindex`, bloqueo accidental o contenido insuficiente; esperar re-rastreo normal.
