@echo off
REM Quick run script for Spring Boot application
REM Uses exec-maven-plugin instead of spring-boot-maven-plugin to avoid argfile encoding issue

echo Starting application with Maven Exec Plugin...
.\mvnw.cmd exec:java
