"""
FastAPI WebSocket server for multiplayer jam sessions (Feature 1 & 5).
- POST /api/note: receive note event, broadcast to room
- WebSocket /ws/{room_id}: join room, receive broadcast note events
- WebSocket /spectate/{room_id}: read-only spectator (Feature 5)
"""
import asyncio
import json
import random
import string
import time
from typing import Set, Dict, Any

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# room_id -> set of (WebSocket, is_spectator)
rooms: Dict[str, Set[tuple]] = {}
# Last N notes per room for spectators joining late
room_recent_notes: Dict[str, list] = {}
MAX_RECENT = 50


def generate_room_id() -> str:
    return "".join(random.choices(string.ascii_uppercase + string.digits, k=6))


async def broadcast_note(room_id: str, note_msg: dict) -> None:
    """Add note to recent and send to all connections in room (players + spectators)."""
    if room_id not in rooms:
        rooms[room_id] = set()
    if room_id not in room_recent_notes:
        room_recent_notes[room_id] = []
    room_recent_notes[room_id].append(note_msg)
    if len(room_recent_notes[room_id]) > MAX_RECENT:
        room_recent_notes[room_id] = room_recent_notes[room_id][-MAX_RECENT:]

    to_remove = []
    for conn in list(rooms[room_id]):
        ws, _ = conn
        try:
            await ws.send_json(note_msg)
        except Exception:
            to_remove.append(conn)
    for t in to_remove:
        rooms[room_id].discard(t)


@app.post("/api/note")
async def api_note(payload: dict):
    """Accept a note event and broadcast to all connections in the room (including spectators)."""
    room_id = (payload.get("room_id") or "").strip().upper()
    if not room_id or len(room_id) > 20:
        raise HTTPException(status_code=400, detail="Invalid room_id")
    note_msg = {
        "type": "NOTE_PLAYED",
        "room_id": room_id,
        "sender_id": payload.get("sender_id", ""),
        "instrument": payload.get("instrument", "piano"),
        "note": payload.get("note", ""),
        "velocity": payload.get("velocity", 0.8),
        "timestamp_ms": payload.get("timestamp_ms", int(time.time() * 1000)),
    }
    await broadcast_note(room_id, note_msg)
    return {"ok": True, "room_id": room_id}


@app.get("/api/room/create")
async def create_room():
    """Generate a new room id (join code)."""
    room_id = generate_room_id()
    rooms[room_id] = set()
    room_recent_notes[room_id] = []
    return {"room_id": room_id}


@app.websocket("/ws/{room_id}")
async def websocket_room(websocket: WebSocket, room_id: str):
    """Join a room; send and receive note events."""
    await websocket.accept()
    room_id = room_id.strip().upper() or generate_room_id()
    if room_id not in rooms:
        rooms[room_id] = set()
        room_recent_notes[room_id] = []
    rooms[room_id].add((websocket, False))

    # Send recent notes to new joiner
    for msg in room_recent_notes.get(room_id, [])[-20:]:
        try:
            await websocket.send_json(msg)
        except Exception:
            break

    try:
        while True:
            data = await websocket.receive_text()
            try:
                obj = json.loads(data)
                if obj.get("type") == "NOTE_PLAYED":
                    await api_note({**obj, "room_id": room_id})
            except json.JSONDecodeError:
                pass
    except WebSocketDisconnect:
        pass
    finally:
        rooms[room_id].discard((websocket, False))
        if not rooms[room_id]:
            del rooms[room_id]
            room_recent_notes.pop(room_id, None)


@app.websocket("/spectate/{room_id}")
async def spectate_room(websocket: WebSocket, room_id: str):
    """Read-only spectator: receive all note events for the room, never send."""
    await websocket.accept()
    room_id = room_id.strip().upper()
    if room_id not in rooms:
        rooms[room_id] = set()
        room_recent_notes[room_id] = []
    rooms[room_id].add((websocket, True))

    for msg in room_recent_notes.get(room_id, [])[-30:]:
        try:
            await websocket.send_json(msg)
        except Exception:
            break

    try:
        while True:
            await asyncio.sleep(30)
            try:
                await websocket.send_json({"type": "ping"})
            except Exception:
                break
    except WebSocketDisconnect:
        pass
    finally:
        rooms[room_id].discard((websocket, True))
        if not rooms[room_id]:
            del rooms[room_id]
            room_recent_notes.pop(room_id, None)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8765)
