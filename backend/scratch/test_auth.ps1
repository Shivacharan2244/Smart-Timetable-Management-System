$headers = @{ "Content-Type" = "application/json" }

Write-Host "=== TEST 1: ADMIN LOGIN ==="
$adminReq = @{ email = "admin@gmail.com"; password = "admin123" } | ConvertTo-Json
$adminRes = Invoke-RestMethod -Uri "http://localhost:8081/api/auth/login" -Method Post -Headers $headers -Body $adminReq
Write-Host "Admin Login Success:" $adminRes.success
Write-Host "Message:" $adminRes.message
Write-Host "Token:" ($adminRes.token.Substring(0, 25) + "...")
Write-Host "User Role:" $adminRes.user.role
Write-Host "User Name:" $adminRes.user.name

$adminToken = $adminRes.token

Write-Host "`n=== TEST 2: FACULTY LOGIN ==="
$facReq = @{ email = "faculty@gmail.com"; password = "faculty123" } | ConvertTo-Json
$facRes = Invoke-RestMethod -Uri "http://localhost:8081/api/auth/login" -Method Post -Headers $headers -Body $facReq
Write-Host "Faculty Login Success:" $facRes.success
Write-Host "Faculty User Role:" $facRes.user.role
Write-Host "Faculty Linked ID:" $facRes.user.facultyId

$facToken = $facRes.token

Write-Host "`n=== TEST 3: INVALID PASSWORD ==="
try {
    $badReq = @{ email = "admin@gmail.com"; password = "wrongpassword" } | ConvertTo-Json
    Invoke-RestMethod -Uri "http://localhost:8081/api/auth/login" -Method Post -Headers $headers -Body $badReq
} catch {
    $resp = $_.Exception.Response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($resp)
    Write-Host "Invalid Login Response:" $reader.ReadToEnd()
}

Write-Host "`n=== TEST 4: UNPROTECTED / UNAUTHENTICATED ACCESS TO PROTECTED API ==="
try {
    Invoke-RestMethod -Uri "http://localhost:8081/api/departments" -Method Get
} catch {
    $resp = $_.Exception.Response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($resp)
    Write-Host "No-Auth Response (Expected 401):" $reader.ReadToEnd()
}

Write-Host "`n=== TEST 5: ADMIN ACCESS TO PROTECTED API (WITH JWT) ==="
$adminAuthHeader = @{ "Authorization" = "Bearer $adminToken"; "Content-Type" = "application/json" }
$deptRes = Invoke-RestMethod -Uri "http://localhost:8081/api/departments" -Method Get -Headers $adminAuthHeader
Write-Host "Admin Access Status:" $deptRes.success
Write-Host "Departments Count:" $deptRes.data.Count

Write-Host "`n=== TEST 6: FACULTY FORBIDDEN ON ADMIN-EXCLUSIVE API ==="
$facAuthHeader = @{ "Authorization" = "Bearer $facToken"; "Content-Type" = "application/json" }
try {
    $newDept = @{ departmentName = "Forbidden Dept"; departmentCode = "FORBID" } | ConvertTo-Json
    Invoke-RestMethod -Uri "http://localhost:8081/api/departments" -Method Post -Headers $facAuthHeader -Body $newDept
} catch {
    $resp = $_.Exception.Response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($resp)
    Write-Host "Faculty Role Violation (Expected 403):" $reader.ReadToEnd()
}

Write-Host "`n=== TEST 7: CURRENT USER PROFILE (/api/auth/me) ==="
$meRes = Invoke-RestMethod -Uri "http://localhost:8081/api/auth/me" -Method Get -Headers $adminAuthHeader
Write-Host "Current User:" $meRes.data.name "($($meRes.data.role))"
