Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "    STUDENT PERFORMANCE DASHBOARD - LAUNCHER" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan

# 1. Locate Java
$javaCmd = "java"
if (-not (Get-Command java -ErrorAction SilentlyContinue)) {
    if ($env:JAVA_HOME -and (Test-Path "$env:JAVA_HOME\bin\java.exe")) {
        $javaCmd = "$env:JAVA_HOME\bin\java.exe"
    } elseif (Test-Path "C:\Program Files\Android\Android Studio\jbr\bin\java.exe") {
        $javaCmd = "C:\Program Files\Android\Android Studio\jbr\bin\java.exe"
    } else {
        Write-Host "[ERROR] Java 17+ or 21 was not found in PATH or JAVA_HOME." -ForegroundColor Red
        Write-Host "Please install Java or set JAVA_HOME."
        Exit 1
    }
}

Write-Host "[OK] Using Java: $javaCmd" -ForegroundColor Green

# 2. Check JAR file
$jarPath = "backend\target\student-performance-backend-0.0.1-SNAPSHOT.jar"

if (-not (Test-Path $jarPath)) {
    Write-Host "[INFO] JAR not found. Building project with Maven..." -ForegroundColor Yellow
    $mvnCmd = "mvn"
    if (-not (Get-Command mvn -ErrorAction SilentlyContinue)) {
        if (Test-Path "$env:USERPROFILE\Downloads\apache-maven-3.9.6\bin\mvn.cmd") {
            $mvnCmd = "$env:USERPROFILE\Downloads\apache-maven-3.9.6\bin\mvn.cmd"
        } else {
            Write-Host "[ERROR] Maven not found. Run 'mvn clean package -DskipTests' inside backend." -ForegroundColor Red
            Exit 1
        }
    }
    Push-Location backend
    & $mvnCmd clean package -DskipTests
    Pop-Location
}

Write-Host "`nStarting Application at http://localhost:8080 ..." -ForegroundColor Cyan
Write-Host "Press Ctrl+C at any time to stop the server.`n" -ForegroundColor DarkGray

Start-Process "http://localhost:8080"
& $javaCmd -jar $jarPath
