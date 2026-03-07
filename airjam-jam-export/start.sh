#!/bin/bash
# AirPlay Instruments - Launch Script
# This starts the Streamlit backend and opens the frontend

echo "🎹 Starting AirPlay Instruments..."

# Kill any existing processes
pkill -f "streamlit run ar_studio.py" 2>/dev/null
pkill -f "music_api.py" 2>/dev/null
pkill -f "uvicorn websocket_server" 2>/dev/null
pkill -f "uvicorn session_server" 2>/dev/null

cd "$(dirname "$0")"

# Use .venv_new if .venv is broken; fallback to python3 -m
VENV_UVICORN=""
VENV_PYTHON=""
if [ -x "./.venv_new/bin/python" ]; then
    VENV_UVICORN="./.venv_new/bin/python -m uvicorn"
    VENV_PYTHON="./.venv_new/bin/python"
elif [ -x "./.venv/bin/uvicorn" ]; then
    VENV_UVICORN="./.venv/bin/uvicorn"
    VENV_PYTHON="./.venv/bin/python"
else
    VENV_UVICORN="python3 -m uvicorn"
    VENV_PYTHON="python3"
fi

# Start Jam Session WebSocket server (AirJam multiplayer) on port 8502
echo "[BACKEND] Starting Jam Session server (port 8502)..."
$VENV_UVICORN session_server:app --host 0.0.0.0 --port 8502 &

# Start WebSocket server (multiplayer + spectator) on port 8765
echo "[BACKEND] Starting WebSocket server (port 8765)..."
$VENV_UVICORN websocket_server:app --host 0.0.0.0 --port 8765 &

# Start Music API (songs list, upload MP3, serve JSON) on port 8766
echo "[BACKEND] Starting Music API (port 8766)..."
$VENV_PYTHON music_api.py &

# Start Streamlit backend
echo "[BACKEND] Starting Streamlit AR Studio..."
python3 -m streamlit run ar_studio.py --server.headless true &

# Wait for servers to start
sleep 3

# Open frontend
echo "[FRONTEND] Opening HTML interface..."
open "airplay 2/instruments.html"

echo "✅ AirPlay is running!"
echo "   Streamlit: http://localhost:8501"
echo "   Jam Session (WS): ws://localhost:8502"
echo "   WebSocket: ws://localhost:8765"
echo "   Music API: http://localhost:8766"
echo "   Frontend: airplay 2/index.html"
echo ""
echo "Press Ctrl+C to stop the backend."

# Wait for Ctrl+C
wait
