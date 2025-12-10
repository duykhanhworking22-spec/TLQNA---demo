@echo off
chcp 65001 > nul
echo Dang ket noi server de tao Admin...
echo Email: admin@gmail.com
echo Pass: 123456
echo ------------------------------------------
curl -X POST http://localhost:8081/api/setup/create-admin -H "Content-Type: application/json" -d "{\"email\":\"admin@gmail.com\", \"password\":\"123456\"}"
echo.
echo ------------------------------------------
echo Neu bao loi "Admin da ton tai", nghia la da tao roi.
echo Nhan phim bat ky de thoat...
pause
