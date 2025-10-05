Backend package

Structure:

backend/
  __init__.py
  app.py          # FastAPI app and run() helper
  router/
    __init__.py
    router.py     # APIRouter with routes
  controller/
    __init__.py
    controller.py # business logic

Run:

# from project root
python -m backend.app

# or use uvicorn directly
uvicorn backend.app:app --reload
