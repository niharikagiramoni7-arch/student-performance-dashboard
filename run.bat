@echo off
setlocal enabledelayedexpansion

echo ===================================================
echo     STUDENT PERFORMANCE DASHBOARD - LAUNCHER
echo ===================================================

:: 1. Locate Java
set "JAVA_CMD=java"
where java >nul 2>nul
if %errorlevel% neq 0 (
    if defined JAVA_HOME (
        set "JAVA_CMD=%JAVA_HOME%\bin\java.exe"
    ) else if exist "C:\Program Files\Android\Android Studio\jbr\bin\java.exe" (
        set "JAVA_CMD=C:\Program Files\Android\Android Studio\jbr\bin\java.exe"
    ) else (
        echo [ERROR] Java 17+ or 21 was not found in PATH or JAVA_HOME.
        echo Please install Java 17+ or set JAVA_HOME.
        pause
        exit /b 1
    )
)

echo [OK] Using Java: "%JAVA_CMD%"

:: 2. Check JAR file
set "JAR_PATH=backend\target\student-performance-backend-0.0.1-SNAPSHOT.jar"

if not exist "%JAR_PATH%" (
    echo [INFO] JAR file not found. Building project with Maven...
    set "MVN_CMD=mvn"
    where mvn >nul 2>nul
    if !errorlevel! neq 0 (
        if exist "%USERPROFILE%\Downloads\apache-maven-3.9.6\bin\mvn.cmd" (
            set "MVN_CMD=%USERPROFILE%\Downloads\apache-maven-3.9.6\bin\mvn.cmd"
        ) else (
            echo [ERROR] Maven not found. Please run 'mvn clean package -DskipTests' inside 'backend' folder.
            pause
            exit /b 1
        )
    )
    cd backend
    call !MVN_CMD! clean package -DskipTests
    cd ..
)

echo.
echo ===================================================
echo Starting Application at http://localhost:8080 ...
echo Press Ctrl+C at any time to stop the server.
echo ===================================================
echo.

start "" http://localhost:8080
"%JAVA_CMD%" -jar "%JAR_PATH%"
pause
