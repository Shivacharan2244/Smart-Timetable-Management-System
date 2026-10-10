$baseUrl = 'http://localhost:8081/api'
$loginRes = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body '{"email":"admin@gmail.com","password":"admin123"}' -ContentType 'application/json'
$headers = @{ 'Authorization' = "Bearer $($loginRes.token)" }

$depts = Invoke-RestMethod -Uri "$baseUrl/departments" -Method Get -Headers $headers
$secs = Invoke-RestMethod -Uri "$baseUrl/sections" -Method Get -Headers $headers
$sems = Invoke-RestMethod -Uri "$baseUrl/semesters" -Method Get -Headers $headers
$ays = Invoke-RestMethod -Uri "$baseUrl/academic-years" -Method Get -Headers $headers
$entries = Invoke-RestMethod -Uri "$baseUrl/timetable-entries" -Method Get -Headers $headers

Write-Host "DEPARTMENTS:"
$depts.data | ForEach-Object { Write-Host " Dept ID: $($_.departmentId), Name: $($_.departmentName), Code: $($_.departmentCode)" }

Write-Host "`nSEMESTERS:"
$sems.data | ForEach-Object { Write-Host " Sem ID: $($_.semesterId), Name: $($_.semesterName), Number: $($_.semesterNumber), AY ID: $($_.academicYearId)" }

Write-Host "`nACADEMIC YEARS:"
$ays.data | ForEach-Object { Write-Host " AY ID: $($_.academicYearId), Year: $($_.academicYear)" }

Write-Host "`nSECTIONS COUNT: $($secs.data.Count)"
$secs.data | ForEach-Object { Write-Host " Sec ID: $($_.sectionId), Name: $($_.sectionName), Dept ID: $($_.departmentId), Sem ID: $($_.semesterId)" }

Write-Host "`nENTRIES COUNT: $($entries.data.Count)"
