@echo off
title ArchClock 後端啟動器
echo ====================================================
echo             ArchClock 後端啟動器
echo             (Express + SQLite :3001)
echo ====================================================
echo.
cd /d "%~dp0..\backend"
if not exist data\archclock.db (
  echo [1/2] 首次啟動，正在灌教學假資料...
  call npm run seed
) else (
  echo [1/2] 資料庫已存在，跳過灌資料。
)
echo.
echo [2/2] 正在啟動後端伺服器...
echo [提示] 前端開 scripts\start-dev.bat，兩邊一起跑才會連上。
echo [提示] 關閉伺服器：關閉此視窗或按 Ctrl + C
echo ====================================================
echo.
npm run dev
