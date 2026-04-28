# Pagos: modo local simulado y Stripe reservado

## 1. Decision vigente
El proveedor activo para ecommerce local simulado es:

```env
BOTICA_PAYMENT_PROVIDER=simulado_local
```

Stripe queda reservado para una fase posterior. Este documento prepara el cambio futuro sin activarlo ahora.

## 2. Contrato de proveedores
| Proveedor | Estado | Uso permitido |
|---|---|---|
| `simulado_local` | Activo por defecto local | Demo local, desarrollo, portfolio y validacion del flujo sin cobro externo. |
| `stripe` | Reservado futuro | Solo fase explicita de Stripe sandbox/real con claves, URLs, pruebas y aprobacion. |

Valores distintos de `simulado_local` o `stripe` deben fallar de forma clara.

## 3. Modo local simulado
El adaptador `PasarelaPagoSimuladaLocal` implementa el mismo puerto de pago que Stripe:

- crea una intencion auditable `SIM-{id_pedido}-{operation_id}`;
- devuelve proveedor `simulado_local`;
- no llama a servicios externos;
- no procesa webhooks en esta fase;
- permite que la confirmacion local reutilice post-pago real.

El modo local no exige `STRIPE_PUBLIC_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `PAYMENT_SUCCESS_URL` ni `PAYMENT_CANCEL_URL`.

## 4. Stripe futuro
Para activar Stripe en una fase posterior, la seleccion debe ser explicita:

```env
BOTICA_PAYMENT_PROVIDER=stripe
STRIPE_PUBLIC_KEY=<stripe_public_key>
STRIPE_SECRET_KEY=<stripe_secret_key>
STRIPE_WEBHOOK_SECRET=<stripe_webhook_secret>
PAYMENT_SUCCESS_URL=https://frontend.example.com/pedido/{ID_PEDIDO}?retorno_pago=success&session_id={CHECKOUT_SESSION_ID}
PAYMENT_CANCEL_URL=https://frontend.example.com/pedido/{ID_PEDIDO}?retorno_pago=cancel
```

Reglas:
- no poner claves secretas en frontend;
- no versionar valores reales;
- no imprimir claves en logs ni errores;
- no mezclar activacion Stripe con retirada legacy;
- no cerrar `V2-R10` solo por configurar Stripe.

## 5. Precondiciones antes de activar Stripe
1. Staging separado con variables propias.
2. Stripe sandbox configurado y probado.
3. URLs de retorno HTTPS y absolutas.
4. Webhook validado con firma.
5. Pruebas de pago, cancelacion, fallo e idempotencia.
6. Smoke post-deploy sobre URLs reales.
7. Backup/restore real verificado.
8. Revision legal/fiscal profesional.
9. Plan de rollback a `simulado_local`.

## 6. Guardrails actuales
- `settings.py` usa `simulado_local` como default.
- `validar_configuracion_pago` solo acepta `simulado_local` o `stripe`.
- Si `BOTICA_PAYMENT_PROVIDER=stripe`, las claves y URLs obligatorias deben existir.
- El gate local avisa si el entorno se ejecuta con `BOTICA_PAYMENT_PROVIDER=stripe`.
- Los tests de deploy verifican que `simulado_local` no exige claves Stripe.
- Los errores de configuracion mencionan nombres de variables, no valores secretos.

## 7. Pruebas obligatorias antes de una fase Stripe
Ejecutar como minimo:

```powershell
python manage.py check
python manage.py test tests.nucleo_herbal.test_pago_real tests.nucleo_herbal.test_api_pago_real
python manage.py test tests.nucleo_herbal.test_deploy_guards
python -m unittest tests.scripts.test_check_ecommerce_local_simulado
python scripts/check_ecommerce_local_simulado.py
```

En staging Stripe:
- pago completado;
- pago cancelado;
- webhook firmado valido;
- webhook con firma invalida rechazado;
- pedido no duplicado ante reintento;
- logs sin secretos.

## 8. Rollback
Si Stripe falla en staging o no cumple criterios:

1. volver a `BOTICA_PAYMENT_PROVIDER=simulado_local`;
2. retirar claves del entorno donde no sean necesarias;
3. ejecutar gate local y tests de pago simulado;
4. documentar el bloqueo antes de reintentar.
