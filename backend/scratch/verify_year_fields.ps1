$loginBody = @{ email = 'admin@gmail.com'; password = 'admin123' } | ConvertTo-Json
$loginRes = Invoke-RestMethod -Uri 'http://localhost:8081/api/auth/login' -Method Post -Body $loginBody -ContentType 'application/json'
$headers = @{ Authorization = "Bearer " + $loginRes.token }

Write-Host "--- SECTION YEAR & SEMESTER METADATA ---" -ForegroundColor Cyan
$sections = (Invoke-RestMethod -Uri 'http://localhost:8081/api/sections' -Method Get -Headers $headers).data
$sections | Select-Object -Property sectionId, sectionName, departmentCode, yearOfStudy, yearName, semesterNumber | Format-Table -AutoSize

Write-Host "--- TIMETABLE ENTRIES YEAR & SEMESTER METADATA ---" -ForegroundColor Cyan
$entries = (Invoke-RestMethod -Uri 'http://localhost:8081/api/timetable-entries' -Method Get -Headers $headers).data
$entries | Select-Object -First 5 -Property entryId, sectionName, departmentName, yearOfStudy, yearName, semesterNumber, dayOfWeek | Format-Table -AutoSize
