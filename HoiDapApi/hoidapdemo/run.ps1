# Script to run Spring Boot application
# This bypasses the mvnw spring-boot:run issue

Write-Host "Building application..." -ForegroundColor Green
& .\mvnw.cmd package -DskipTests

if ($LASTEXITCODE -eq 0) {
    Write-Host "`nStarting application..." -ForegroundColor Green
    java -jar target\hoidapdemo-0.0.1-SNAPSHOT.jar
} else {
    Write-Host "`nBuild failed!" -ForegroundColor Red
}
