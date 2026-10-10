$loginBody = @{
    email = "admin@gmail.com"
    password = "admin123"
} | ConvertTo-Json

$loginRes = Invoke-RestMethod -Uri "http://localhost:8081/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
$token = $loginRes.token
Write-Host "Logged in successfully as: $($loginRes.user.email) (Role: $($loginRes.user.role))"

$headers = @{
    Authorization = "Bearer $token"
}

$summary = Invoke-RestMethod -Uri "http://localhost:8081/api/dashboard/summary" -Method Get -Headers $headers
Write-Host "Dashboard Summary:" ($summary.data | ConvertTo-Json)

$faculties = Invoke-RestMethod -Uri "http://localhost:8081/api/faculties" -Method Get -Headers $headers
Write-Host "Total faculties count: $($faculties.data.Count)"
