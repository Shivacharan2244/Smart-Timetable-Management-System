$loginBody = @{
    email = "admin@gmail.com"
    password = "admin123"
} | ConvertTo-Json

$loginRes = Invoke-RestMethod -Uri "http://localhost:8081/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
$token = $loginRes.token

Write-Host "Logged in. Token acquired."
$filePath = "scratch/sample_college_timetable.pdf"

$curlOutput = & curl.exe -s -X POST http://localhost:8081/api/upload-history/upload `
    -H "Authorization: Bearer $token" `
    -F "file=@$filePath;type=application/pdf"

Write-Host "PDF Upload Response:"
Write-Host $curlOutput
