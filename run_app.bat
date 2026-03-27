@echo off
setlocal enableextensions

set "ROOT_DIR=%~dp0"
set "FRONTEND_URL=http://127.0.0.1:3000/"
set "BACKEND_URL=http://127.0.0.1:8000/"
set "HEALTHCHECK_URL=http://127.0.0.1:8000/healthz"

pushd "%ROOT_DIR%" >nul

echo ================================================
echo [run_app] Arranque local del proyecto
echo ================================================

call "%ROOT_DIR%setup_entorno.bat"
if errorlevel 1 (
    echo [ERROR] setup_entorno.bat fallo. No se puede continuar.
    popd >nul
    exit /b 1
)

set "BACKEND_DIR="
if exist "%ROOT_DIR%manage.py" set "BACKEND_DIR=%ROOT_DIR%"
if not defined BACKEND_DIR if exist "%ROOT_DIR%backend\manage.py" set "BACKEND_DIR=%ROOT_DIR%backend"

set "FRONTEND_DIR="
if exist "%ROOT_DIR%package.json" set "FRONTEND_DIR=%ROOT_DIR%"
if not defined FRONTEND_DIR if exist "%ROOT_DIR%frontend\package.json" set "FRONTEND_DIR=%ROOT_DIR%frontend"

set "LOCAL_SQLITE=%ROOT_DIR%var\dev.sqlite3"
set "BOOTSTRAP_LOCAL=0"
if not defined DATABASE_URL if not exist "%LOCAL_SQLITE%" set "BOOTSTRAP_LOCAL=1"

if defined BACKEND_DIR (
    echo [INFO] Aplicando migraciones locales en %BACKEND_DIR%...
    pushd "%BACKEND_DIR%" >nul
    call "%ROOT_DIR%.venv\Scripts\python.exe" manage.py migrate --noinput
    if errorlevel 1 (
        echo [ERROR] Fallo al aplicar migraciones Django.
        popd >nul
        popd >nul
        exit /b 1
    )
    if "%BOOTSTRAP_LOCAL%"=="1" if exist "%ROOT_DIR%backend\nucleo_herbal\infraestructura\persistencia_django\management\commands\seed_demo_publico.py" (
        echo [INFO] Primera base local detectada. Cargando seed demo publica...
        call "%ROOT_DIR%.venv\Scripts\python.exe" manage.py seed_demo_publico
        if errorlevel 1 (
            echo [ERROR] Fallo al cargar seed_demo_publico.
            popd >nul
            popd >nul
            exit /b 1
        )
    )
    popd >nul

    echo [INFO] Iniciando backend Django en %BACKEND_DIR%...
    start "Backend Django" /D "%BACKEND_DIR%" cmd /k call "%ROOT_DIR%.venv\Scripts\activate.bat" ^&^& python manage.py runserver 127.0.0.1:8000
) else (
    echo [INFO] No se detecto manage.py. Backend Django no disponible.
)

if defined FRONTEND_DIR (
    echo [INFO] Iniciando frontend en %FRONTEND_DIR%...
    start "Frontend Next" /D "%FRONTEND_DIR%" cmd /k npm run dev -- --hostname 127.0.0.1 --port 3000
) else (
    echo [INFO] No se detecto package.json de frontend. Frontend no disponible.
)

if not defined BACKEND_DIR if not defined FRONTEND_DIR (
    echo [ADVERTENCIA] No se detectaron componentes ejecutables aun.
    echo [ADVERTENCIA] El repositorio esta preparado para crecer por ciclos.
    popd >nul
    exit /b 0
)

if /I "%BOTICA_NO_BROWSER%"=="1" (
    echo [INFO] BOTICA_NO_BROWSER=1; se omite apertura automatica del navegador.
) else if defined FRONTEND_DIR (
    echo [INFO] Esperando al frontend para abrir el home en %FRONTEND_URL%...
    powershell -NoLogo -NoProfile -ExecutionPolicy Bypass -Command "$ErrorActionPreference='SilentlyContinue'; $deadline=(Get-Date).AddSeconds(90); while((Get-Date) -lt $deadline){ try { $response = Invoke-WebRequest -Uri '%FRONTEND_URL%' -UseBasicParsing -TimeoutSec 2; if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 500) { Start-Process '%FRONTEND_URL%'; exit 0 } } catch {} Start-Sleep -Seconds 2 }; exit 1"
    if errorlevel 1 (
        echo [ADVERTENCIA] El frontend no respondio a tiempo. Puedes abrir manualmente %FRONTEND_URL%
    ) else (
        echo [OK] Navegador abierto en %FRONTEND_URL%
    )
) else if defined BACKEND_DIR (
    echo [INFO] Frontend no disponible. Se abrira el backend en %BACKEND_URL%...
    powershell -NoLogo -NoProfile -ExecutionPolicy Bypass -Command "$ErrorActionPreference='SilentlyContinue'; $deadline=(Get-Date).AddSeconds(60); while((Get-Date) -lt $deadline){ try { $response = Invoke-WebRequest -Uri '%HEALTHCHECK_URL%' -UseBasicParsing -TimeoutSec 2; if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 500) { Start-Process '%BACKEND_URL%'; exit 0 } } catch {} Start-Sleep -Seconds 2 }; exit 1"
    if errorlevel 1 (
        echo [ADVERTENCIA] El backend no respondio a tiempo. Puedes abrir manualmente %BACKEND_URL%
    ) else (
        echo [OK] Navegador abierto en %BACKEND_URL%
    )
)

echo [OK] Procesos de arranque lanzados en ventanas separadas.
popd >nul
exit /b 0
