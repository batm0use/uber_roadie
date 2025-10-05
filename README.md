# Junction — Uber Roadie

This repository contains a prototype assistant for earners (drivers / couriers) that helps improve earnings, safety and efficiency via an in-app assistant, delivery scoring, ETA estimation, and a small set of nudges (break reminders, nearby partner offers).

What the app solves

Our project addresses four main problems we identified with respect to the experience of Uber drivers. First, is the time spent idly waiting on intermediate tasks. This includes waiting on the restaurant to prepare food when delivering for UberEats and the time spent searching for the recipients of the food service. Second, is the increased number of hours without opportunity for rest. Third, we noticed that Uber drivers do not manage to achieve the goals of the Incentives program given its current implementation. Finally, we recognized the necessity of a Text-To-Speech feature in the Uber app, so as to minimize drivers’ distraction.

To address the first problem, we implemented an algorithm that calculates the mean preparation time of food per restaurant based on past data and the average speed of different vehicles. We also included additional information accompanying the delivery address to the driver, which includes details on finding the destination, such as the specific location of the building’s entrance. The notable aspect of this feature is that the information is collected from previous deliveries. In order to incentivize drivers to take breaks in between sessions, we decided to offer discounted food and drinks items at partner stores and integrate those locations in the list of points that are shown on the driver’s map. The “Want a break?” alarm is triggered every three hours letting the driver know of such locations close to them. The third problem required us to think about a better way of assigning rewards, which, in our proof of concept, are now distributed as a relative prize for drivers who are above the 25th percentile in number of deliveries/rides or serve zones that are in need of more activity. Lastly, we reduced the potential distractions by integrating a text to speech model in our application, offering our drivers a trusty companion.

For further development in the future, we would like to integrate a "heatmap" layer on our map so that drivers can view the areas with peak demand for rides/deliveries in real time. Additionally, we are planning to add push notifications relating to social events that will be happening in the near future around the driver's usual area, so that they are able to take advantage of the seasonal increase in ride requests.

Quick project structure

- `backend/` — FastAPI backend, API routes, controller logic and DB helpers (SQLite)
- `frontend/` — React + Vite single page app (UI components, map, assistant)
- `database/` — helper modules and an example `uber.db` SQLite database

Languages and tools used

- Frontend: JavaScript (React), Vite, Leaflet (map rendering)
- Backend: Python, FastAPI, Uvicorn
- Data: SQLite (local demo DB)

Setup & run (development)

Prerequisites:
- Node.js (v16+ recommended)
- Python 3.10+ and pip

1. Frontend

```bash
cd frontend
npm install
npm run build
```

2. Backend

Open a separate terminal (project root):

```bash
# Run the API so it's reachable on your LAN:
python3 main.py
# The backend listens on 0.0.0.0:8000 by default when started via main.py
```
