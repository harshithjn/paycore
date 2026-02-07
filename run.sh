#!/bin/bash

echo "Starting Backend (Spring Boot)..."
cd backend || exit
mvn spring-boot:run &

BACKEND_PID=$!

echo "Starting Frontend (Vite)..."
cd ../frontend || exit
npm run dev &

FRONTEND_PID=$!

echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"

echo "Both backend and frontend are running."
echo "Press Ctrl+C to stop."

wait
