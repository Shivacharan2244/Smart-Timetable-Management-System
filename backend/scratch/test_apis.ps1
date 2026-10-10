# Test Script for Phase 6 REST API Verification
$baseUrl = "http://localhost:8081/api"
$headers = @{ "Content-Type" = "application/json" }

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Method,
        [string]$Url,
        [string]$Body = $null,
        [int]$ExpectedStatus = 200
    )
    Write-Host "`n----------------------------------------"
    Write-Host "TEST: $Name"
    Write-Host "METHOD: $Method | URL: $Url"
    try {
        if ($Body) {
            $resp = Invoke-WebRequest -Uri $Url -Method $Method -Headers $headers -Body $Body -UseBasicParsing
        } else {
            $resp = Invoke-WebRequest -Uri $Url -Method $Method -Headers $headers -UseBasicParsing
        }
        Write-Host "STATUS: $($resp.StatusCode)"
        Write-Host "BODY: $($resp.Content)"
        return $resp.Content | ConvertFrom-Json
    } catch {
        $status = $_.Exception.Response.StatusCode.value__
        Write-Host "STATUS (caught): $status"
        if ($_.Exception.Response) {
            $stream = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($stream)
            $respBody = $reader.ReadToEnd()
            Write-Host "ERROR BODY: $respBody"
            return $respBody | ConvertFrom-Json
        } else {
            Write-Host "ERROR: $_"
        }
    }
}

# 1. Health
Test-Endpoint -Name "Health Check" -Method "GET" -Url "$baseUrl/health"

# 2. Department POST & GET
$deptBody = '{"departmentName":"Artificial Intelligence and Machine Learning","departmentCode":"AIML"}'
$deptResult = Test-Endpoint -Name "Create Department" -Method "POST" -Url "$baseUrl/departments" -Body $deptBody
$deptId = $deptResult.data.departmentId
Write-Host "Created Department ID: $deptId"
Test-Endpoint -Name "Get All Departments" -Method "GET" -Url "$baseUrl/departments"
Test-Endpoint -Name "Get Department By ID" -Method "GET" -Url "$baseUrl/departments/$deptId"

# 3. Academic Year POST & GET & Activate
$ayBody = '{"academicYear":"2026-2027","startDate":"2026-06-01","endDate":"2027-05-31","active":false}'
$ayResult = Test-Endpoint -Name "Create Academic Year" -Method "POST" -Url "$baseUrl/academic-years" -Body $ayBody
$ayId = $ayResult.data.academicYearId
Write-Host "Created Academic Year ID: $ayId"
Test-Endpoint -Name "Get All Academic Years" -Method "GET" -Url "$baseUrl/academic-years"
Test-Endpoint -Name "Activate Academic Year" -Method "PATCH" -Url "$baseUrl/academic-years/$ayId/activate"
Test-Endpoint -Name "Get Active Academic Years" -Method "GET" -Url "$baseUrl/academic-years/active"

# 4. Semester POST & GET
$semBody = "{`"semesterNumber`":5,`"semesterName`":`"Semester 5`",`"academicYearId`":$ayId}"
$semResult = Test-Endpoint -Name "Create Semester" -Method "POST" -Url "$baseUrl/semesters" -Body $semBody
$semId = $semResult.data.semesterId
Write-Host "Created Semester ID: $semId"
Test-Endpoint -Name "Get Semesters By Academic Year" -Method "GET" -Url "$baseUrl/semesters/academic-year/$ayId"

# 5. Section POST & GET
$secBody = "{`"sectionName`":`"AIML - A`",`"departmentId`":$deptId,`"semesterId`":$semId}"
$secResult = Test-Endpoint -Name "Create Section" -Method "POST" -Url "$baseUrl/sections" -Body $secBody
$secId = $secResult.data.sectionId
Write-Host "Created Section ID: $secId"
Test-Endpoint -Name "Get Sections By Department" -Method "GET" -Url "$baseUrl/sections/department/$deptId"

# 6. Faculty POST & GET
$facBody = "{`"facultyName`":`"Dr. Alan Turing`",`"facultyCode`":`"FAC-TUR-01`",`"email`":`"alan.turing@smartcollege.edu`",`"departmentId`":$deptId}"
$facResult = Test-Endpoint -Name "Create Faculty" -Method "POST" -Url "$baseUrl/faculties" -Body $facBody
$facId = $facResult.data.facultyId
Write-Host "Created Faculty ID: $facId"
Test-Endpoint -Name "Get Faculty By Code" -Method "GET" -Url "$baseUrl/faculties/code/FAC-TUR-01"
Test-Endpoint -Name "Get Faculties By Department" -Method "GET" -Url "$baseUrl/faculties/department/$deptId"

# 7. Subject POST & GET
$subBody = "{`"subjectName`":`"Algorithms & Data Structures`",`"subjectCode`":`"CS501`",`"departmentId`":$deptId,`"semesterId`":$semId}"
$subResult = Test-Endpoint -Name "Create Subject" -Method "POST" -Url "$baseUrl/subjects" -Body $subBody
$subId = $subResult.data.subjectId
Write-Host "Created Subject ID: $subId"
Test-Endpoint -Name "Get Subject By Code" -Method "GET" -Url "$baseUrl/subjects/code/CS501"

# 8. Room POST & GET
$roomBody = '{"roomNumber":"LH-301","roomName":"Lecture Hall 301","roomType":"CLASSROOM","capacity":60}'
$roomResult = Test-Endpoint -Name "Create Room" -Method "POST" -Url "$baseUrl/rooms" -Body $roomBody
$roomId = $roomResult.data.roomId
Write-Host "Created Room ID: $roomId"
Test-Endpoint -Name "Get Rooms By Type" -Method "GET" -Url "$baseUrl/rooms/type/CLASSROOM"

# 9. TimeSlot POST & GET
$slotBody = '{"dayOrder":"MONDAY","periodNumber":1,"startTime":"09:00:00","endTime":"10:00:00"}'
$slotResult = Test-Endpoint -Name "Create TimeSlot" -Method "POST" -Url "$baseUrl/time-slots" -Body $slotBody
$slotId = $slotResult.data.timeSlotId
Write-Host "Created TimeSlot ID: $slotId"
Test-Endpoint -Name "Get TimeSlots By Day" -Method "GET" -Url "$baseUrl/time-slots/day/MONDAY"

# 10. Timetable POST & GET
$ttBody = "{`"departmentId`":$deptId,`"academicYearId`":$ayId,`"semesterId`":$semId,`"sectionId`":$secId,`"effectiveFrom`":`"2026-06-01`",`"effectiveTo`":`"2026-11-30`"}"
$ttResult = Test-Endpoint -Name "Create Timetable" -Method "POST" -Url "$baseUrl/timetables" -Body $ttBody
$ttId = $ttResult.data.timetableId
Write-Host "Created Timetable ID: $ttId"
Test-Endpoint -Name "Get Timetables By Section" -Method "GET" -Url "$baseUrl/timetables/section/$secId"

# 11. Timetable Entry POST & GET
$entryBody = "{`"timetableId`":$ttId,`"dayOfWeek`":`"MONDAY`",`"timeSlotId`":$slotId,`"subjectId`":$subId,`"facultyId`":$facId,`"roomId`":$roomId}"
$entryResult = Test-Endpoint -Name "Create Timetable Entry" -Method "POST" -Url "$baseUrl/timetable-entries" -Body $entryBody
$entryId = $entryResult.data.entryId
Write-Host "Created Timetable Entry ID: $entryId"
Test-Endpoint -Name "Get Entries By Room" -Method "GET" -Url "$baseUrl/timetable-entries/room/$roomId"
Test-Endpoint -Name "Get Entries By Faculty" -Method "GET" -Url "$baseUrl/timetable-entries/faculty/$facId"
Test-Endpoint -Name "Get Entries By Section" -Method "GET" -Url "$baseUrl/timetable-entries/section/$secId"

# 12. Conflict Test on Timetable Entry (Duplicate / Faculty / Room conflict)
Test-Endpoint -Name "Timetable Entry Conflict Detection" -Method "POST" -Url "$baseUrl/timetable-entries" -Body $entryBody

# 13. Meeting POST & GET
$meetingBody = "{`"title`":`"Department Curriculum Review`",`"date`":`"2026-10-12`",`"startTime`":`"14:00:00`",`"endTime`":`"15:00:00`",`"facultyId`":$facId,`"roomId`":$roomId,`"description`":`"Annual syllabus review`"}"
$meetingResult = Test-Endpoint -Name "Create Meeting" -Method "POST" -Url "$baseUrl/meetings" -Body $meetingBody
$meetingId = $meetingResult.data.meetingId
Write-Host "Created Meeting ID: $meetingId"
Test-Endpoint -Name "Get Upcoming Meetings" -Method "GET" -Url "$baseUrl/meetings/upcoming"

# 14. Notification POST & GET
$notifBody = "{`"title`":`"Timetable Published`",`"message`":`"Semester 5 Timetable has been released.`",`"type`":`"INFO`",`"userId`":1}"
$notifResult = Test-Endpoint -Name "Create Notification" -Method "POST" -Url "$baseUrl/notifications" -Body $notifBody
Test-Endpoint -Name "Get All Notifications" -Method "GET" -Url "$baseUrl/notifications"

# 15. Upload History GET
Test-Endpoint -Name "Get Upload History" -Method "GET" -Url "$baseUrl/upload-history"

# 16. Live Class POST & Transitions (Start, End)
$liveBody = "{`"timetableEntryId`":$entryId,`"startTime`":`"09:00:00`",`"endTime`":`"10:00:00`"}"
$liveResult = Test-Endpoint -Name "Create Live Class" -Method "POST" -Url "$baseUrl/live-classes" -Body $liveBody
$liveId = $liveResult.data.liveClassId
Write-Host "Created Live Class ID: $liveId"
Test-Endpoint -Name "Start Live Class" -Method "PATCH" -Url "$baseUrl/live-classes/$liveId/start"
Test-Endpoint -Name "Get Running Live Classes" -Method "GET" -Url "$baseUrl/live-classes/running"
Test-Endpoint -Name "End Live Class" -Method "PATCH" -Url "$baseUrl/live-classes/$liveId/end"

# 17. Free Faculty Check
Test-Endpoint -Name "Check Free Faculty (Busy Slot)" -Method "GET" -Url "$baseUrl/faculty/free?day=MONDAY&timeSlotId=$slotId&departmentId=$deptId"

# 18. Dashboard Summary with Real Data
Test-Endpoint -Name "Dashboard Summary (Updated Data)" -Method "GET" -Url "$baseUrl/dashboard/summary"

# 19. Validation Failure Test (Bean Validation @NotBlank)
$invalidDept = '{"departmentName":"","departmentCode":""}'
Test-Endpoint -Name "Validation Failure Test (@NotBlank)" -Method "POST" -Url "$baseUrl/departments" -Body $invalidDept

# 20. Resource Not Found Test (404)
Test-Endpoint -Name "Not Found Test (404)" -Method "GET" -Url "$baseUrl/departments/99999"
