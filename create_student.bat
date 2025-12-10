@echo off
chcp 65001 > nul
echo Dang tao tai khoan Sinh Vien mau...
echo Email: a11111@gmail.com
echo Pass: 111111
echo ------------------------------------------
curl -X POST http://localhost:8081/api/auth/register -H "Content-Type: application/json" -d "{\"email\":\"a11111@gmail.com\", \"password\":\"111111\", \"hoTen\":\"Nguyen Van A\", \"soDienThoai\":\"0912345678\", \"role\":\"SINH_VIEN\"}"
echo.
echo ------------------------------------------
echo Bay gio ban co the Login bang tai khoan: a11111@gmail.com / 111111
echo Nhan phim bat ky de thoat...
pause
