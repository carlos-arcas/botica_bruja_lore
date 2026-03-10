# Ciclo 04 — Cuenta de usuario con valor real

## 1. Propósito
Definir el contrato oficial de alcance del **Ciclo 4** como evolución inmediata tras el cierre del ecommerce demo del Ciclo 3.

## 2. Objetivo oficial
Entregar una **cuenta de usuario útil** que aporte continuidad post-checkout demo y reduzca fricción operativa del usuario, evitando una cuenta cosmética.

## 3. Foco único del ciclo
Capacidades de cuenta estrictamente ligadas a valor tangible:
1. autenticación/entrada con continuidad de flujo;
2. área de usuario mínima con historial de pedidos demo;
3. reglas claras de asociación pedido invitado ↔ cuenta cuando aplique.

## 4. Qué queda fuera del ciclo
- calendario ritual,
- expansión editorial avanzada,
- cobro real o logística real,
- refactors masivos transversales no ligados al foco de cuenta.

## 5. Criterio de DONE del ciclo
El ciclo solo podrá declararse DONE con evidencia verificable de:
1. funcionalidades de cuenta implementadas y navegables con valor real;
2. integración con flujo demo de pedidos sin romper contratos de Ciclo 3;
3. tests y quality gate del ciclo aprobados.

## 6. Dependencias y no regresión
- Dependencia fuerte: **Ciclo 3 oficialmente cerrado**.
- No regresión: preservar el flujo `encargo -> pedido demo -> confirmación -> email demo` como baseline operativa.
