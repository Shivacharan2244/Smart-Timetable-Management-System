$baseUrl = 'http://localhost:8081/api'
$loginBody = @{ email = 'admin@gmail.com'; password = 'admin123' } | ConvertTo-Json
$loginRes = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $loginBody -ContentType 'application/json'
$token = $loginRes.token
$filePath = 'c:\Users\Shiva Charan\Desktop\Smart Timetable Management System\backend\scratch\test_civil_timetable.pdf'

$curlOutput = curl.exe -s -X POST "$baseUrl/upload-history/upload" -H "Authorization: Bearer $token" -F "file=@$filePath"
$json = $curlOutput | ConvertFrom-Json
Write-Host "Department Detected:" $json.data.departmentName "("$json.data.departmentCode")"
Write-Host "Sections Involved:" ($json.data.sectionsInvolved -join ', ')
Write-Host "Entries Saved:" $json.data.extractedCount
Write-Host "Conflicts Detected:" $json.data.conflictCount

Write-Host "`nAll Registered Departments Now in System:"
$headers = @{ Authorization = "Bearer $token" }
$deptRes = Invoke-RestMethod -Uri "$baseUrl/departments" -Method Get -Headers $headers
$deptRes.data | Format-Table -Property departmentId, departmentName, departmentCode, status
