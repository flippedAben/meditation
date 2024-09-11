#!/bin/bash

# Start the Go backend server
echo "Starting Go backend server..."
cd server
go run main.go &

# Start the Next.js frontend
echo "Starting Next.js frontend..."
cd ../ui
npm run dev &

# Wait for both processes
wait

echo "Both servers have been stopped."