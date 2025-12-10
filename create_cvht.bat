@echo off
chcp 65001 > nul
echo Dang tao tai khoan CVHT...
echo Email: a@gmail.com
echo Pass: 111111
echo ------------------------------------------
curl -X POST http://localhost:8081/api/auth/register -H "Content-Type: application/json" -d "{\"email\":\"a@gmail.com\", \"password\":\"111111\", \"hoTen\":\"Co Van Hoc Tap A\", \"soDienThoai\":\"0987654321\", \"role\":\"CVHT\"}"
echo.
echo ------------------------------------------
echo Tao xong! Ban co the dang nhap ngay.
echo Nhan phim bat ky de thoat...
pause
