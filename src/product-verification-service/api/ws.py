import asyncio
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter()

_clients: dict[str, set] = {}


async def broadcast(run_id: str, message: str):
    for q in list(_clients.get(run_id, set())):
        try:
            await q.put(message)
        except Exception:
            _clients.get(run_id, set()).discard(q)


@router.websocket("/api/v1/verifications/{run_id}/ws")
async def verification_ws(websocket: WebSocket, run_id: str):
    await websocket.accept()
    q: asyncio.Queue = asyncio.Queue()
    _clients.setdefault(run_id, set()).add(q)
    try:
        while True:
            message = await q.get()
            await websocket.send_text(message)
    except WebSocketDisconnect:
        _clients.get(run_id, set()).discard(q)
