#!/bin/bash
# AirPlay Instruments - Launch Script
# This starts the Streamlit backend and opens the frontend

echo "🎹 Starting AirPlay Instruments..."

# Kill any existing processes
pkill -f "streamlit run ar_studio.py" 2>/dev/null
pkill -f "music_api.py" 2>/dev/null
pkill -f "uvicorn websocket_server" 2>/dev/null
pkill -f "uvicorn session_server" 2>/dev/null
pkill -f "python.*server.py.*8767" 2>/dev/null

cd "$(dirname "$0")"

# Start WebSocket server (multiplayer + spectator) on port 8765
echo "[BACKEND] Starting WebSocket server (port 8765)..."
./.venv/bin/uvicorn websocket_server:app --host 0.0.0.0 --port 8765 &

# Start Music API (songs list, upload MP3, serve JSON) on port 8766
echo "[BACKEND] Starting Music API (port 8766)..."
./.venv/bin/python music_api.py &

# Start Jam Session WebSocket server on port 8502
echo "[BACKEND] Starting Jam Session server (port 8502)..."
./.venv/bin/uvicorn session_server:app --host 0.0.0.0 --port 8502 &

# Start Streamlit backend
echo "[BACKEND] Starting Streamlit AR Studio..."
./.venv/bin/streamlit run "airplay 2/ar_studio.py" --server.headless true --server.port 8768 --server.enableCORS false --server.enableXsrfProtection false &

# Start frontend HTTP server on port 8767 (needed for fetch/audio in finger-drums etc.)
echo "[FRONTEND] Starting HTTP server for frontend (port 8767)..."
./.venv/bin/python "airplay 2/server.py" 8767 &

# Wait for servers to start
sleep 3

# Open frontend via HTTP (not file://) so fetch/audio works
echo "[FRONTEND] Opening HTML interface..."
open "http://localhost:8767/instruments.html"

echo "✅ AirPlay is running!"
echo "   Streamlit: http://localhost:8768"
echo "   WebSocket: ws://localhost:8765"
echo "   Music API: http://localhost:8766"
echo "   Jam Server: ws://localhost:8502"
echo "   Frontend:  http://localhost:8767"
echo ""
echo "Press Ctrl+C to stop the backend."

# Wait for Ctrl+C
wait
