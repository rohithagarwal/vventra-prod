import asyncio
from collections.abc import AsyncGenerator
import json
from typing import Any
import structlog

logger = structlog.get_logger()


class EventBus:
    """In-memory Pub/Sub event bus for real-time Server-Sent Events (SSE)."""

    def __init__(self) -> None:
        self._subscribers: set[asyncio.Queue[dict[str, Any]]] = set()

    def subscribe(self) -> asyncio.Queue[dict[str, Any]]:
        q: asyncio.Queue[dict[str, Any]] = asyncio.Queue(maxsize=100)
        self._subscribers.add(q)
        logger.debug("sse_subscriber_connected", total_subscribers=len(self._subscribers))
        return q

    def unsubscribe(self, q: asyncio.Queue[dict[str, Any]]) -> None:
        self._subscribers.discard(q)
        logger.debug("sse_subscriber_disconnected", total_subscribers=len(self._subscribers))

    async def publish(self, event_type: str, data: dict[str, Any]) -> None:
        if not self._subscribers:
            return
        payload = {"event": event_type, "data": data}
        for q in list(self._subscribers):
            try:
                q.put_nowait(payload)
            except asyncio.QueueFull:
                self._subscribers.discard(q)

    async def stream_events(self) -> AsyncGenerator[str, None]:
        q = self.subscribe()
        try:
            # Send initial connection event
            yield f"event: connected\ndata: {json.dumps({'status': 'ok'})}\n\n"
            while True:
                try:
                    event = await asyncio.wait_for(q.get(), timeout=20.0)
                    yield f"event: {event['event']}\ndata: {json.dumps(event['data'])}\n\n"
                except asyncio.TimeoutError:
                    # Heartbeat comment to keep the SSE connection alive through proxies
                    yield ": ping\n\n"
        finally:
            self.unsubscribe(q)


event_bus = EventBus()
