from typing import Dict, List

from fastapi import WebSocket, WebSocketDisconnect


class WebSocketManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.connection_mapping: Dict[int, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, service_id: int = None):
        await websocket.accept()
        self.active_connections.append(websocket)
        if service_id is not None:
            if service_id not in self.connection_mapping:
                self.connection_mapping[service_id] = []
            self.connection_mapping[service_id].append(websocket)

    def disconnect(self, websocket: WebSocket, service_id: int = None):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        if service_id and service_id in self.connection_mapping:
            if websocket in self.connection_mapping[service_id]:
                self.connection_mapping[service_id].remove(websocket)
            if not self.connection_mapping[service_id]:
                del self.connection_mapping[service_id]

    async def broadcast(self, message: dict):
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except WebSocketDisconnect:
                disconnected.append(connection)
            except Exception as e:
                print(f"Error broadcasting message: {str(e)}")
                disconnected.append(connection)

        for connection in disconnected:
            if connection in self.active_connections:
                self.active_connections.remove(connection)

    async def send_service_update(self, service_id: int, message: dict):
        if service_id in self.connection_mapping:
            disconnected = []
            for connection in self.connection_mapping[service_id]:
                try:
                    await connection.send_json(message)
                except WebSocketDisconnect:
                    disconnected.append(connection)
                except Exception as e:
                    print(f"Error sending service update: {str(e)}")
                    disconnected.append(connection)

            for connection in disconnected:
                self.disconnect(connection, service_id)


manager = WebSocketManager()
