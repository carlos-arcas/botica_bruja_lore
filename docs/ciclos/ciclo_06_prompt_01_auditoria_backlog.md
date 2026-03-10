# Ciclo 06 — Prompt 1 oficial: auditoría trazable + backlog priorizado de brechas

## 1. Propósito
Ejecutar la auditoría integral del Ciclo 6 (Prompt 1) contrastando fuente documental, estado real implementado y recorridos críticos navegables, sin implementar nuevas features.

## 2. Alcance auditado
La auditoría contrasta:
1. documentación oficial de producto/ciclo/quality gate;
2. estado declarado en `docs/90_estado_implementacion.md`;
3. estado real en backend Django, frontend Next.js, scripts de gate y tests existentes.

## 3. Recorridos críticos contrastados
| Recorrido | Estado real | Evidencia principal |
|---|---|---|
| Home / entrada comercial | Implementado y navegable | `frontend/app/page.tsx`, `frontend/app/layout.tsx` |
| Catálogo / colecciones | Implementado (listado + fichas) | `frontend/app/colecciones/page.tsx`, `frontend/app/colecciones/[slug]/page.tsx` |
| Ficha producto/ritual | Implementado | `frontend/app/colecciones/[slug]/page.tsx`, `frontend/app/rituales/[slug]/page.tsx`, `frontend/app/hierbas/[slug]/page.tsx` |
| Cesta / checkout demo | Implementado en ruta de encargo con creación real de `PedidoDemo` | `frontend/app/cesta/page.tsx`, `frontend/app/encargo/page.tsx`, `frontend/componentes/catalogo/encargo/FlujoEncargoConsulta.tsx`, `backend/nucleo_herbal/presentacion/publica/views_pedidos_demo.py` |
| Recibo / email demo | Implementado | `frontend/app/pedido-demo/[id_pedido]/page.tsx`, `frontend/componentes/catalogo/encargo/ReciboPedidoDemo.tsx`, `backend/nucleo_herbal/presentacion/publica/urls_pedidos_demo.py` |
| Cuenta demo | Implementado (registro/auth/perfil/historial) | `frontend/app/cuenta-demo/page.tsx`, `backend/nucleo_herbal/presentacion/publica/urls_cuentas_demo.py`, `backend/nucleo_herbal/presentacion/publica/views_cuentas_demo.py` |
| Calendario ritual/editorial | Implementado | `frontend/app/calendario-ritual/page.tsx`, `backend/nucleo_herbal/presentacion/publica/urls_calendario_ritual.py` |
| Backoffice/admin mínimo | Implementado | `backend/configuracion_django/urls.py`, `backend/nucleo_herbal/infraestructura/persistencia_django/admin.py` |

## 4. Brechas detectadas (clasificadas y priorizadas)

### 4.1 Críticas
| ID | Tipo | Área afectada | Evidencia concreta | Impacto | Prioridad | Recomendación mínima | Tratamiento |
|---|---|---|---|---|---|---|---|
| B06-C1 | Trazabilidad documental | Estado global / contratos de checkout | `docs/10_checkout_y_flujos_ecommerce.md` exige checkout con datos de entrega, envío/pago demo y snapshots amplios por línea; implementación real de creación de pedido solo exige `lineas`, `email`, `canal` e `id_usuario` opcional. | Riesgo alto de sobredeclarar alcance de ciclo cerrado y de romper gobernanza de prompts al planificar sobre supuestos no implementados. | Crítica (P1) | Alinear contrato funcional del checkout demo en docs al mínimo realmente implementado o declarar explícitamente delta pendiente. | Prompt propio (Prompt 2 Ciclo 6 recomendado). |
| B06-C2 | Consistencia naming/contrato | UX + documentación de recorrido comercial | El flujo funcional se ejecuta en `/encargo` y componente `FlujoEncargoConsulta`, mientras documentación de ciclo y quality gate lo nombra como checkout demo de forma predominante. | Ambigüedad operativa para QA, onboarding y definición de criterios de aceptación de próximos prompts. | Crítica (P1) | Definir naming canónico único (por ejemplo, "checkout demo (ruta /encargo)") y aplicarlo de forma transversal en docs de estado/flujo/gate. | Agrupable con B06-C1 en un único prompt documental de consistencia. |

### 4.2 Importantes
| ID | Tipo | Área afectada | Evidencia concreta | Impacto | Prioridad | Recomendación mínima | Tratamiento |
|---|---|---|---|---|---|---|---|
| B06-I1 | Integración frontend↔backend | Checkout demo + cuenta demo | La API soporta asociación opcional por `id_usuario`, pero no existe sesión compartida real de cuenta demo en checkout; la vinculación depende de entrada manual del identificador en el flujo de encargo. | Fricción de uso y menor credibilidad del beneficio "autenticado vs invitado" declarado en docs de checkout. | Alta (P2) | Definir criterio mínimo de integración de estado de cuenta en checkout demo o ajustar contrato documental para no prometer prefill/continuidad automática todavía. | Prompt propio técnico acotado después de cerrar consistencia documental. |
| B06-I2 | Test/gate/calidad | Cobertura de recorridos críticos | El gate canónico ejecuta checks backend críticos, scripts, lint/build frontend y tests puntuales (`checkout-demo`, `cuenta-demo`, `calendario-ritual`), pero no incluye una prueba integrada de recorrido completo cesta→encargo→recibo→email. | Riesgo medio de regresiones de integración no detectadas por bloques unitarios/aislados. | Alta (P2) | Incorporar test de integración contractual E2E ligero o ampliar suite gate con caso de recorrido crítico unificado. | Puede agruparse con B06-I1 en prompt de endurecimiento de calidad. |
| B06-I3 | Trazabilidad documental | `docs/90_estado_implementacion.md` | Existen secciones históricas con sufijo "Ciclo 3 en progreso" dentro de un documento cuyo estado global declara ciclos 1–5 ya cerrados. | Confusión de lectura y riesgo de interpretación incorrecta del estado real en auditorías futuras. | Media-alta (P2) | Normalizar etiquetas históricas a "histórico de ciclo" o dejar nota explícita de contexto temporal. | Agrupable en prompt documental de consistencia. |

### 4.3 Opcionales / no prioritarias
| ID | Tipo | Área afectada | Evidencia concreta | Impacto | Prioridad | Recomendación mínima | Tratamiento |
|---|---|---|---|---|---|---|---|
| B06-O1 | UX | Narrativa de continuidad comercial | Coexisten rutas `/encargo` y `/pedido-demo` con semántica similar (inicio/cierre de flujo) y naming heterogéneo en textos UI. | Impacto bajo; no bloquea recorrido actual. | Baja (P3) | Unificar microcopy de flujo comercial demo tras resolver naming canónico en docs. | Agrupable, sin prompt exclusivo inicial. |
| B06-O2 | Trazabilidad documental | Matriz de recorridos críticos | No existe en docs una matriz única y compacta "recorrido ↔ endpoint/backend ↔ ruta frontend ↔ test de cobertura" para Ciclo 6. | Impacto bajo, pero mejora mantenibilidad y auditoría rápida. | Baja (P3) | Añadir matriz viva al cierre de Ciclo 6 (Prompt 3). | Agrupable con cierre de gobernanza. |

## 5. Backlog priorizado propuesto para Ciclo 6
1. **Prompt 2 (P1)** — Resolver consistencia documental crítica de checkout demo/naming (B06-C1 + B06-C2) con cambios mínimos y trazables.
2. **Prompt 2b o 3 temprano (P2)** — Definir y ejecutar ajuste acotado de integración cuenta↔checkout y evidencia de no-regresión asociada (B06-I1 + B06-I2).
3. **Prompt 3 de cierre (P2/P3)** — Cerrar deuda de trazabilidad de estado histórico y matriz consolidada de recorridos críticos (B06-I3 + B06-O2).
4. **Post-cierre opcional (P3)** — Homogeneización de microcopy comercial demo (B06-O1).

## 6. Contradicciones explícitas detectadas
1. **Contrato de checkout en docs > implementación real**: la especificación funcional de `docs/10_checkout_y_flujos_ecommerce.md` es más ambiciosa que el contrato actualmente implementado en backend/frontend para `PedidoDemo`.
2. **Naming operativo no unificado**: documentación y tests usan "checkout demo", mientras superficies clave usan nomenclatura "encargo/consulta".
3. **Marcadores históricos ambiguos en estado de implementación**: coexistencia de etiquetas de "en progreso" para secciones históricas ya cerradas a nivel de ciclo.

## 7. Decisiones de gobernanza aplicadas en este prompt
- No se implementan correcciones técnicas sobre frontend/backend.
- Se deja backlog priorizado y accionable para el siguiente prompt oficial.
- Se actualiza `docs/90_estado_implementacion.md` para registrar este Prompt 1 de auditoría como ejecutado sin invadir Prompt 2.
