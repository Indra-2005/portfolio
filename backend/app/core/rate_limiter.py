from collections import defaultdict
from datetime import datetime, timedelta
import logging
import threading
from typing import Dict, List
from fastapi import HTTPException, Request, status

logger = logging.getLogger("security")


def get_client_ip(request: Request) -> str:
    """
    Extract the client IP address safely.

    SECURITY DESIGN & LIMITATIONS:
    - User-controlled 'X-Forwarded-For' headers are intentionally NOT blindly trusted
      to prevent attackers from spoofing arbitrary IP addresses to bypass rate limiting.
    - We rely on `request.client.host` as determined by the underlying ASGI server / socket.
    - When deployed behind a reverse proxy (e.g., Render, Nginx, Cloudflare), the ASGI
      server should be configured with trusted proxy CIDRs (e.g. Uvicorn --proxy-headers)
      so that `request.client` is safely populated from validated upstream proxy hops.
    - Rate limiting is in-memory and operates per application instance.
    """
    if request.client and request.client.host:
        return request.client.host
    return "127.0.0.1"


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

    def __call__(self, request: Request) -> None:
        client_ip = get_client_ip(request)
        now = datetime.now()
        cutoff = now - timedelta(seconds=self.window_seconds)

        with self._lock:
            # Filter out timestamps outside the active window
            active_timestamps = [ts for ts in self._requests[client_ip] if ts > cutoff]

            if len(active_timestamps) >= self.max_requests:
                self._requests[client_ip] = active_timestamps
                logger.warning(
                    "Security event: Rate limit exceeded for contact form from ip=%s (count=%d/%d in %ds)",
                    client_ip,
                    len(active_timestamps),
                    self.max_requests,
                    self.window_seconds,
                )
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail=f"Rate limit exceeded. Maximum {self.max_requests} messages per {self.window_seconds // 60} minutes.",
                )

            active_timestamps.append(now)
            self._requests[client_ip] = active_timestamps

            # Memory pruning: clean up stale keys where all timestamps expired
            expired_keys = [k for k, v in self._requests.items() if not [ts for ts in v if ts > cutoff]]
            for k in expired_keys:
                if k != client_ip:
                    del self._requests[k]

    def reset(self) -> None:
        """Reset the rate limiter state (useful for automated testing)."""
        with self._lock:
            self._requests.clear()


class LoginFailureLimiter:
    """
    Thread-safe in-memory rate limiter specifically for failed authentication attempts.

    Requirements:
    - Maximum 5 failed login attempts within 10 minutes (window_seconds=600).
    - On the 6th attempt after 5 failures from the same (identifier, client IP), return HTTP 429.
    - Tracked by normalized login identifier + client IP to prevent bypass by case variations.
    - Successful authentication resets the failure state for that key.
    - Stale entries and empty keys are cleaned up to prevent unbounded memory growth.
    - Reset function provided for automated testing.
    """

    def __init__(self, max_failures: int = 5, window_seconds: int = 600) -> None:
        self.max_failures = max_failures
        self.window_seconds = window_seconds
        self._failures: Dict[str, List[datetime]] = defaultdict(list)
        self._lock = threading.Lock()

    def _get_key(self, request: Request, identifier: str) -> str:
        """Create a composite tracking key from normalized identifier and client IP."""
        normalized_id = identifier.strip().lower()
        client_ip = get_client_ip(request)
        return f"{normalized_id}:{client_ip}"

    def check_rate_limit(self, request: Request, identifier: str) -> None:
        """
        Check if the identifier + client IP combination is currently locked out.
        Raises HTTP 429 if the threshold of failed attempts has been reached.
        """
        key = self._get_key(request, identifier)
        now = datetime.now()
        cutoff = now - timedelta(seconds=self.window_seconds)

        with self._lock:
            active_failures = [ts for ts in self._failures[key] if ts > cutoff]
            self._failures[key] = active_failures

            if len(active_failures) >= self.max_failures:
                client_ip = get_client_ip(request)
                logger.warning(
                    "Security event: Login failure rate limit exceeded for identifier=%s from ip=%s (failures=%d/%d in %ds)",
                    identifier.strip().lower(),
                    client_ip,
                    len(active_failures),
                    self.max_failures,
                    self.window_seconds,
                )
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Too many failed login attempts. Please try again in 10 minutes.",
                )

    def record_failure(self, request: Request, identifier: str) -> None:
        """Record a failed login attempt for the identifier + client IP."""
        key = self._get_key(request, identifier)
        now = datetime.now()
        cutoff = now - timedelta(seconds=self.window_seconds)

        with self._lock:
            active_failures = [ts for ts in self._failures[key] if ts > cutoff]
            active_failures.append(now)
            self._failures[key] = active_failures

            # Prune stale keys to prevent unbounded memory growth
            stale_keys = [k for k, v in self._failures.items() if not [ts for ts in v if ts > cutoff]]
            for k in stale_keys:
                if k != key:
                    del self._failures[k]

    def reset_failures(self, request: Request, identifier: str) -> None:
        """Reset the failure state upon a successful login."""
        key = self._get_key(request, identifier)
        with self._lock:
            if key in self._failures:
                del self._failures[key]

    def reset(self) -> None:
        """Reset the entire limiter state (for test isolation)."""
        with self._lock:
            self._failures.clear()


# Default singleton instances
contact_rate_limiter = SlidingWindowRateLimiter(max_requests=5, window_seconds=600)
login_failure_limiter = LoginFailureLimiter(max_failures=5, window_seconds=600)

