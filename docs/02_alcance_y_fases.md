# 02 — Alcance y fases del proyecto

## 1. Propósito del documento
Definir el alcance global de **La Botica de la Bruja Lore** y establecer el marco operativo de implementación por ciclos para construir una demo sólida, creíble y navegable sin perder el enfoque **portfolio-first, business-ready**. Este documento fija cómo se gobierna el avance real del producto y cómo se separa lo decidido en documentación de lo efectivamente construido.

### Nota de vigencia 2026-04-28
Este documento mantiene el marco historico de ciclos. La fase operativa vigente queda normalizada por `docs/90_estado_implementacion.md`: ecommerce local real con pago simulado. Las referencias a "demo comercial sin compra real activa" describen el origen del proyecto y ciclos anteriores, no el flujo principal actual. Local simulado no significa produccion ni desbloquea `V2-R10`.

## 2. Filosofía de trabajo por ciclos
El proyecto se rige por una estrategia de **definición amplia + implementación incremental**:

- Se define de forma rigurosa la estructura estratégica (visión, alcance, dominio, arquitectura, reglas no negociables, branding/narrativa, catálogo y taxonomías).
- Se implementa por **ciclos verticales**, cada uno cerrando una capacidad de producto completa y visible.
- Ningún ciclo se considera válido si solo entrega piezas horizontales aisladas (por ejemplo: solo branding, solo CI, solo tests, solo SEO) sin valor navegable y demostrable.
- Cada ciclo debe terminar en un incremento:
  - visualizable;
  - navegable;
  - coherente con la narrativa natural → místico;
  - demostrable ante terceros.

Principio rector de ejecución: **pensado no es hecho**. La existencia de definición documental no implica implementación operativa.

## 3. Qué se define ahora y qué se implementa después
### 3.1 Definición prioritaria (ahora)
En la etapa documental actual se debe dejar cerrado, como mínimo:

- visión y posicionamiento;
- alcance funcional macro;
- modelo de dominio y relaciones clave;
- arquitectura y límites entre capas;
- decisiones técnicas no negociables;
- branding/narrativa y progresión de experiencia;
- catálogo base y taxonomías maestras;
- estructura de ciclos y criterios de cierre.

### 3.2 Implementación (después)
La construcción técnica se activa por prompts de implementación **uno a uno**, priorizando capacidades reales de producto por ciclo. No se debe cerrar de forma prematura el microdetalle final de UI ni decisiones de implementación fina que dependan de validación progresiva.

Regla de control: algo puede estar completamente **definido** y, al mismo tiempo, no estar **implementado**.

## 4. Estados de madurez del proyecto
Los estados oficiales para gobernar alcance y ejecución son:

- **DEFINIDO**: decisión documentada y aprobada a nivel de producto/arquitectura, sin implementación obligatoria aún.
- **PLANIFICADO**: trabajo priorizado para ciclo futuro con objetivo y dependencias identificadas.
- **EN_PROGRESO**: implementación activa en curso dentro de un ciclo.
- **DONE**: capacidad implementada, verificable/navegable, validada de forma suficiente, compatible con arquitectura y con quality gate superado cuando aplique.
- **BLOQUEADO**: ejecución detenida por dependencia, riesgo o restricción no resuelta.
- **DESCARTADO**: elemento retirado explícitamente del alcance por decisión consciente y trazable.

Regla de trazabilidad: cada capacidad debe poder indicar su **estado documental** y su **estado de implementación** sin ambigüedad.

## 5. Alcance global del producto
El alcance global definido para el proyecto incluye:

1. Ecommerce editorial especializado en:
   - hierbas a granel;
   - sabiduría herbal tradicional;
   - rituales;
   - sinergias;
   - herramientas esotéricas;
   - packs y regalos.
2. Experiencia de navegación con doble ruta de valor:
   - compra directa (usuario con intención concreta);
   - descubrimiento guiado (usuario que necesita orientación).
3. Diferencial competitivo operacionalizado en:
   - fichas ricas;
   - relaciones planta-ritual-producto;
   - sinergias explicadas;
   - compra guiada;
   - navegación editorial.
4. Progresión narrativa de experiencia: de lo natural hacia lo místico.
5. Cumplimiento comunicativo estricto:
   - no venta de medicina;
   - no promesas de milagros;
   - no afirmaciones sanitarias impropias.
6. Meta histórica de fase temprana: demo comercial creíble sin compra real activa. Meta vigente normalizada: ecommerce local real con pago simulado, sin producción ni cobro real externo.

### 5.1 Criterio mínimo de catálogo público por sección (fase demo)
Para pasar de presencia en home/hero/backoffice a catálogo público DB-backed, una sección debe tener masa comercial real suficiente para sostener compra directa y descubrimiento guiado sin relleno sintético.

1. `botica-natural` se mantiene como baseline público y exige **5 productos publicados propios** de su sección.
2. `velas-e-incienso`, `minerales-y-energia` y `herramientas-esotericas` exigen **mínimo 3 productos publicados propios** antes de abrir listado/detalle público DB-backed.
3. Tener `1` o `2` productos publicados sirve como fase de curación/seed interno, pero **no** justifica abrir una sección pública nueva.
4. El **vacío honesto** solo vale cuando la sección ya existe públicamente y en ese momento no hay resultados por curación editorial o por filtros activos; no sustituye el mínimo de catálogo requerido para inaugurar una sección.
5. El **fallback** entre secciones es excepcional: se conserva solo el fallback herbal legado de `botica-natural` como compatibilidad de bootstrap y queda prohibido generalizarlo a nuevas secciones porque rompe la coherencia editorial-comercial.
6. Seeds, importaciones y QA que habiliten nuevas secciones deben verificar este umbral mínimo y que la respuesta pública no mezcle productos de otra `seccion_publica`.

## 6. Ciclos previstos
### 6.1 Ciclo 0 — Base documental, arquitectura y contratos del proyecto
**Objetivo del ciclo**
Consolidar el marco estructural que evita deriva estratégica y técnica antes de ampliar implementación.

**Capacidades incluidas**
- documentación troncal alineada con visión;
- definición de dominio y lenguaje ubicuo;
- arquitectura y reglas no negociables;
- contratos funcionales/documentales para desarrollo posterior.

**Entregable visible esperado**
Base documental coherente, trazable y utilizable para ejecutar ciclos de implementación sin ambigüedades.

**Fuera de alcance del ciclo**
- implementación funcional extensa de producto;
- cierre de microdecisiones de UI final;
- optimizaciones no críticas sin capacidad visible.

**Dependencias clave**
- visión de proyecto validada;
- criterios de calidad documental comunes.

**Riesgos principales**
- sobredefinición teórica sin utilidad operativa;
- ambigüedad entre decisión estratégica y tarea técnica.

**Criterio de cierre**
Documentación estructural suficiente para iniciar implementación por ciclos con alcance claro y trazabilidad estado-documento/estado-producto.

### 6.2 Ciclo 1 — Núcleo herbal navegable
**Objetivo del ciclo**
Entregar una primera capacidad comercial-visible centrada en el universo herbal con navegación coherente.

**Capacidades incluidas**
- catálogo base herbal navegable;
- fichas con información útil para decisión;
- primeras relaciones y rutas de descubrimiento guiado en ámbito herbal.

**Entregable visible esperado**
Demo navegable donde un usuario pueda explorar y comprender oferta herbal de forma creíble.

**Fuera de alcance del ciclo**
- rituales avanzados plenamente conectados;
- capa completa de cuenta de usuario;
- experiencia ecommerce demo integral cerrada.

**Dependencias clave**
- taxonomía base definida;
- lineamientos de contenido editorial aplicable.

**Riesgos principales**
- caer en listado plano sin contexto;
- sobrecarga narrativa que reduzca claridad de compra.

**Criterio de cierre**
Capacidad herbal operativa y navegable con valor de compra/descubrimiento verificable.

### 6.3 Ciclo 2 — Rituales conectados
**Objetivo del ciclo**
Conectar el núcleo herbal con uso ritual de forma útil, sin mística vacía y sin romper claridad comercial.

**Capacidades incluidas**
- relaciones explícitas entre productos herbales y rituales;
- navegación cruzada por propósito/sinergia;
- explicación editorial orientada a decisión.

**Entregable visible esperado**
Experiencia en la que el usuario transita entre producto y ritual con sentido práctico y coherencia narrativa.

**Fuera de alcance del ciclo**
- cierre total de flujo ecommerce demo completo;
- funcionalidades avanzadas de cuenta.

**Dependencias clave**
- consistencia del modelo relacional planta-ritual-producto;
- lineamientos de comunicación no sanitaria.

**Riesgos principales**
- desbalance hacia narrativa sin utilidad;
- complejidad de navegación mal resuelta.

**Criterio de cierre**
Relación ritual-producto implementada y demostrable en recorridos reales de usuario.

### 6.4 Ciclo 3 — Ecommerce demo completo
**Objetivo del ciclo**
Cerrar una demo comercial integral y creíble, manteniendo no activa la compra real.

**Capacidades incluidas**
- recorrido ecommerce demo de punta a punta;
- coherencia entre catálogo, contenido y decisión;
- consistencia global de navegación y propuesta de valor.

**Entregable visible esperado**
Producto demo completo, presentable como experiencia comercial plausible.

**Fuera de alcance del ciclo**
- activación transaccional real;
- integraciones de operación productiva final.

**Dependencias clave**
- estabilidad de capacidades de ciclos 1 y 2;
- validación de coherencia editorial-comercial.

**Riesgos principales**
- demo fragmentada por piezas no integradas;
- pérdida de credibilidad por falta de continuidad en recorridos.

**Criterio de cierre**
Demo ecommerce completa, navegable y consistente, apta para validación de portfolio/business-ready.

### 6.5 Ciclo 4 — Cuenta de usuario con valor
**Objetivo del ciclo**
Introducir capa de usuario que aporte utilidad real al recorrido, no solo presencia técnica.

**Capacidades incluidas**
- funcionalidades de cuenta con impacto directo en experiencia;
- continuidad de recorrido entre descubrimiento y preferencia personal.

**Entregable visible esperado**
Experiencia donde la cuenta mejora de forma perceptible la utilidad del producto.

**Fuera de alcance del ciclo**
- funcionalidades de cuenta no justificadas por valor visible;
- expansión indiscriminada de alcance social/comunitario.

**Dependencias clave**
- demo base estable;
- criterios claros de valor de usuario.

**Riesgos principales**
- añadir complejidad sin mejora tangible;
- romper simplicidad de experiencia principal.

**Criterio de cierre**
Funcionalidades de cuenta implementadas y verificadas como aporte real al uso.

### 6.6 Ciclo 5 — Calendario ritual y capa editorial diferencial
**Objetivo del ciclo**
Consolidar el componente editorial diferencial con utilidad temporal y de descubrimiento avanzado.

**Capacidades incluidas**
- calendario ritual como mecanismo de orientación;
- capa editorial conectada al catálogo y a sinergias;
- continuidad entre contexto cultural y decisión de selección.

**Entregable visible esperado**
Experiencia editorial avanzada que incrementa diferenciación sin perder foco de compra guiada.

**Fuera de alcance del ciclo**
- expansión editorial enciclopédica desvinculada de uso;
- contenidos sin trazabilidad a capacidades de producto.

**Dependencias clave**
- relaciones ritual-producto maduras;
- marco de taxonomías y narrativa estable.

**Riesgos principales**
- deriva a medio de contenido sin utilidad comercial;
- sobrecarga de información en flujos principales.

**Criterio de cierre**
Calendario y capa editorial implementados con impacto demostrable en descubrimiento y coherencia diferencial.

### 6.7 Ciclo 6 — Refinamiento portfolio / business-ready
**Objetivo del ciclo**
Pulir el producto para máxima solidez de portfolio y preparación de evolución a negocio real.

**Capacidades incluidas**
- refinamiento integral de consistencia funcional y narrativa;
- cierre de brechas críticas de credibilidad, mantenibilidad y escalabilidad.

**Entregable visible esperado**
Versión consolidada, profesional y defendible en contexto de portfolio de alto nivel y potencial transición a operación real.

**Fuera de alcance del ciclo**
- reescrituras estructurales no justificadas por valor;
- ampliaciones de alcance que abran nuevos frentes sin cerrar los existentes.

**Dependencias clave**
- cumplimiento sólido de ciclos previos;
- criterios de calidad y coherencia transversal.

**Riesgos principales**
- intentar añadir alcance nuevo en lugar de consolidar;
- degradar arquitectura por cambios tardíos sin control.

**Criterio de cierre**
Producto estabilizado, consistente con la visión y listo para presentación profesional o evolución controlada.

## 7. Criterios de cierre por ciclo
Una capacidad/ciclo solo podrá declararse **DONE** si cumple simultáneamente:

1. Está implementada (no solo descrita).
2. Es verificable, navegable o demostrable según su naturaleza.
3. Tiene validación suficiente para su objetivo de ciclo.
4. No rompe arquitectura, reglas no negociables ni coherencia editorial-comercial.
5. Pasa quality gate cuando exista código aplicable.

No se permite cerrar ciclos por avance parcial horizontal sin experiencia funcional visible.

## 8. Qué queda explícitamente fuera de alcance en fases tempranas
En etapas tempranas (Ciclos 0–2) queda fuera de alcance:

- activación de compra real y operación transaccional productiva;
- cierre exhaustivo del microdetalle de UI final;
- iniciativas aisladas sin capacidad de producto visible;
- expansión de alcance no alineada con la progresión natural → místico;
- cualquier decisión que degrade el enfoque portfolio-first, business-ready.

## 9. Gestión del estado de implementación
Se establece como necesidad futura un fichero vivo de seguimiento (`docs/90_estado_implementacion.md`) para reflejar estado real de capacidades y ciclos.

Requisitos de ese seguimiento (a implementar en tarea posterior):

- separar explícitamente estado documental y estado de implementación;
- registrar estado oficial por capacidad (DEFINIDO, PLANIFICADO, EN_PROGRESO, DONE, BLOQUEADO, DESCARTADO);
- mantener trazabilidad por ciclo;
- evitar declarar DONE sin evidencia verificable.

Este documento no crea ese fichero; solo formaliza su necesidad y criterios.

## 10. Implicaciones para prompts, calidad y roadmap futuro
- Los prompts de implementación se emitirán de forma secuencial, uno por incremento de capacidad.
- Cada prompt deberá referenciar ciclo, objetivo y criterio de cierre aplicable.
- No se debe mezclar en un mismo prompt alcance excesivo que impida validación clara.
- Cuando exista código, el cierre exigirá quality gate antes de consolidar DONE.
- Los futuros documentos de dominio, arquitectura técnica y decisiones no negociables deberán mantener trazabilidad directa con este marco de alcance y ciclos.
- Los futuros roadmaps de prompts deberán priorizar valor visible de producto por encima de tareas técnicas aisladas.
