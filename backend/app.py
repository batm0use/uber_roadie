from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from backend.router.router import router
from pathlib import Path
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi import Request
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI(title="Backend API")

# Allow CORS so the frontend (dev server or built assets) can make POST requests and OPTIONS preflights.
# In development you may want to restrict origins to your dev server (e.g. http://localhost:5173).
app.add_middleware(
  CORSMiddleware,
  allow_origins=["*"],
  allow_credentials=True,
  allow_methods=["GET", "POST", "OPTIONS"],
  allow_headers=["*"],
)

# Mount the frontend build (Vite -> dist) at root if present. This lets the SPA handle client-side routes.
FRONTEND_DIST = Path(__file__).resolve().parent.parent / "frontend" / "dist"

# Include API routes first so they take precedence over static files mounted at '/'
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(router)

if FRONTEND_DIST.exists():
    # Mount static assets so files like /assets/xxx.js are served directly
    app.mount("/", StaticFiles(directory=str(FRONTEND_DIST), html=True), name="frontend")

    # Explicitly serve index.html only at the root path '/'. Other paths (e.g. /api/...) will be
    # handled by FastAPI routes; unknown paths will return 404 instead of the SPA.
    @app.get("/", include_in_schema=False)
    async def serve_index():
        index = FRONTEND_DIST / "index.html"
        return FileResponse(index)


def run(host: str = "127.0.0.1", port: int = 8000, reload: bool = True):
    """Run the uvicorn server hosting this FastAPI `app`.

    Usage:
      from backend.app import run
      run()
    """
    import uvicorn
    uvicorn.run("backend.app:app", host=host, port=port, reload=reload)


