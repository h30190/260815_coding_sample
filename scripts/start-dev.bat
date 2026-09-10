@echo off
title ArchClock 教學展示啟動器
echo ====================================================
echo             ArchClock 開發模式啟動器
echo             (Vite dev server :3000)
echo ====================================================
echo.
echo [1/2] 正在嘗試開啟預設瀏覽器...
start http://localhost:3000
echo.
echo [2/2] 正在啟動開發伺服器...
echo [提示] 教學假資料：登入頁按「一鍵載入教學假資料」
echo [提示] 關閉伺服器：關閉此視窗或按 Ctrl + C
echo ====================================================
echo.
npm run dev
