from collections import defaultdict
from datetime import datetime, timedelta
import threading
from typing import Dict, List
from fastapi import HTTPException, Request, status


class SlidingWindowRateLimiter:
    """
    Thread-safe in-memory sliding window rate limiter.
    Limits requests per client IP address within a configurable time window.
    """

    def __init__(self, max_requests: int = 5, window_seconds: int = 600) -> None:
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self._requests: Dict[str, List[datetime]] = defaultdict(list)
        self._lock = threading.Lock()

    def _get_client_ip(self, request: Request) -> str:
        """Extract client IP, taking into account forwarded headers if present."""
        forwarded_for = request.headers.get("X-Forwarded-For")
        if forwarded_for:
            # First IP in the list is the originating client
            return forwarded_for.split(",")[0].strip()
        if request.client and request.client.host:
            return request.client.host
        return "127.0.0.1"

    def __call__(self, request: Request) -> None:
        client_ip = self._get_client_ip(request)
        now = datetime.now()
        cutoff = now - timedelta(seconds=self.window_seconds)

        with self._lock:
            # Filter out timestamps outside the active window
            active_timestamps = [ts for ts in self._requests[client_ip] if ts > cutoff]
            
            if len(active_timestamps) >= self.max_requests:
                self._requests[client_ip] = active_timestamps
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail=f"Rate limit exceeded. Maximum {self.max_requests} messages per {self.window_seconds // 60} minutes.",
                )

            active_timestamps.append(now)
            self._requests[client_ip] = active_timestamps

    def reset(self) -> None:
        """Reset the rate limiter state (useful for automated testing)."""
        with self._lock:
            self._requests.clear()


# Default instance: 5 submissions per 10 minutes per IP
contact_rate_limiter = SlidingWindowRateLimiter(max_requests=5, window_seconds=600)
