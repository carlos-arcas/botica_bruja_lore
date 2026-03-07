# 90 — Estado de implementación del proyecto

## 1. Propósito del documento
Este documento es el tablero vivo de estado de **La Botica de la Bruja Lore**.

Su función es separar, sin ambigüedad:
- lo **definido documentalmente**,
- de lo **implementado funcionalmente**.

Se usa para gobernar avance real por ciclos, evitar declarar avances ficticios y mantener trazabilidad operativa entre capacidades, evidencia y estado.

## 2. Convención oficial de estados
Los estados oficiales de proyecto y capacidad son:

- **DEFINIDO**: la capacidad está especificada y alineada con arquitectura/dominio, pero no implementada.
- **PLANIFICADO**: la capacidad tiene ciclo objetivo y dependencia identificada para ejecución futura.
- **EN_PROGRESO**: existe implementación activa en curso dentro del ciclo actual.
- **DONE**: la capacidad está implementada y es verificable/navegable/demostrable, respeta arquitectura y pasa quality gate cuando aplica.
- **BLOQUEADO**: la capacidad no puede avanzar por dependencia, restricción o riesgo no resuelto.
- **DESCARTADO**: la capacidad se retira explícitamente del alcance con decisión trazable.

## 3. Principios de uso del documento
1. Este tablero **no reemplaza** visión, alcance, dominio ni arquitectura; los referencia.
2. No se marca **DONE funcional** sin implementación real verificable.
3. Lo documental puede estar cerrado sin que exista producto implementado.
4. Cada capacidad debe indicar ciclo asociado y evidencia concreta.
5. Este archivo se actualiza por cambios de estado, no como diario ni changelog narrativo.
6. En caso de duda, prevalece la fuente de verdad en `docs/`.

## 4. Estado global actual del proyecto
- Estado de definición estratégica/documental: **alto y consistente**.
- Estado de implementación funcional de producto: **Ciclo 1 implementado en alcance núcleo herbal**.
- Backend (dominio/aplicación/infraestructura/presentación pública): **implementado para alcance Ciclo 1**.
- Frontend (home + listado herbal + ficha herbal conectada): **implementado para alcance Ciclo 1**.
- Backoffice/admin mínimo: **implementado para operación base del ciclo**.
- Checkout demo: **no implementado (fuera de alcance de Ciclo 1)**.
- Calendario ritual: **no implementado (ciclo posterior)**.
- Quality gate Ciclo 1: **activo en nivel mínimo operativo con evidencia parcial condicionada por entorno**.

Resumen ejecutivo de estado real: existe un recorrido funcional del núcleo herbal y una base técnica coherente con las anclas del dominio. El cierre fuerte de verificación integrada quedó parcialmente bloqueado por limitaciones externas de instalación de dependencias (proxy 403 para `pip`/`npm`).

## 5. Estado por capacidades
| Capacidad | Estado actual | Ciclo asociado | Evidencia / referencia | Notas operativas |
|---|---|---|---|---|
| Base documental del proyecto | DONE | Ciclo 0 | `docs/00_vision_proyecto.md`, `docs/02_alcance_y_fases.md`, `docs/05_modelo_de_dominio_y_entidades.md`, `docs/07_arquitectura_tecnica.md`, `docs/08_decisiones_tecnicas_no_negociables.md` | Base documental vigente y alineada. |
| Contrato operativo del agente (`AGENTS.md`) | DONE | Ciclo 0 | `AGENTS.md` | Contrato operativo activo y consistente. |
| Núcleo de dominio/aplicación herbal (`Planta`, `Producto`, `Intencion` + casos de uso) | DONE | Ciclo 1 | `backend/nucleo_herbal/dominio/entidades.py`, `backend/nucleo_herbal/aplicacion/casos_de_uso.py`, `tests/nucleo_herbal/test_entidades.py`, `tests/nucleo_herbal/test_casos_de_uso.py` | Separación Planta/Producto aplicada y validada por tests unitarios. |
| Persistencia y repositorios mínimos | DONE | Ciclo 1 | `backend/nucleo_herbal/infraestructura/persistencia_django/repositorios.py`, `tests/nucleo_herbal/infraestructura/test_repositorios_django.py` | Implementado; validación automática condicionada a disponibilidad de Django en entorno. |
| Exposición pública mínima real (API herbal) | DONE | Ciclo 1 | `backend/nucleo_herbal/presentacion/publica/urls.py`, `backend/nucleo_herbal/presentacion/publica/views.py`, `tests/nucleo_herbal/test_exposicion_publica.py` | Contratos públicos implementados para listado, detalle, productos y relaciones por intención. |
| Backoffice mínimo útil | DONE | Ciclo 1 | `backend/nucleo_herbal/infraestructura/persistencia_django/admin.py`, `tests/nucleo_herbal/infraestructura/test_admin_django.py` | Admin mínimo implementado para Intención/Planta/Producto. |
| Home orientadora conectada | DONE | Ciclo 1 | `frontend/app/page.tsx`, `frontend/componentes/home/` | Home conectada con preview herbal y entrada a exploración. |
| Listado herbal navegable | DONE | Ciclo 1 | `frontend/app/hierbas/page.tsx`, `frontend/componentes/herbal/ListadoHerbal.tsx` | Listado conectado al contrato público backend. |
| Ficha herbal conectada (editorial + comercial mínima) | DONE | Ciclo 1 | `frontend/app/hierbas/[slug]/page.tsx`, `frontend/componentes/herbal/detalle/` | Separación editorial/comercial visible en UI y consumo de API. |
| Quality gate mínimo operativo de ciclo | EN_PROGRESO | Ciclo 1 (cierre) | `python -m pytest -q` ejecutado; intentos de `python manage.py check`, `python -m pip install -r requirements.txt`, `npm install` | Gate parcial: tests disponibles pasan, pero no se pudo ejecutar verificación Django/Next integrada por bloqueo externo de dependencias. |
| Checkout demo | PLANIFICADO | Ciclo 3 | `docs/02_alcance_y_fases.md` | Sin cambios, fuera de alcance. |
| Login / invitado | PLANIFICADO | Ciclo 3–4 | `docs/02_alcance_y_fases.md` | Sin cambios, fuera de alcance. |
| Historial de pedidos demo | PLANIFICADO | Ciclo 4 | `docs/02_alcance_y_fases.md`, `docs/05_modelo_de_dominio_y_entidades.md` | Sin cambios, fuera de alcance. |
| Favoritos | PLANIFICADO | Ciclo 4 | `docs/02_alcance_y_fases.md`, `docs/05_modelo_de_dominio_y_entidades.md` | Sin cambios, fuera de alcance. |
| Recordatorios | PLANIFICADO | Ciclo 4–5 | `docs/02_alcance_y_fases.md`, `docs/05_modelo_de_dominio_y_entidades.md` | Sin cambios, fuera de alcance. |
| Calendario ritual | PLANIFICADO | Ciclo 5 | `docs/02_alcance_y_fases.md`, `docs/05_modelo_de_dominio_y_entidades.md` | Sin cambios, fuera de alcance. |

## 6. Último ciclo cerrado
- **Ciclo cerrado formalmente**: Ciclo 0 (documental).
- **Estado de Ciclo 1**: **casi cerrado técnicamente** (implementación funcional completada, verificación integral parcialmente bloqueada por entorno).
- **Evidencia de avance de Ciclo 1**:
  - recorrido funcional implementado: home → listado herbal → ficha herbal conectada,
  - separación editorial/comercial preservada,
  - exposición pública mínima implementada,
  - backoffice mínimo implementado,
  - tests ejecutables en entorno actual en estado passing.

## 7. Ciclo actual
- **Ciclo actual operativo**: cierre de Ciclo 1.
- **Estado**: implementación y validación base completadas; pendiente cierre fuerte de gate integrado cuando el entorno permita instalar dependencias de Django/Next.
- **Condición de salida para marcar Ciclo 1 como DONE técnico fuerte**:
  1. instalar dependencias backend y frontend sin bloqueo de red/proxy,
  2. ejecutar checks Django (`manage.py check` + tests no omitidos),
  3. ejecutar checks frontend (`lint` y build/typecheck),
  4. registrar evidencia final de gate completo.

## 8. Deuda y bloqueos conocidos
1. **Bloqueo externo de entorno**: `pip` no puede descargar Django por `403 Forbidden` de proxy.
2. **Bloqueo externo de entorno**: `npm install` no puede descargar paquetes por `403 Forbidden` en registry.
3. Derivado de lo anterior, no es posible en este entorno ejecutar la batería integrada completa de Django ni checks de Next.js.
4. No se identificaron defectos bloqueantes nuevos en el código ya ejecutable con dependencias locales actuales.

## 9. Próximos movimientos recomendados
1. Resolver primero la conectividad/credenciales del proxy o habilitar mirror interno para `pip` y `npm`.
2. Re-ejecutar quality gate completo de Ciclo 1 (backend + frontend) en entorno sin bloqueo.
3. Si ese gate pasa, marcar Ciclo 1 como **DONE técnico** y abrir formalmente Ciclo 2.
4. Iniciar Ciclo 2 sin sobrealcance, manteniendo separación editorial/comercial y anclas de dominio congeladas.

---

**Regla de lectura rápida del estado actual:**
- Ciclo 1 tiene implementación funcional real y coherente con su contrato.
- El cierre técnico integral depende de resolver bloqueos externos de instalación.
- El siguiente paso correcto es completar el quality gate en entorno habilitado y cerrar formalmente el ciclo.
