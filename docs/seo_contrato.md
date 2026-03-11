# Contrato SEO de regresión

## Qué protege este contrato
Este contrato protege la base SEO ya implantada para evitar regresiones en cambios futuros.

Fuente máquina-legible: `docs/seo_contrato.json`.

El objetivo es detectar roturas en:
- indexabilidad,
- sitemap,
- canonical,
- robots,
- structured data base,
- enlazado interno SEO,
- coherencia entre frontend, backend y documentación.

## Cómo se organiza
El contrato máquina-legible se divide en:
1. `rutas.indexables_estrategicas` (estáticas clave del sitio).
2. `rutas.fichas_publicas_condicionadas` (familias dinámicas con dependencia de publicación/estado).
3. `rutas.publicas_no_estrategicas`.
4. `rutas.transaccionales_noindex`.
5. `robots` (reglas base de rastreo y ubicación de sitemap).
6. `search_console` (soporte de verificación en metadata raíz).
7. `enlazado_interno` (hubs obligatorios y rutas prohibidas como eje SEO).

## Tipos de páginas actuales
- **Estratégicas indexables:** `/`, hubs de catálogo, páginas públicas estratégicas.
- **Fichas públicas condicionadas:** `/hierbas/{slug}`, `/rituales/{slug}`, `/colecciones/{slug}`, `/guias/{slug}` y `/guias/temas/{slug}` solo cuando el contenido está publicado/indexable y, en subhubs, con masa mínima real.
- **Públicas no estratégicas:** rutas legales informativas en `noindex` para este ciclo.
- **Transaccionales/técnicas:** rutas de flujo demo y encargo en `noindex`.

## Qué se considera rotura SEO
Se considera rotura (y debe fallar el gate) cuando ocurre alguna de estas situaciones:
- una ruta marcada como indexable en contrato deja de ser indexable en metadata;
- aparece una ruta `noindex` dentro de `sitemap.xml`;
- falta canonical donde el contrato exige canonical;
- se emite schema SEO en páginas donde el contrato lo prohíbe;
- desaparece soporte de verificación Search Console en metadata raíz;
- el enlazado interno vuelve a usar `/encargo` como eje contextual principal;
- sitemap público deja de incluir hubs estratégicos declarados.

## Gate único de regresión SEO
Comando canónico del contrato SEO:

```bash
python scripts/check_seo_contract.py
```

Este comando ejecuta validaciones backend y frontend alineadas con `docs/seo_contrato.json`.

## Cómo actualizar el contrato cuando nazcan nuevas rutas SEO
1. Actualizar `docs/seo_contrato.json` con la nueva regla/ruta.
2. Ajustar tests backend/frontend que validan esa regla.
3. Revisar este documento (`docs/seo_contrato.md`) si cambia la taxonomía SEO.
4. Ejecutar `python scripts/check_seo_contract.py` y confirmar que pasa.
5. Solo entonces marcar la capacidad como cerrada.

Regla operativa: no introducir nuevas rutas SEO estratégicas ni cambios de política sin dejar rastro explícito en contrato + tests.
