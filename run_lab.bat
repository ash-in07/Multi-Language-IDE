@echo off
echo ========================================================
echo   BIG DATA ONLINE LAB - MULTI-LANGUAGE ONLINE IDE
echo ========================================================
echo.

echo [1/2] Starting Flask Backend on http://localhost:5000 ...
start "Big Data Lab - Backend" cmd /k "python backend/app.py"

echo [2/2] Starting React Vite Frontend on http://localhost:3000 ...
cd frontend
start "Big Data Lab - Frontend" cmd /k "npm run dev"

echo.
echo Big Data Online Lab is now launching!
echo Open your browser at: http://localhost:3000
echo ========================================================
pause

