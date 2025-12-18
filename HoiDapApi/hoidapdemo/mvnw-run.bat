@echo off
REM Run Spring Boot application using Maven Exec Plugin instead of spring-boot:run
REM This avoids argfile encoding issues

.\mvnw.cmd clean compile exec:java -Dexec.mainClass="com.hoidap.hoidapdemo.HoidapdemoApplication" -Dexec.classpathScope=runtime
