from typing import Dict, List

from fastapi import WebSocket, WebSocketDisconnect


class WebSocketManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.connection_mapping: Dict[int, WebSocket] = {}  # service_id -> WebSocket

    async def connect(self, websocket: WebSocket, service_id: int = None):
        await websocket.accept()
        self.active_connections.append(websocket)
        if service_id is not None:
            self.connection_mapping[service_id] = websocket

    def disconnect(self, websocket: WebSocket, service_id: int = None):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        if service_id and service_id in self.connection_mapping:
            del self.connection_mapping[service_id]

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except WebSocketDisconnect:
                await self.disconnect(connection)

    async def send_service_update(self, service_id: int, message: dict):
        if service_id in self.connection_mapping:
            try:
                await self.connection_mapping[service_id].send_json(message)
            except WebSocketDisconnect:
                self.disconnect(self.connection_mapping[service_id], service_id)


manager = WebSocketManager()
