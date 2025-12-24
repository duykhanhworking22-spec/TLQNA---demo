@echo off
REM Alternative run script for Spring Boot application
REM This avoids the mvnw spring-boot:run argfile encoding issue

echo Building application...
call mvnw.cmd package -DskipTests

if %ERRORLEVEL% EQU 0 (
    echo.
    echo Starting application...
    java -jar target\hoidapdemo-0.0.1-SNAPSHOT.jar
) else (
    echo.
    echo Build failed!
    pause
    exit /b %ERRORLEVEL%
)
