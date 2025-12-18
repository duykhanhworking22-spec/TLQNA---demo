@echo off
chcp 65001 >nul
title TLQNA Launcher
echo ==========================================
echo      KHOI DONG LAI HE THONG (Auto)
echo ==========================================

echo [1] Dang dung cac tien trinh cu (Java, Node)...
taskkill /F /IM java.exe /T >nul 2>&1
taskkill /F /IM node.exe /T >nul 2>&1

echo.
echo [2] Dang khoi dong Backend...
echo     (Cua so moi se hien ra, ban hay cho den khi thay "Started... in ... seconds")
if exist "HoiDapApi\hoidapdemo\run.bat" (
    cd "HoiDapApi\hoidapdemo"
    start "Backend Server" run.bat
    cd ..\..
) else (
    echo [LOI] Khong tim thay thu muc Backend!
    pause
    exit
)

echo.
echo [3] Dang khoi dong Frontend...
echo     (Cua so moi se hien ra)
start "Frontend Client" cmd /k "npm run dev"

echo.
echo XONG! Hay doi 1-2 phut de Backend khoi dong xong roi hay F5 trinh duyet.
echo ==========================================
timeout /t 10
