@echo off
title HJPLUS.DESIGN 開發模式
cd /d "%~dp0..\backend"

echo [1/3] 啟動後端（自動灌假資料）...
set SEED_FLAG=--seed
start "後端 :3001" cmd /c "npm run start -- %SEED_FLAG%"

:waitbe
timeout /t 1 /nobreak >NUL
curl -s -o NUL http://127.0.0.1:3001/api/v1/tenants 2>NUL
if errorlevel 1 goto :waitbe
echo       後端已就緒

echo [2/3] 啟動前端...
cd /d "%~dp0.."
start "前端 :3000" cmd /c "npm run dev"

:waitfe
timeout /t 1 /nobreak >NUL
curl -s -o NUL http://127.0.0.1:3000 2>NUL
if errorlevel 1 goto :waitfe
echo       前端已就緒

echo [3/3] 開啟瀏覽器...
start http://localhost:3000
echo.
echo 開發環境已啟動（含假資料）。關掉視窗即停止。
pause
