@echo off
setlocal enableextensions enabledelayedexpansion

set "ROOT_DIR=%~dp0"
set "FRONTEND_PORT=3000"
set "BACKEND_PORT=8000"
set "FRONTEND_URL="
set "BACKEND_URL="
set "HEALTHCHECK_URL="

pushd "%ROOT_DIR%" >nul

echo ================================================
echo [run_app] Arranque local del proyecto
echo ================================================

set "BACKEND_DIR="
if exist "%ROOT_DIR%manage.py" set "BACKEND_DIR=%ROOT_DIR%"
if not defined BACKEND_DIR if exist "%ROOT_DIR%backend\manage.py" set "BACKEND_DIR=%ROOT_DIR%backend"

set "FRONTEND_DIR="
if exist "%ROOT_DIR%package.json" set "FRONTEND_DIR=%ROOT_DIR%"
if not defined FRONTEND_DIR if exist "%ROOT_DIR%frontend\package.json" set "FRONTEND_DIR=%ROOT_DIR%frontend"

if defined FRONTEND_DIR if exist "%FRONTEND_DIR%\.env.local" (
    call :resolve_ports_from_env "%FRONTEND_DIR%\.env.local"
)

set "FRONTEND_URL=http://127.0.0.1:%FRONTEND_PORT%/"
set "BACKEND_URL=http://127.0.0.1:%BACKEND_PORT%/"
set "HEALTHCHECK_URL=http://127.0.0.1:%BACKEND_PORT%/healthz"

if defined BACKEND_DIR (
    call :inspect_port "BACKEND" "%BACKEND_PORT%" "%BACKEND_DIR%" "backend"
    if /I "!BACKEND_STATUS!"=="foreign" (
        echo [ERROR] El puerto %BACKEND_PORT% ya esta en uso por !BACKEND_PROCESS! ^(PID !BACKEND_PID!^) y no pertenece a este repo.
        echo [ERROR] Libera 127.0.0.1:%BACKEND_PORT% y vuelve a ejecutar run_app.bat.
        popd >nul
        exit /b 1
    )
)

if defined FRONTEND_DIR (
    call :inspect_port "FRONTEND" "%FRONTEND_PORT%" "%FRONTEND_DIR%" "frontend"
    if /I "!FRONTEND_STATUS!"=="foreign" (
        echo [ERROR] El puerto %FRONTEND_PORT% ya esta en uso por !FRONTEND_PROCESS! ^(PID !FRONTEND_PID!^) y no pertenece a este repo.
        echo [ERROR] Libera 127.0.0.1:%FRONTEND_PORT% y vuelve a ejecutar run_app.bat.
        popd >nul
        exit /b 1
    )
)

call "%ROOT_DIR%setup_entorno.bat"
if errorlevel 1 (
    echo [ERROR] setup_entorno.bat fallo. No se puede continuar.
    popd >nul
    exit /b 1
)

set "LOCAL_SQLITE=%ROOT_DIR%var\dev.sqlite3"
set "BOOTSTRAP_LOCAL=0"
if not defined DATABASE_URL if not exist "%LOCAL_SQLITE%" set "BOOTSTRAP_LOCAL=1"

if not defined BACKEND_DIR if not defined FRONTEND_DIR (
    echo [ADVERTENCIA] No se detectaron componentes ejecutables aun.
    echo [ADVERTENCIA] El repositorio esta preparado para crecer por ciclos.
    exit /b 0
)

if "%CHECK_ONLY%"=="1" (
    if defined BACKEND_DIR echo [OK] Backend Django detectable en "%BACKEND_DIR%".
    if defined FRONTEND_DIR echo [OK] Frontend Next detectable en "%FRONTEND_DIR%".
    echo [OK] Comprobacion de arranque local completada sin iniciar servidores.
    exit /b 0
)

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

    if /I "!BACKEND_STATUS!"=="repo" (
        echo [INFO] Backend Django ya estaba en ejecucion en 127.0.0.1:%BACKEND_PORT% ^(PID !BACKEND_PID!^). Se reutiliza.
    ) else (
        echo [INFO] Iniciando backend Django en %BACKEND_DIR%...
        start "Backend Django" /D "%BACKEND_DIR%" cmd /k call "%ROOT_DIR%.venv\Scripts\activate.bat" ^&^& python manage.py runserver 127.0.0.1:%BACKEND_PORT%
    )
) else (
    echo [INFO] No se detecto manage.py. Backend Django no disponible.
)

if defined FRONTEND_DIR (
    if /I "!FRONTEND_STATUS!"=="repo" (
        echo [INFO] Frontend Next ya estaba en ejecucion en 127.0.0.1:%FRONTEND_PORT% ^(PID !FRONTEND_PID!^). Se reutiliza.
    ) else (
        echo [INFO] Iniciando frontend en %FRONTEND_DIR%...
        start "Frontend Next" /D "%FRONTEND_DIR%" cmd /k npm run dev -- --hostname 127.0.0.1 --port %FRONTEND_PORT%
    )
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

:resolve_ports_from_env
set "BOTICA_ENV_FILE=%~1"
set "PS_PORTS=$file=$env:BOTICA_ENV_FILE; if(-not (Test-Path $file)){ exit 0 }; $content=Get-Content $file; $api=($content | Where-Object { $_ -match '^NEXT_PUBLIC_API_BASE_URL=' } | Select-Object -First 1); if($api){ $value=$api.Substring('NEXT_PUBLIC_API_BASE_URL='.Length).Trim(); if($value){ try { $uri=[Uri]$value; if($uri.Port -gt 0){ Write-Output ('set BACKEND_PORT=' + $uri.Port) } } catch {} } }; $site=($content | Where-Object { $_ -match '^NEXT_PUBLIC_SITE_URL=' } | Select-Object -First 1); if($site){ $value=$site.Substring('NEXT_PUBLIC_SITE_URL='.Length).Trim(); if($value){ try { $uri=[Uri]$value; if($uri.Port -gt 0){ Write-Output ('set FRONTEND_PORT=' + $uri.Port) } } catch {} } }"
for /f "usebackq delims=" %%A in (`powershell -NoLogo -NoProfile -ExecutionPolicy Bypass -Command "!PS_PORTS!"`) do %%A
exit /b 0

:inspect_port
set "%~1_STATUS=free"
set "%~1_PID="
set "%~1_PROCESS="
set "BOTICA_PORT=%~2"
set "BOTICA_EXPECTED_DIR=%~3"
set "BOTICA_KIND=%~4"
set "PS_INSPECT=$port=[int]$env:BOTICA_PORT; $expectedDir=[System.IO.Path]::GetFullPath($env:BOTICA_EXPECTED_DIR).TrimEnd('\'); $kind=$env:BOTICA_KIND; $connections=@(Get-NetTCPConnection -LocalAddress '127.0.0.1' -LocalPort $port -State Listen -ErrorAction SilentlyContinue); if($connections.Count -eq 0){ Write-Output 'set %~1_STATUS=free'; exit 0 }; $conn=$connections[0]; $proc=Get-CimInstance Win32_Process -Filter ('ProcessId = ' + $conn.OwningProcess) -ErrorAction SilentlyContinue; $name='proceso'; if($proc -and $proc.Name){$name=$proc.Name}; $cmd=''; if($proc -and $proc.CommandLine){$cmd=$proc.CommandLine}; $exe=''; if($proc -and $proc.ExecutablePath){$exe=$proc.ExecutablePath}; $haystack=(($cmd + ' ' + $exe) -replace '/','\').ToLowerInvariant(); $expected=$expectedDir.Replace('/','\').ToLowerInvariant(); $isRepo=$false; if($expected -and $haystack.Contains($expected)){ if($kind -eq 'frontend' -and $haystack.Contains('next\dist\server\lib\start-server.js')){$isRepo=$true}; if($kind -eq 'backend' -and $haystack.Contains('manage.py runserver')){$isRepo=$true} }; $status='foreign'; if($isRepo){$status='repo'}; Write-Output ('set %~1_STATUS=' + $status); Write-Output ('set %~1_PID=' + $conn.OwningProcess); Write-Output ('set %~1_PROCESS=' + $name);"
for /f "usebackq delims=" %%A in (`powershell -NoLogo -NoProfile -ExecutionPolicy Bypass -Command "!PS_INSPECT!"`) do %%A
exit /b 0
