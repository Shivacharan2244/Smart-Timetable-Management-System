$baseUrl = "http://localhost:8081/api"

# 1. Login as Admin
$loginBody = @{
    email = "admin@gmail.com"
    password = "admin123"
} | ConvertTo-Json

$loginRes = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
$token = $loginRes.token
Write-Host "Admin JWT Token retrieved successfully for: $($loginRes.user.name)"

# 2. Upload CSE Timetable PDF
$filePath = "c:\Users\Shiva Charan\Desktop\Smart Timetable Management System\backend\scratch\test_cse_timetable.pdf"

$headers = @{
    Authorization = "Bearer $token"
}

Write-Host "Uploading CSE Timetable PDF: $filePath..."

# Using curl.exe for multipart upload
$curlOutput = curl.exe -s -X POST "$baseUrl/upload-history/upload" `
  -H "Authorization: Bearer $token" `
  -F "file=@$filePath"

Write-Host "`nUpload Response:"
$json = $curlOutput | ConvertFrom-Json
Write-Host ($json | ConvertTo-Json -Depth 6)

# 3. Check Departments List
Write-Host "`n==============================================="
Write-Host "Registered Departments after Upload:"
Write-Host "==============================================="
$deptRes = Invoke-RestMethod -Uri "$baseUrl/departments" -Method Get -Headers $headers
$deptRes.data | Format-Table -Property departmentId, departmentName, departmentCode, status

# 4. Check Sections List
Write-Host "`n==============================================="
Write-Host "Registered Sections after Upload:"
Write-Host "==============================================="
$secRes = Invoke-RestMethod -Uri "$baseUrl/sections" -Method Get -Headers $headers
$secRes.data | Format-Table -Property sectionId, sectionName, departmentName, status
