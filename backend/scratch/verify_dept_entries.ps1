$baseUrl = 'http://localhost:8081/api'
$loginBody = @{ email = 'admin@gmail.com'; password = 'admin123' } | ConvertTo-Json
$loginRes = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $loginBody -ContentType 'application/json'
$headers = @{ Authorization = "Bearer $($loginRes.token)" }

$entries = (Invoke-RestMethod -Uri "$baseUrl/timetable-entries" -Headers $headers).data
Write-Host "Total entries in system: $($entries.Count)"
$deptCounts = $entries | Group-Object -Property departmentName | Select-Object Name, Count
Write-Host "`nEntries per department:"
$deptCounts | Format-Table -AutoSize

Write-Host "`nSample CSE entry:"
$cseEntry = $entries | Where-Object { $_.departmentCode -eq 'CSE' } | Select-Object -First 1
$cseEntry | Format-List entryId, dayOfWeek, periodNumber, startTime, endTime, subjectName, subjectCode, facultyName, roomNumber, sectionName, departmentName, departmentCode

Write-Host "`nSample Civil entry:"
$civilEntry = $entries | Where-Object { $_.departmentCode -eq 'CIVIL' } | Select-Object -First 1
$civilEntry | Format-List entryId, dayOfWeek, periodNumber, startTime, endTime, subjectName, subjectCode, facultyName, roomNumber, sectionName, departmentName, departmentCode
