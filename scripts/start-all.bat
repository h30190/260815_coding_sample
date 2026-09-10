@echo off
title ArchClock 一鍵啟動
echo ====================================================
echo             ArchClock 一鍵啟動
echo             後端 :3001 + 前端 :3000
echo ====================================================
echo.
cd /d "%~dp0"

echo [1/3] 正在啟動後端...
start "ArchClock 後端 :3001" scripts\start-backend.bat
call :waitport 3001 "後端"
if errorlevel 1 goto :fail

echo [2/3] 正在啟動前端...
start "ArchClock 前端 :3000" scripts\start-dev.bat
call :waitport 3000 "前端"
if errorlevel 1 goto :fail

echo [3/3] 開啟瀏覽器...
start http://localhost:3000
echo.
echo 全部啟動完成。關閉服務請分別關掉「後端」與「前端」視窗。
goto :eof

:waitport
set PORT=%1
set NAME=%2
for /L %%i in (1,1,40) do (
  curl --max-time 1 -s -o NUL http://127.0.0.1:%PORT%/ >NUL 2>&1
  if not errorlevel 1 (
    echo %NAME% 已就緒。
    exit /b 0
  )
  timeout /t 1 /nobreak >NUL
)
echo [錯誤] %NAME%（port %PORT%）等 40 秒還沒起來，請看 %NAME% 視窗的錯誤訊息。
exit /b 1

:fail
echo.
echo 啟動失敗，兩個視窗都先別關，把錯誤訊息貼給我看。
pause
