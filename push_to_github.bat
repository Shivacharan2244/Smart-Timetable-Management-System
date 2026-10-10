@echo off
title Push to GitHub - Smart Timetable Management System
cd /d "%~dp0"
echo ============================================================
echo   Smart Timetable Management System - GitHub Push
echo ============================================================
echo.
echo Pushing code to https://github.com/Shivacharan2244/Smart-Timetable-Management-System ...
echo.
git push origin main
if %ERRORLEVEL% equ 0 (
    echo.
    echo ============================================================
    echo   SUCCESS: Code pushed to GitHub successfully!
    echo ============================================================
) else (
    echo.
    echo If prompted, please sign in via browser or Git Credential Manager.
)
echo.
pause
