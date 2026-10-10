$loginBody = @{
    email = "admin@gmail.com"
    password = "admin123"
} | ConvertTo-Json

$loginRes = Invoke-RestMethod -Uri "http://localhost:8081/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
$token = $loginRes.token
$headers = @{
    Authorization = "Bearer $token"
}

Write-Host "Testing /api/reports/overview..."
$overview = Invoke-RestMethod -Uri "http://localhost:8081/api/reports/overview" -Method Get -Headers $headers
Write-Host "Overview Success:" ($overview.data | ConvertTo-Json)

Write-Host "Testing /api/reports/faculty-workload..."
$workload = Invoke-RestMethod -Uri "http://localhost:8081/api/reports/faculty-workload" -Method Get -Headers $headers
Write-Host "Workload records count: $($workload.data.Count)"

Write-Host "Testing /api/faculty/matrix..."
$matrix = Invoke-RestMethod -Uri "http://localhost:8081/api/faculty/matrix?day=MONDAY" -Method Get -Headers $headers
Write-Host "Faculty Matrix count: $($matrix.data.Count)"

Write-Host "Testing /api/meetings/suggested-slots..."
$facultyId = $workload.data[0].facultyId
$date = Get-Date -Format "yyyy-MM-dd"
$slots = Invoke-RestMethod -Uri "http://localhost:8081/api/meetings/suggested-slots?facultyId=$facultyId&date=$date" -Method Get -Headers $headers
Write-Host "Suggested slots count: $($slots.data.Count)"
