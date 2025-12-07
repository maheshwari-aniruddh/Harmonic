#!/bin/bash
# AirPlay Instruments - Launch Script
# This starts the Streamlit backend and opens the frontend

echo "🎹 Starting AirPlay Instruments..."

# Kill any existing Streamlit processes
pkill -f "streamlit run ar_studio.py" 2>/dev/null

# Start Streamlit backend
echo "[BACKEND] Starting Streamlit AR Studio..."
cd "$(dirname "$0")"
./.venv/bin/streamlit run ar_studio.py --server.headless true &

# Wait for server to start
sleep 3

# Open frontend
echo "[FRONTEND] Opening HTML interface..."
open "airplay 2/index.html"

echo "✅ AirPlay is running!"
echo "   Backend: http://localhost:8501"
echo "   Frontend: airplay 2/index.html"
echo ""
echo "Press Ctrl+C to stop the backend."

# Wait for Ctrl+C
wait
