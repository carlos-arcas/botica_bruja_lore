# Ciclo 2 — Rituales conectados

## 1. Propósito del documento
Definir el contrato oficial de alcance del **Ciclo 2** para convertir el roadmap macro en una fase operativa concreta, sobre la base ya implementada del núcleo herbal del Ciclo 1.

Este documento fija qué se construye ahora, qué se bloquea para ciclos posteriores y qué evidencia habilita declarar el ciclo como cerrado, sin confundir planificación con implementación técnica ya completada.

## 2. Objetivo oficial del Ciclo 2
El Ciclo 2 existe para **conectar rituales al núcleo herbal ya usable** y elevar la utilidad editorial-comercial del producto sin romper su puerta principal de entrada.

Objetivo de producto al cierre:
- mantener la línea herbal como eje principal de descubrimiento y compra guiada;
- añadir una capa ritual navegable que aporte contexto práctico y simbólico relevante;
- asegurar navegación bidireccional entre rituales, plantas y resolución comercial mínima;
- preservar la separación editorial/comercial y las anclas de dominio congeladas.

> **Decisión consolidada**: este ciclo no es “más mística”, sino un puente funcional natural → místico con impacto visible en navegación y comprensión de uso.

## 3. Entregable visible mínimo
Capacidad pública demostrable: **exploración ritual conectada**.

Incluye, como mínimo visible y navegable:
1. índice/listado de rituales con propósito claro;
2. ficha de ritual mínima útil para decisión de exploración;
3. enlaces ritual ↔ plantas relacionados;
4. enlaces ritual ↔ productos relacionados (resolución comercial mínima);
5. conexión explícita con intención como eje de descubrimiento transversal.

El entregable debe sentirse como una extensión coherente del núcleo herbal, no como un segundo producto separado.

## 4. Alcance obligatorio del ciclo
Entra obligatoriamente en Ciclo 2:

1. **Navegación ritual conectada**
   - acceso visible a listado de rituales desde la arquitectura de información vigente;
   - acceso desde ritual a plantas/productos relacionados;
   - retorno claro desde plantas y/o productos hacia rituales pertinentes.

2. **Ficha ritual mínima operativa**
   - contexto editorial breve y accionable, coherente con restricciones comunicativas del proyecto;
   - relación explícita con intención principal;
   - recursos herbales/comerciales asociados, sin sustituir catálogo.

3. **Puente por intención**
   - intención como conector prioritario entre descubrimiento herbal y descubrimiento ritual;
   - mantenimiento de correspondencia como capa secundaria, sin convertirla en eje principal del ciclo.

4. **Soporte mínimo de backoffice para rituales**
   - alta/edición/publicación de rituales y relaciones críticas (ritual-intención, ritual-planta, ritual-producto);
   - gobernanza mínima para mantener contenido ritual publicable y trazable.

5. **Base SEO y navegación ritual coherente**
   - existencia de rutas indexables básicas de rituales (listado + ficha);
   - enlazado interno mínimo entre rituales, plantas, productos e intención, sin colapsar semánticas.

> **Propuesta operativa inicial razonada**: la profundidad de contenidos rituales en este ciclo se limita a lo necesario para habilitar navegación útil y defendible; no se persigue aún una capa editorial ritual exhaustiva.

## 5. Fuera de alcance del ciclo
Queda explícitamente fuera de Ciclo 2:

1. checkout demo completo de extremo a extremo;
2. cuenta de usuario con valor funcional;
3. calendario ritual como feature principal;
4. profundización editorial avanzada (glosario/correspondencias profundas);
5. expansión de packs/combinaciones complejas no necesarias para el entregable mínimo;
6. personalizaciones de backoffice sin impacto directo en la capacidad visible del ciclo.

Regla de control: si un ítem no contribuye de forma directa a la exploración ritual conectada y navegable, se considera sobrealcance.

## 6. Dependencias y prerequisitos
Dependencias obligatorias para iniciar y cerrar Ciclo 2:

1. **Base previa de Ciclo 1 operativa**
   - núcleo herbal navegable disponible como punto de partida real;
   - separación `Planta`/`Producto` ya establecida y no reabrible.

2. **Anclas de dominio y arquitectura vigentes**
   - `Ritual` como entidad conectada, no categoría de producto;
   - `ReglaCalendario` separada de `Ritual` y no priorizada en este ciclo;
   - separación editorial/comercial preservada en todos los recorridos.

3. **Gobernanza de estados y evidencia**
   - trazabilidad de avance por estado real (definido/planificado/en progreso/done/bloqueado/descartado);
   - no declarar cierre sin validación funcional y técnica verificable.

## 7. Criterios de aceptación funcional
El ciclo se considera aceptado funcionalmente solo si se cumple todo lo siguiente:

1. existe navegación pública hacia rituales sin romper la jerarquía herbal como entrada principal;
2. un usuario puede abrir un ritual y entender su propósito sin ambigüedad semántica;
3. desde un ritual puede llegar a plantas y productos relacionados en un recorrido corto y claro;
4. desde plantas y/o productos puede descubrir rituales relacionados útiles (bidireccionalidad efectiva);
5. intención actúa como puente real entre exploración herbal y ritual;
6. la experiencia mantiene coherencia de marca y evita tono de “bazar esotérico”.

## 8. Criterios de aceptación técnicos mínimos
El ciclo se considera aceptado técnicamente solo si se verifica:

1. cumplimiento explícito de Clean Architecture y separación de capas (dominio/aplicación/infraestructura/presentación);
2. preservación de entidades y fronteras congeladas (`Planta` ≠ `Producto`, `Ritual` separado de `ReglaCalendario`);
3. tests obligatorios del alcance implementado en el ciclo;
4. quality gate mínimo aplicable ejecutado y aprobado para lo incorporado;
5. ausencia de artefactos prohibidos y cumplimiento de política i18n del repositorio;
6. evidencia de que DONE implica implementación verificable y no solo documentación.

> **Propuesta operativa inicial razonada**: en este ciclo, el gate técnico mínimo debe cubrir al menos validación automatizada de relaciones ritual-planta-producto-intención y no regresión del recorrido herbal ya cerrado.

## 9. Riesgos y desviaciones a evitar
Riesgos críticos de sobrealcance/deriva:

1. desplazar el foco del producto desde herbal a ritualidad ornamental;
2. tratar rituales como catálogo comercial paralelo en lugar de capa conectada;
3. mezclar semánticas de entidades por atajos de modelado o presentación;
4. abrir calendario, checkout o cuenta antes de su ciclo contractual;
5. inflar backoffice o contenido ritual por volumen sin impacto navegable real;
6. marcar progreso por actividad técnica en vez de por capacidad visible y defendible.

Medida de control: cada decisión del ciclo debe justificar su aporte directo al puente ritual conectado.

## 10. Evidencias de cierre del ciclo
Para declarar Ciclo 2 cerrado debe existir evidencia verificable de:

1. recorrido público navegable de rituales conectados (entrada, listado, ficha y cruces);
2. relaciones visibles y funcionales ritual ↔ planta ↔ producto con intención como eje puente;
3. operación mínima de backoffice capaz de sostener publicación y actualización del alcance ritual del ciclo;
4. validación funcional documentada del flujo principal del ciclo;
5. evidencia técnica de cumplimiento arquitectónico, tests exigidos y quality gate aplicable;
6. registro explícito de límites respetados (capacidades de ciclos posteriores no adelantadas).

Sin estas evidencias, el ciclo permanece abierto.

## 11. Qué debe ocurrir al cerrar el ciclo
Al cierre efectivo del Ciclo 2 deben ejecutarse, en este orden:

1. actualizar `docs/90_estado_implementacion.md` con estado real y evidencia del cierre de rituales conectados;
2. mantener `docs/14_roadmap.md` como secuencia macro sin reabrir decisiones congeladas;
3. abrir el roadmap de prompts atómicos del ciclo siguiente (Ciclo 3), ajustado al estado realmente implementado;
4. registrar desviaciones aprobadas y deuda consciente para evitar arrastre a ciclos posteriores.

> **Congelación de alcance del ciclo**: Ciclo 2 queda definido como “rituales conectados sobre núcleo herbal usable”, sin adelantar checkout completo, cuenta de usuario ni calendario ritual como capacidad principal.
