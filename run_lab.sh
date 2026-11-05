#!/bin/bash
echo "========================================================"
echo "  BIG DATA ONLINE LAB - MULTI-LANGUAGE ONLINE IDE"
echo "========================================================"
echo ""

echo "[1/2] Starting Flask Backend on http://localhost:5000 ..."
python3 backend/app.py &
BACKEND_PID=$!

echo "[2/2] Starting React Vite Frontend on http://localhost:3000 ..."
cd frontend && npm run dev &
FRONTEND_PID=$!

echo ""
echo "Big Data Online Lab is now active!"
echo "Open your browser at: http://localhost:3000"
echo "Press Ctrl+C to terminate both servers."

trap "kill $BACKEND_PID $FRONTEND_PID" EXIT
wait

