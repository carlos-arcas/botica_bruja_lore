# CHECKLIST DE RELEASE — seguridad, privacidad y backup/restore (mínimo operativo)

## 1) Seguridad de configuración (bloqueante)
- `DEBUG=false`.
- `SECRET_KEY` definida y no trivial.
- `DATABASE_URL` PostgreSQL válida (sin SQLite en producción).
- `PUBLIC_SITE_URL`, `PAYMENT_SUCCESS_URL` y `PAYMENT_CANCEL_URL` en **HTTPS absoluto**.
- `EMAIL_BACKEND` de producción (no `locmem`, `console` ni `filebased`).
- `DEFAULT_FROM_EMAIL` con dominio real (no `.local`).
- `STRIPE_SECRET_KEY` y `STRIPE_WEBHOOK_SECRET` definidas.

## 2) PRIVACIDAD OPERATIVA (mínimo)
- No exponer secretos en logs.
- El visor técnico de logs solo devuelve contenido sanitizado.
- No habilitar debug log viewer en producción salvo incidente controlado y clave temporal robusta.
- Validar ACL de cuenta real: pedidos/documentos/pago de pedidos autenticados solo para propietario o staff.
- Validar ACL de backoffice: proxy privado Next y backend rechazan acceso sin sesión staff.

## 3) BACKUP / RESTORE (mínimo viable, PostgreSQL)

### Prerrequisitos operativos
- Tener `pg_dump` y `pg_restore` disponibles en `PATH`.
- Definir `DATABASE_URL` (origen) y una URL separada para restore drill (`BOTICA_RESTORE_DATABASE_URL`).
- Definir `BOTICA_BACKUP_DIR` apuntando **fuera del repositorio** (por ejemplo `/tmp/botica_backups`).

### Opción recomendada (script reutilizable V2)
```bash
# Backup real
export DATABASE_URL='postgresql://USER:PASSWORD@HOST:PORT/DBNAME?sslmode=require'
export BOTICA_BACKUP_DIR='/tmp/botica_backups'
python scripts/backup_restore_postgres.py backup

# Restore drill real sobre BBDD temporal (nunca producción)
export BOTICA_RESTORE_DATABASE_URL='postgresql://USER:PASSWORD@HOST:PORT/DBNAME_RESTORE?sslmode=require'
python scripts/backup_restore_postgres.py restore-drill --dump-file '/tmp/botica_backups/ARCHIVO.dump'

# Modo verificable seguro (sin escritura): plan + parámetros no sensibles
python scripts/backup_restore_postgres.py backup --dry-run
python scripts/backup_restore_postgres.py restore-drill --dry-run --dump-file '/tmp/botica_backups/ARCHIVO.dump'
```

### Opción fallback manual (si no se usa script)
```bash
pg_dump --no-owner --no-privileges --format=custom --file="/tmp/botica_backups/backup_pre_release.dump" "$DATABASE_URL"
pg_restore --no-owner --no-privileges --clean --if-exists --dbname="$BOTICA_RESTORE_DATABASE_URL" /tmp/botica_backups/backup_pre_release.dump
```

### Criterio mínimo de backup válido
- El backup termina con código `0` (`scripts/backup_restore_postgres.py backup` o `pg_dump`).
- El restore drill en base temporal termina con código `0` (`scripts/backup_restore_postgres.py restore-drill` o `pg_restore`).
- Se ejecuta `python manage.py check` contra la base restaurada.
- Para runners sin DB/CLI de PostgreSQL: `--dry-run` cuenta solo como verificación de plan (no como drill real ejecutado).

## 4) CHECKLIST DE RELEASE (pre-flight)
1. `python scripts/check_release_gate.py`
2. `python scripts/check_release_readiness.py`
3. `python scripts/check_operational_reconciliation.py --fail-on blocker`
4. `python scripts/check_operational_alerts_v2.py --fail-on blocker` (resumen operativo accionable y serializable de alertas mínimas v2).
5. `python scripts/retry_operational_tasks_v2.py --dry-run --json` (previsualización de reintentos elegibles sin mutación antes de operar en modo real).
6. `python scripts/backup_restore_postgres.py backup --dry-run` (validación segura de plan/comandos).
7. Backup lógico real antes del deploy.
8. Restore drill en base temporal cuando el entorno lo permita.
9. Deploy.
10. Smoke post-deploy (`python scripts/check_deployed_stack.py` con URLs reales).

## 5) Alcance explícitamente fuera de este checklist
- No cubre SOC2/ISO, SIEM, MFA corporativo ni RBAC avanzado.
- No sustituye auditorías legales de privacidad/retención por país.
