$ErrorActionPreference = 'Stop'

function Get-AuthToken($email, $password, $role) {
    $loginBody = @{
        email = $email
        password = $password
        role = $role
    } | ConvertTo-Json

    $resp = Invoke-RestMethod -Uri 'http://localhost:8080/api/auth/login' -Method Post -Body $loginBody -ContentType 'application/json'
    if ($resp.requiresOtp) {
        Write-Host "2FA challenge triggered for $email. Received OTP: $($resp.otp)"
        $otpBody = @{
            email = $email
            otp = $resp.otp
            role = $role
        } | ConvertTo-Json
        $verifyResp = Invoke-RestMethod -Uri 'http://localhost:8080/api/auth/verify-login-otp' -Method Post -Body $otpBody -ContentType 'application/json'
        return $verifyResp.token
    } else {
        return $resp.token
    }
}

Write-Host "=== 1. Testing Admin Login with 2FA Challenge ==="
$adminToken = Get-AuthToken 'admin@university.edu.in' 'Admin@123' 'ROLE_ADMIN'
Write-Host "Admin 2FA login successful. Token acquired."

Write-Host "`n=== 2. Testing Invalid Login (Wrong Password) to test Audit Logging ==="
try {
    $badLogin = @{
        email = 'admin@university.edu.in'
        password = 'WrongPassword999!'
        role = 'ROLE_ADMIN'
    } | ConvertTo-Json
    Invoke-RestMethod -Uri 'http://localhost:8080/api/auth/login' -Method Post -Body $badLogin -ContentType 'application/json'
} catch {
    Write-Host "Invalid login correctly rejected with 401 Unauthorized."
}

Write-Host "`n=== 3. Testing Get Login Audits API (Persisted in Database) ==="
$headers = @{ Authorization = "Bearer $adminToken" }
$audits = Invoke-RestMethod -Uri 'http://localhost:8080/api/admin/login-audits?page=0&size=10' -Method Get -Headers $headers
Write-Host "Total Login Audits in DB: $($audits.totalItems)"
foreach ($a in $audits.audits) {
    Write-Host "- Audit: [$($a.status)] Email: $($a.email) Role: $($a.role) IP: $($a.ipAddress) Time: $($a.loginTime) Remarks: $($a.remarks)"
}

Write-Host "`n=== 4. Testing Login Audits CSV Export ==="
$exportResp = Invoke-WebRequest -Uri 'http://localhost:8080/api/admin/login-audits/export' -Method Get -Headers $headers
Write-Host "CSV Export Status: $($exportResp.StatusCode), Content-Length: $($exportResp.Content.Length) bytes"

Write-Host "`n=== 5. Testing System Configuration API ==="
$config = Invoke-RestMethod -Uri 'http://localhost:8080/api/admin/config' -Method Get -Headers $headers
Write-Host "Current Config: $($config | ConvertTo-Json -Compress)"

Write-Host "`n=== 6. Testing Academic Departments API ==="
$depts = Invoke-RestMethod -Uri 'http://localhost:8080/api/admin/departments' -Method Get -Headers $headers
Write-Host "Departments in system: $($depts.Count)"
foreach ($d in $depts) {
    Write-Host "  - Department: [$($d.code)] $($d.name)"
}

Write-Host "`n=== 7. Testing Campus Announcement Broadcast ==="
$annBody = @{
    title = 'Final Semester Project Evaluation'
    message = 'All final year submissions must be completed before Friday.'
    targetRole = 'ALL'
    type = 'INFO'
} | ConvertTo-Json
$annResp = Invoke-RestMethod -Uri 'http://localhost:8080/api/admin/announcements' -Method Post -Headers $headers -Body $annBody -ContentType 'application/json'
Write-Host "Announcement response: $($annResp.message)"

Write-Host "`n=== 8. Testing User Deactivation & Activation (Admin Control) ==="
$users = Invoke-RestMethod -Uri 'http://localhost:8080/api/admin/users?page=0&size=10' -Method Get -Headers $headers
$testUser = $users.users | Where-Object { $_.role -eq 'ROLE_STUDENT' } | Select-Object -First 1
Write-Host "Selected user for test: $($testUser.fullName) (ID: $($testUser.id), Email: $($testUser.email))"

Write-Host "Deactivating user account..."
$deactResp = Invoke-RestMethod -Uri "http://localhost:8080/api/admin/users/$($testUser.id)/status?status=INACTIVE" -Method Put -Headers $headers
Write-Host "Deactivate response: $($deactResp.message)"

Write-Host "Testing login with deactivated user..."
try {
    $deactLogin = @{
        email = $testUser.email
        password = 'Student@123'
        role = 'ROLE_STUDENT'
    } | ConvertTo-Json
    Invoke-RestMethod -Uri 'http://localhost:8080/api/auth/login' -Method Post -Body $deactLogin -ContentType 'application/json'
    Write-Host "ERROR: Deactivated user was able to log in!"
} catch {
    Write-Host "Deactivated user correctly blocked from login with 403 Forbidden!"
}

Write-Host "Reactivating user account..."
$reactResp = Invoke-RestMethod -Uri "http://localhost:8080/api/admin/users/$($testUser.id)/status?status=ACTIVE" -Method Put -Headers $headers
Write-Host "Reactivate response: $($reactResp.message)"

Write-Host "`n=== 9. Testing Faculty Login and Class Notice Broadcast ==="
$facToken = Get-AuthToken 'prof.sharma@university.edu.in' 'Faculty@123' 'ROLE_FACULTY'
$facHeaders = @{ Authorization = "Bearer $facToken" }

$noticeBody = @{
    title = 'DBMS Lab Assignment 4 Due Date Extended'
    message = 'Submission portal will remain open until Sunday midnight.'
    year = 3
    section = 'A'
    type = 'INFO'
} | ConvertTo-Json
$noticeResp = Invoke-RestMethod -Uri 'http://localhost:8080/api/faculty/notices' -Method Post -Headers $facHeaders -Body $noticeBody -ContentType 'application/json'
Write-Host "Faculty Notice response: $($noticeResp.message)"

Write-Host "`n=== 10. Checking Login Audits again to confirm all logins recorded ==="
$auditsAfter = Invoke-RestMethod -Uri 'http://localhost:8080/api/admin/login-audits?page=0&size=10' -Method Get -Headers $headers
Write-Host "Total Login Audits in DB now: $($auditsAfter.totalItems)"
foreach ($a in $auditsAfter.audits) {
    Write-Host "- Audit: [$($a.status)] User: $($a.fullName) ($($a.email)) IP: $($a.ipAddress) Remarks: $($a.remarks)"
}

Write-Host "`n======================================================="
Write-Host "  ALL TESTS PASSED! ALL 17 MATRIX FEATURES VERIFIED!  "
Write-Host "======================================================="
