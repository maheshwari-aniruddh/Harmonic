"""
AirJam WebSocket Session Server – real-time multiplayer jam sessions.
- POST /create_room: generate 6-char room code
- GET /ws/{room_id}/{player_id}: join room, send/receive note messages (broadcast to others only)
"""
import asyncio
import json
import random
import string
import time
from typing import Dict, Set, Any

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="AirJam Session Server")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ConnectionManager:
    """In-memory room and client management. room_id -> set of (WebSocket, player_id)."""
    def __init__(self):
        self.rooms: Dict[str, Set[tuple]] = {}  # room_id -> set of (ws, player_id)

    def _normalize_room_id(self, room_id: str) -> str:
        return (room_id or "").strip().upper()

    def add(self, room_id: str, websocket: WebSocket, player_id: str) -> None:
        room_id = self._normalize_room_id(room_id)
        if not room_id:
            return
        if room_id not in self.rooms:
            self.rooms[room_id] = set()
        self.rooms[room_id].add((websocket, player_id))

    def remove(self, room_id: str, websocket: WebSocket, player_id: str) -> None:
        room_id = self._normalize_room_id(room_id)
        if room_id not in self.rooms:
            return
        self.rooms[room_id].discard((websocket, player_id))
        if not self.rooms[room_id]:
            del self.rooms[room_id]

    async def broadcast_to_others(
        self, room_id: str, sender_player_id: str, message: dict
    ) -> None:
        """Send message to all clients in the room except the sender."""
        room_id = self._normalize_room_id(room_id)
        if room_id not in self.rooms:
            return
        to_remove = []
        for ws, pid in list(self.rooms[room_id]):
            if pid == sender_player_id:
                continue
            try:
                await ws.send_json(message)
            except Exception:
                to_remove.append((ws, pid))
        for t in to_remove:
            self.rooms[room_id].discard(t)
        if room_id in self.rooms and not self.rooms[room_id]:
            del self.rooms[room_id]


manager = ConnectionManager()


def generate_room_id() -> str:
    return "".join(random.choices(string.ascii_uppercase + string.digits, k=6))


@app.post("/create_room")
async def create_room():
    """Generate a new 6-character room code, unique among active rooms."""
    for _ in range(20):
        room_id = generate_room_id()
        if room_id not in manager.rooms:
            return {"room_id": room_id}
    return {"room_id": generate_room_id()}


@app.get("/ws/{room_id}/{player_id}")
async def websocket_join(
    websocket: WebSocket,
    room_id: str,
    player_id: str,
):
    """
    Join a jam room. Send JSON messages with type "note" to broadcast to other players.
    Schema: { "type": "note", "room_id", "player_id", "instrument", "note", "velocity", "ts" }
    """
    await websocket.accept()
    rid = (room_id or "").strip().upper() or generate_room_id()
    pid = (player_id or "").strip() or "anonymous"

    manager.add(rid, websocket, pid)

    try:
        while True:
            raw = await websocket.receive_text()
            try:
                obj = json.loads(raw)
            except json.JSONDecodeError:
                continue
            if obj.get("type") != "note":
                continue
            # Normalize and add server timestamp if missing
            msg = {
                "type": "note",
                "room_id": rid,
                "player_id": obj.get("player_id") or pid,
                "instrument": obj.get("instrument", "piano"),
                "note": obj.get("note", ""),
                "velocity": float(obj.get("velocity", 0.8)),
                "ts": obj.get("ts", time.time()),
            }
            await manager.broadcast_to_others(rid, msg["player_id"], msg)
    except WebSocketDisconnect:
        pass
    except Exception:
        pass
    finally:
        manager.remove(rid, websocket, pid)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8502)
