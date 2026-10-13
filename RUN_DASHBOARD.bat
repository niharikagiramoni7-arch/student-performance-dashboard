@echo off
title Student Performance Dashboard - Server
color 0A
cd /d "%~dp0"

echo ======================================================================
echo          SVKM's NMIMS University - MPSTME
echo          STUDENT PERFORMANCE DASHBOARD LAUNCHER
echo ======================================================================
echo.

:: 1. Check if backend is already running on port 8080
netstat -ano | findstr :8080 | findstr LISTENING >nul 2>&1
if %errorlevel% equ 0 (
    echo [INFO] Backend server is ALREADY running on port 8080!
    echo [INFO] Launching dashboard in your default browser...
    start http://localhost:8080/role-selection.html
    echo.
    echo ======================================================================
    echo Open URL: http://localhost:8080/role-selection.html
    echo ======================================================================
    echo.
    pause
    exit /b 0
)

:: 2. Find Java Runtime
set "JAVA_EXE=java"
where java >nul 2>&1
if %errorlevel% neq 0 (
    if exist "C:\Program Files\Android\Android Studio\jbr\bin\java.exe" (
        set "JAVA_EXE=C:\Program Files\Android\Android Studio\jbr\bin\java.exe"
    ) else if exist "C:\Program Files\Java\jdk-21\bin\java.exe" (
        set "JAVA_EXE=C:\Program Files\Java\jdk-21\bin\java.exe"
    ) else (
        echo [ERROR] Java could not be located on your computer!
        echo Please ensure Java 17+ or 21 is installed.
        pause
        exit /b 1
    )
)

:: 3. Check for the packaged JAR
set "JAR_PATH=%~dp0backend\target\student-performance-backend-0.0.1-SNAPSHOT.jar"
if not exist "%JAR_PATH%" (
    echo [INFO] Packaged JAR not found. Building with Maven...
    cd /d "%~dp0backend"
    call mvn package -DskipTests
    cd /d "%~dp0"
)

if not exist "%JAR_PATH%" (
    echo [ERROR] Backend JAR could not be found or built!
    pause
    exit /b 1
)

:: 4. Start Backend Server
echo [1/3] Starting Spring Boot application on port 8080...
start "Student Performance Backend Server" "%JAVA_EXE%" -jar "%JAR_PATH%"

:: 5. Wait for Tomcat to initialize
echo [2/3] Waiting for server to initialize (approx 5 seconds)...
timeout /t 5 /nobreak >nul

:: 6. Launch browser
echo [3/3] Opening dashboard in your default web browser...
start http://localhost:8080/role-selection.html

echo.
echo ======================================================================
echo    SUCCESS! APPLICATION IS RUNNING.
echo ======================================================================
echo.
echo    Direct Portal Link:  http://localhost:8080/role-selection.html
echo.
echo    Student Login:       student@university.edu.in   (Pass: Student@123)
echo    Faculty Login:       prof.sharma@university.edu.in (Pass: Faculty@123)
echo    Admin Login:         admin@university.edu.in     (Pass: Admin@123)
echo.
echo    IMPORTANT: Keep the "Student Performance Backend Server" window open!
echo ======================================================================
echo.
pause
