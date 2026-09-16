import logging
from fastapi import FastAPI, Request, Response, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.api.v1.router import api_v1_router

logger = logging.getLogger("app")

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
)

# CORS middleware configuration
# Allows requests from specified frontend origins (e.g. Vite dev server on port 5173)
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin).rstrip("/") for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )


@app.middleware("http")
async def add_security_headers(request: Request, call_next) -> Response:
    """
    Middleware applying defensive security headers to all HTTP responses.
    Scopes Content-Security-Policy so that documentation endpoints function
    without weakening the CSP for the API and public frontend application.
    """
    response: Response = await call_next(request)

    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"

    # Content-Security-Policy:
    # Scope Swagger UI and ReDoc documentation endpoints separately
    path = request.url.path
    is_docs_path = (
        path.startswith(f"{settings.API_V1_STR}/docs")
        or path.startswith(f"{settings.API_V1_STR}/redoc")
        or path.startswith(f"{settings.API_V1_STR}/openapi.json")
    )

    if is_docs_path:
        # Swagger UI and ReDoc need CDN resources for interactive docs display
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; "
            "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; "
            "img-src 'self' data: https://fastapi.tiangolo.com; "
            "frame-ancestors 'none';"
        )
    else:
        # Strict CSP for application REST endpoints and frontend
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "img-src 'self' data:; "
            "script-src 'self'; "
            "style-src 'self' 'unsafe-inline'; "
            "frame-ancestors 'none'; "
            "base-uri 'self'; "
            "form-action 'self';"
        )

    # HSTS: Enforced only in HTTPS production
    is_production = settings.ENVIRONMENT.lower() == "production"
    is_https = request.url.scheme == "https" or request.headers.get("x-forwarded-proto") == "https"
    if is_production and is_https:
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"

    return response


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """
    Global unhandled exception handler.
    In production, prevents leakage of stack traces, filesystem paths, SQL statements,
    or internal implementation details to clients.
    """
    logger.exception("Unhandled server error on path=%s: %s", request.url.path, exc)

    if settings.ENVIRONMENT.lower() == "production":
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "An internal server error occurred."},
        )

    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": str(exc)},
    )


# Include API v1 router under /api/v1
app.include_router(api_v1_router, prefix=settings.API_V1_STR)


@app.get("/", tags=["Root"])
def root_info() -> dict:
    """Root endpoint providing service metadata and documentation links."""
    return {
        "service": settings.PROJECT_NAME,
        "environment": settings.ENVIRONMENT,
        "docs": f"{settings.API_V1_STR}/docs",
        "health": f"{settings.API_V1_STR}/health",
    }

