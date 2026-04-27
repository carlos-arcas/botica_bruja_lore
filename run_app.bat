@echo off
setlocal enableextensions

echo ================================================
echo [run_app] Arranque local del proyecto
echo ================================================

set "CHECK_ONLY=0"
if /I "%~1"=="--check" set "CHECK_ONLY=1"
if /I "%~1"=="/check" set "CHECK_ONLY=1"

if "%CHECK_ONLY%"=="1" (
    call setup_entorno.bat --check
) else (
    call setup_entorno.bat
)
if errorlevel 1 (
    echo [ERROR] setup_entorno.bat fallo. No se puede continuar.
    exit /b 1
)

set "BACKEND_DIR="
if exist manage.py set "BACKEND_DIR=."
if not defined BACKEND_DIR if exist backend\manage.py set "BACKEND_DIR=backend"

set "FRONTEND_DIR="
if exist package.json set "FRONTEND_DIR=."
if not defined FRONTEND_DIR if exist frontend\package.json set "FRONTEND_DIR=frontend"

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
    echo [INFO] Iniciando backend Django en %BACKEND_DIR%...
    start "Backend Django" cmd /k "cd /d %CD%\%BACKEND_DIR% && call ..\.venv\Scripts\activate.bat 2>nul || call .venv\Scripts\activate.bat && python manage.py runserver"
) else (
    echo [INFO] No se detecto manage.py. Backend Django no disponible.
)

if defined FRONTEND_DIR (
    echo [INFO] Iniciando frontend en %FRONTEND_DIR%...
    start "Frontend Next" cmd /k "cd /d %CD%\%FRONTEND_DIR% && npm run dev"
) else (
    echo [INFO] No se detecto package.json de frontend. Frontend no disponible.
)

echo [OK] Procesos de arranque lanzados en ventanas separadas.
exit /b 0
