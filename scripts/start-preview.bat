@echo off
title ArchClock 驗收模式啟動器
echo ====================================================
echo             ArchClock 驗收模式啟動器
echo             (正式打包 + 預覽 :4173)
echo ====================================================
echo.
echo [1/3] 正在打包正式版本...
call npm run build
if errorlevel 1 (
  echo [錯誤] 打包失敗，請檢查上方錯誤訊息。
  pause
  exit /b 1
)
echo.
echo [2/3] 正在開啟預設瀏覽器...
start http://localhost:4173
echo.
echo [3/3] 正在啟動預覽伺服器...
echo [提示] 驗收完畢後關閉此視窗即可。
echo ====================================================
echo.
npm run preview
