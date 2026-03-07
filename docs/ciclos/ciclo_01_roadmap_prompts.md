# Ciclo 1 — Roadmap oficial de prompts de implementación

## 1) Propósito del documento
Este documento define la secuencia oficial de prompts para ejecutar el **Ciclo 1: núcleo herbal navegable** de forma controlada, incremental y verificable.

Su función operativa es:
- traducir el alcance del ciclo a unidades de implementación atómicas con valor real;
- ordenar dependencias para evitar bloqueos y retrabajo;
- proteger arquitectura, calidad y foco de producto;
- servir de base para pedir y ejecutar luego los prompts **uno a uno**.

Este roadmap no implementa capacidades ni redacta prompts completos: establece la **estructura de ejecución** del ciclo.

## 2) Principios de secuenciación del Ciclo 1
1. **Orden por dependencia real**: primero base de dominio/aplicación, después persistencia y exposición, luego operación (backoffice), luego experiencia pública (frontend), y cierre con validación integral.
2. **Valor demostrable por prompt**: cada prompt debe dejar una pieza funcional que acerque al entregable del ciclo.
3. **No solapar demasiados frentes**: backend y frontend avanzan coordinados, pero frontend no se adelanta a contratos y datos mínimos estables.
4. **Backoffice mínimo, no exhaustivo**: solo lo necesario para sostener carga/edición/publicación del núcleo herbal.
5. **Quality gate con doble nivel**:
   - exigencia desde el primer prompt con código (tests y validaciones mínimas del cambio);
   - cierre operativo del ciclo en un prompt final de consolidación y gate integral.
6. **Control estricto de alcance**: no incluir capacidades de ciclos posteriores aunque sean técnicamente viables.

## 3) Número total de prompts y criterio de partición
### Decisión consolidada
El Ciclo 1 se ejecutará en **8 prompts**.

### Justificación
- Está dentro del rango operativo recomendado (8–12) y mantiene granularidad manejable.
- Permite separar claramente capas y responsabilidades sin fragmentar en microtareas irrelevantes.
- Minimiza riesgo de prompts gigantes o ambiguos.
- Asegura trazabilidad entre alcance de ciclo, arquitectura y criterio de DONE.

### Criterio de partición aplicado
Cada prompt agrupa una **capacidad coherente y cerrable** (no solo tareas técnicas), con entrada/salida explícita y dependencias acotadas.

## 4) Secuencia oficial de prompts del ciclo

| Prompt | Tipo principal | Objetivo operativo |
|---|---|---|
| 1 | Base dominio/aplicación | Establecer modelo y casos de uso mínimos del núcleo herbal (Planta, Producto y relaciones por intención), respetando fronteras de capa. |
| 2 | Persistencia/API interna | Implementar persistencia y repositorios mínimos alineados a PostgreSQL-first, con mapeo limpio dominio-infraestructura. |
| 3 | API/exposición pública | Exponer endpoints/contratos para listado herbal y detalle de planta con resolución comercial mínima asociable. |
| 4 | Backoffice mínimo | Habilitar operación administrativa mínima para alta/edición/publicación de entidades necesarias del ciclo. |
| 5 | Frontend público (home) | Construir home herbal orientadora con entrada clara al recorrido del núcleo herbal. |
| 6 | Frontend público (listado) | Implementar listado herbal navegable conectado a la capa de exposición definida. |
| 7 | Frontend público (detalle) | Implementar ficha de planta y resolución comercial mínima conectada, preservando separación editorial/comercial. |
| 8 | Tests y quality gate de ciclo | Ejecutar cierre técnico del ciclo: validación integral, evidencias, consistencia arquitectónica y gate mínimo operativo aprobado. |

## 5) Dependencias y entregables parciales por prompt

### Prompt 1 — Base de dominio/aplicación
- **Dependencias previas**: documentación base del proyecto y alcance congelado del ciclo.
- **Entregable parcial**: contratos/casos de uso del núcleo herbal definidos en capa de dominio/aplicación, listos para persistencia.
- **Riesgo si se altera orden**: persistir o exponer sin núcleo de negocio estable incrementa deuda estructural.

### Prompt 2 — Persistencia y repositorios mínimos
- **Dependencias previas**: Prompt 1 cerrado.
- **Entregable parcial**: infraestructura de persistencia mínima funcional, repositorios implementados y consistentes con contratos de aplicación.
- **Riesgo si se altera orden**: API y frontend se acoplan a datos inestables o no normalizados para el dominio.

### Prompt 3 — API/capa de exposición
- **Dependencias previas**: Prompts 1 y 2 cerrados.
- **Entregable parcial**: endpoints/serialización para listado y detalle herbal con base consumible por frontend y backoffice de verificación.
- **Riesgo si se altera orden**: frontend sin contratos claros, duplicación de lógica y retrabajo de integración.

### Prompt 4 — Backoffice mínimo útil
- **Dependencias previas**: Prompts 1–3 cerrados.
- **Entregable parcial**: operación administrativa mínima para sostener el contenido/catálogo del ciclo sin personalizaciones fuera de alcance.
- **Riesgo si se altera orden**: dificultad para mantener datos del ciclo y dependencia de cargas manuales no sostenibles.

### Prompt 5 — Frontend home herbal orientadora
- **Dependencias previas**: Prompt 3 cerrado (contratos públicos estables).
- **Entregable parcial**: home con narrativa y navegación efectiva hacia línea herbal (sin abrir checkout ni cuenta).
- **Riesgo si se altera orden**: home desconectada del flujo real y falsa sensación de avance.

### Prompt 6 — Frontend listado herbal navegable
- **Dependencias previas**: Prompts 3 y 5 cerrados.
- **Entregable parcial**: listado consumiendo API real, con estructura de navegación coherente para exploración herbal.
- **Riesgo si se altera orden**: interfaz no integrable, criterios de listado inconsistentes y deuda de UX.

### Prompt 7 — Ficha de planta + resolución comercial mínima
- **Dependencias previas**: Prompts 3 y 6 cerrados (Prompt 4 recomendado para operación estable de contenidos).
- **Entregable parcial**: detalle de planta con contexto editorial no médico y conexión comercial mínima de producto asociado.
- **Riesgo si se altera orden**: ruptura de separación Planta/Producto o detalles incompletos no sostenibles por datos.

### Prompt 8 — Tests y cierre de quality gate del ciclo
- **Dependencias previas**: Prompts 1–7 cerrados.
- **Entregable parcial**: evidencia verificable de cumplimiento técnico/funcional del ciclo y estado apto para declarar cierre operativo.
- **Riesgo si se altera orden**: cierre sin evidencia, deuda oculta y estado DONE no defendible.

## 6) Criterios de paso entre prompts
No se avanza al prompt siguiente sin cumplir todos los criterios de paso del prompt actual:

1. **Objetivo funcional del prompt alcanzado** y demostrable en su alcance.
2. **Fronteras de capa preservadas** (dominio/aplicación/infraestructura/presentación sin mezcla indebida).
3. **Tests del cambio ejecutados** y resultados explícitos.
4. **Sin regressions críticas** sobre lo ya cerrado en el ciclo.
5. **Trazabilidad documental mínima** (qué se implementó, qué quedó fuera y evidencia de validación).
6. **Alineación de alcance**: sin introducir capacidades prohibidas para Ciclo 1.

### Regla adicional de quality gate
- Desde el primer prompt con código: validación mínima obligatoria del cambio.
- En Prompt 8: validación integral y cierre formal del quality gate mínimo operativo del ciclo.

## 7) Qué no entra en este roadmap
Queda explícitamente fuera de la secuencia del Ciclo 1:
- checkout completo end-to-end;
- cuenta de usuario con valor funcional pleno;
- calendario ritual y reglas avanzadas;
- rituales profundos y navegación ritual extensa;
- expansión editorial completa más allá de soporte al núcleo herbal;
- optimizaciones/perfeccionamientos no desbloqueantes del entregable del ciclo.

También se excluyen prompts de refactor masivo sin capacidad nueva demostrable.

## 8) Riesgos de secuencia a evitar
1. **Frontend por delante del dominio**: produce contratos frágiles y retrabajo alto.
2. **Backoffice sobredimensionado**: consume ciclo sin impacto directo en entregable público mínimo.
3. **Prompts excesivamente amplios**: diluyen responsabilidad y dificultan validación objetiva.
4. **Prompts demasiado pequeños**: crean dependencia administrativa sin avance real perceptible.
5. **Cerrar ciclo sin gate**: invalida criterio de DONE técnico y aumenta deuda de mantenimiento.
6. **Mezclar planos editorial/comercial**: rompe anclas del dominio.

## 9) Decisiones congeladas y aspectos evolutivos
### Decisiones congeladas (no reabribles en este roadmap)
- Ciclo 1 permanece acotado a **núcleo herbal navegable**.
- `Planta` y `Producto` se mantienen como entidades separadas.
- Plano editorial y plano comercial permanecen diferenciados.
- Secuencia de ejecución por prompts atómicos, uno a uno.
- Backoffice del ciclo: mínimo útil para sostener operación del alcance.

### Aspectos evolutivos permitidos (sin romper alcance)
- Ajuste fino del contenido de cada prompt al redactarlo formalmente, manteniendo su objetivo y dependencias.
- Definición precisa de criterios de aceptación por prompt, sin alterar la secuencia oficial.
- Graduación técnica del quality gate mínimo, siempre manteniendo su carácter obligatorio.

## 10) Clasificación final por tipo de prompt
Para control de cobertura del ciclo:
- **Base de dominio/aplicación**: Prompt 1.
- **Persistencia/API**: Prompts 2 y 3.
- **Backoffice mínimo**: Prompt 4.
- **Frontend público**: Prompts 5, 6 y 7.
- **Tests y quality gate de cierre**: Prompt 8.

Con esta secuencia, el Ciclo 1 mantiene foco, evita sobrealcance y conserva trazabilidad técnica y de producto para su ejecución real.
