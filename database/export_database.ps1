$ErrorActionPreference = 'Stop'

function Get-AdminToken {
    $loginBody = @{
        email = 'admin@university.edu.in'
        password = 'Admin@123'
        role = 'ROLE_ADMIN'
    } | ConvertTo-Json
    $resp = Invoke-RestMethod -Uri 'http://localhost:8080/api/auth/login' -Method Post -Body $loginBody -ContentType 'application/json'
    if ($resp.requiresOtp) {
        $otpBody = @{
            email = 'admin@university.edu.in'
            otp = $resp.otp
            role = 'ROLE_ADMIN'
        } | ConvertTo-Json
        $verifyResp = Invoke-RestMethod -Uri 'http://localhost:8080/api/auth/verify-login-otp' -Method Post -Body $otpBody -ContentType 'application/json'
        return $verifyResp.token
    }
    return $resp.token
}

$token = Get-AdminToken
$headers = @{ Authorization = "Bearer $token" }

$timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
$out = "-- ======================================================`n"
$out += "-- CURRENT LIVE DATABASE EXPORT`n"
$out += "-- Generated on $timestamp`n"
$out += "-- ======================================================`n`n"
$out += "USE student_performance_db;`n`n"

# Export Users
$usersResp = Invoke-RestMethod -Uri 'http://localhost:8080/api/admin/users?page=0&size=100' -Method Get -Headers $headers
$users = $usersResp.users
$out += "-- 1. USERS TABLE ($($users.Count) records stored):`n"
$out += "INSERT INTO users (id, email, full_name, phone, role, status) VALUES`n"
$userRows = @()
foreach ($u in $users) {
    $fn = $u.fullName -replace "'", "''"
    $userRows += "  ($($u.id), '$($u.email)', '$fn', '$($u.phone)', '$($u.role)', '$($u.status)')"
}
$out += ($userRows -join ",`n") + ";`n`n"

# Export Login Audits
$auditsResp = Invoke-RestMethod -Uri 'http://localhost:8080/api/admin/login-audits?page=0&size=100' -Method Get -Headers $headers
$audits = $auditsResp.audits
$out += "-- 2. LOGIN AUDIT LOGS TABLE ($($audits.Count) records stored):`n"
$out += "INSERT INTO login_audits (id, user_id, email, full_name, role, ip_address, status, remarks, login_time) VALUES`n"
$auditRows = @()
foreach ($a in $audits) {
    $fn = ($a.fullName -replace "'", "''")
    $rem = ($a.remarks -replace "'", "''")
    $uid = if ($a.userId) { $a.userId } else { "NULL" }
    $auditRows += "  ($($a.id), $uid, '$($a.email)', '$fn', '$($a.role)', '$($a.ipAddress)', '$($a.status)', '$rem', '$($a.loginTime)')"
}
$out += ($auditRows -join ",`n") + ";`n`n"

# Export Departments
$depts = Invoke-RestMethod -Uri 'http://localhost:8080/api/admin/departments' -Method Get -Headers $headers
$out += "-- 3. DEPARTMENTS TABLE ($($depts.Count) records stored):`n"
$out += "INSERT INTO departments (id, code, name) VALUES`n"
$deptRows = @()
foreach ($d in $depts) {
    $deptRows += "  ($($d.id), '$($d.code)', '$($d.name)')"
}
$out += ($deptRows -join ",`n") + ";`n`n"

# Export Subjects
$subjects = Invoke-RestMethod -Uri 'http://localhost:8080/api/admin/subjects' -Method Get -Headers $headers
$out += "-- 4. SUBJECTS TABLE ($($subjects.Count) records stored):`n"
$out += "INSERT INTO subjects (id, code, name, department, credits, semester) VALUES`n"
$subjRows = @()
foreach ($s in $subjects) {
    $sName = $s.name -replace "'", "''"
    $subjRows += "  ($($s.id), '$($s.code)', '$sName', '$($s.department)', $($s.credits), $($s.semester))"
}
$out += ($subjRows -join ",`n") + ";`n"

$out | Out-File -FilePath 'database/current_database_export.sql' -Encoding UTF8
Write-Host "Live database exported successfully to database/current_database_export.sql!"
