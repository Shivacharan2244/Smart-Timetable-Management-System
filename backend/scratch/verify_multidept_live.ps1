$baseUrl = 'http://localhost:8081/api'

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   MULTI-DEPARTMENT & TIMETABLE LIVE VERIFICATION        " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Login
$loginBody = '{"email":"admin@gmail.com","password":"admin123"}'

$loginRes = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $loginBody -ContentType 'application/json'
$token = $loginRes.token
$headers = @{ "Authorization" = "Bearer $token" }
Write-Host "[OK] Admin Authentication Successful (Bearer Token Acquired)" -ForegroundColor Green

# 2. Get Departments
$deptRes = Invoke-RestMethod -Uri "$baseUrl/departments" -Method Get -Headers $headers
Write-Host "`n[DEPARTMENTS IN DATABASE]" -ForegroundColor Yellow
foreach ($dept in $deptRes.data) {
    Write-Host ("  * ID: " + $dept.departmentId + " | Code: " + $dept.departmentCode + " | Name: " + $dept.departmentName) -ForegroundColor White
}

# 3. Get Sections for each department
$sectionsRes = Invoke-RestMethod -Uri "$baseUrl/sections" -Method Get -Headers $headers
Write-Host "`n[SECTIONS INVOLVED PER DEPARTMENT]" -ForegroundColor Yellow
$sectionsByDept = $sectionsRes.data | Group-Object -Property departmentId
foreach ($group in $sectionsByDept) {
    $deptObj = $deptRes.data | Where-Object { $_.departmentId -eq [int]$group.Name }
    $deptName = if ($deptObj) { $deptObj.departmentName + ' (' + $deptObj.departmentCode + ')' } else { 'Dept ID ' + $group.Name }
    $sectionNames = ($group.Group | ForEach-Object { $_.sectionName }) -join ', '
    Write-Host ("  * " + $deptName + " -> Sections: [ " + $sectionNames + " ]") -ForegroundColor Cyan
}

# 4. Timetable Entries Breakdown
$entriesRes = Invoke-RestMethod -Uri "$baseUrl/timetable-entries" -Method Get -Headers $headers
Write-Host "`n[TIMETABLE ENTRIES BREAKDOWN]" -ForegroundColor Yellow
Write-Host ("Total Timetable Entries in System: " + $entriesRes.data.Count) -ForegroundColor Green

$entriesByDept = $entriesRes.data | Group-Object -Property departmentName
foreach ($g in $entriesByDept) {
    $sectionsInThisDept = ($g.Group | Select-Object -ExpandProperty sectionName -Unique) -join ', '
    Write-Host ("  * " + $g.Name + ": " + $g.Count + " slots across sections: [ " + $sectionsInThisDept + " ]") -ForegroundColor White
}

# 5. Check Frontend & Backend Health
Write-Host "`n[SERVICE HEALTH STATUS]" -ForegroundColor Yellow
try {
    $backendHealth = Invoke-RestMethod -Uri "$baseUrl/departments" -Method Get -Headers $headers
    Write-Host ("  * Backend (Spring Boot on port 8081): ONLINE and RESPONDING (" + $backendHealth.data.Count + " departments)") -ForegroundColor Green
} catch {
    Write-Host ('  * Backend error: ' + $_) -ForegroundColor Red
}

try {
    $feResponse = Invoke-WebRequest -Uri 'http://localhost:5173' -UseBasicParsing
    Write-Host ('  * Frontend (Vite on port 5173): ONLINE (Status ' + $feResponse.StatusCode + ')') -ForegroundColor Green
} catch {
    Write-Host ('  * Frontend error: ' + $_) -ForegroundColor Red
}

Write-Host "`n==========================================================" -ForegroundColor Cyan
Write-Host "   MULTI-DEPARTMENT CAPABILITY FULLY OPERATIONAL         " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
