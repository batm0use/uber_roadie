# Frontend (React + Vite)

This folder contains the single-page application that provides the UI for the Uber Roadie.

Quick start

1. Install dependencies

```bash
cd frontend
npm install
```

3. Build (production bundle)

```bash
npm run build
```

Frontend (Vite + React)

Install and run:

cd frontend
npm install
npm run build

Notes:
- Map uses react-leaflet. When running in the browser, Leaflet will request tiles from the OpenStreetMap tile server.
- API calls are pointed to http://localhost:8000/api by default. Set VITE_API_BASE to override.
