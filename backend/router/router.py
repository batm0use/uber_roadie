from database import eta_food_creation
from fastapi import APIRouter
from backend.controller.controller import find_position, remaining_rides, nearby_locations, leaderboard_scores, \
    get_percentage, restaurants, set_time
from database.distances_calculation import estimate_eta, make_it_home
from database.eta_food_creation import get_eta_for_food_by_merchant 
from database.user import get_time_home, get_user_home
import random
# keep router focused; controller and DB helpers are imported where needed
from pydantic import BaseModel
from backend.controller.ai import ask_ai
from backend.controller.reverse_geolocation import reverse_geocode
from backend.controller.tts_controller import process_tts
from database.user import set_time_home
from datetime import *

router = APIRouter(prefix="/api", tags=["api"])

class Item(BaseModel): message : str
@router.post("/assistant")
async def chat(message: Item):
    # POST /api/assistant
    # Server receives: Item { message: str }
    # Server responds: { response: str }
    # Example request: { "message": "Hello" }
    # Example response: { "response": "I got the Hello" }
    text = message.message
    reply = ask_ai(text)
    return {"response": reply}

from backend.controller.controller import get_leaderboard_summary

@router.get("/leaderboard-summary/{id}")
async def leaderboard_summary(id: str):
    # GET /api/leaderboard-summary/{id}
    # Request: path param 'id' (string)
    # Response: { "remaining": int, "percentile": int }
    return get_leaderboard_summary(id)


class LocationPayload(BaseModel):
    lat: float
    lng: float


@router.post("/nearby_places")
async def nearby_places(payload: LocationPayload):
    # POST /api/nearby_places
    # Server receives: { lat: float, lng: float }
    #   - lat/lng: client's current coordinates
    # Server responds: Array of place objects. Example:
    # [ { "id": 1, "lat": 51.9996, "lng": 4.3626, "name": "Spot 1" }, ... ]
    # This route generates demo points around the provided coordinates.
    return nearby_locations(payload.lat, payload.lng, count=5)

def time_avail(time : str):

    # Get the current time
    now = datetime.now()
    military_time = now.strftime("%H%M")
    out = 0
    out += (int(time) / 100  - int(military_time) / 100 ) * 60
    out += (int(time) % 100 ) - (int(military_time) % 100 ) 
    return out


@router.post("/rides")
async def rides(payload: LocationPayload):
    # POST /api/rides
    # Server receives: { lat: float, lng: float }
    # Response: an array of delivery objects with eta and pickup/drop coordinates.
    # For now return a hardcoded/demo list using small offsets from the provided coords.

#data = {}
#data['key'] = 'value'
#json_data = json.dumps(data)

    usr_end_time = get_time_home()

    usr_home = get_user_home()
    lat = payload.lat
    lng = payload.lng
    names = ["bistrot A", "cafe B", "apothecary C"]
    extra_info = ["take the second entrance to the left", "use small red door in the back", "enter the poorly lit hallway"]

    db_info = restaurants() 
    out_list = []
    for i in range(0, len(db_info)):
        data = {}
        data['id'] = db_info[i][0]
        data['name'] = names[i % 3]
        delta_lat = random.randrange(-90, 90) * 1e-3
        delta_long = random.randrange(-90, 90) * 1e-3
        green = False
        red = True
        if make_it_home(lat, lng, db_info[i][1], db_info[i][2], usr_home[0] , usr_home[1], 30, 1, time_avail(usr_end_time)):
            red = False
            green = True
        else:
            green = False
            red = True
        data['red'] =red
        data['green'] = green
        data['eta_arrive'] = round(estimate_eta(lat, lng, db_info[i][1], db_info[i][2], 30, 1 ).get("eta_minutes") +  estimate_eta( db_info[i][1], db_info[i][2],  db_info[i][1] + delta_lat, db_info[i][2] + delta_long, 30, 1 ).get("eta_minutes"))
        data['lat_pickup'] = db_info[i][1]
        data['lng_pickup'] = db_info[i][2]
        data['lat_drop'] = db_info[i][1] + delta_lat
        data['lng_drop'] = db_info[i][2] + delta_long
        data['extra_info'] = extra_info[i % 3]
        out_list.append(data)

    return out_list





@router.post("/deliveries")
async def deliveries(payload: LocationPayload):
    # POST /api/deliveries
    # Server receives: { lat: float, lng: float }
    # Response: an array of delivery objects with eta and pickup/drop coordinates.
    # For now return a hardcoded/demo list using small offsets from the provided coords.

#data = {}
#data['key'] = 'value'
#json_data = json.dumps(data)


    lat = payload.lat
    lng = payload.lng
    names = ["bistrot A", "cafe B", "apothecary C"]
    extra_info = ["take the second entrance to the left", "use small red door in the back", "enter the poorly lit hallway"]

    db_info = restaurants() 
    out_list = []
    for i in range(0, len(db_info)):
        data = {}
        data['id'] = db_info[i][0]
        data['name'] = names[i % 3]
        data['eta_food'] = round(get_eta_for_food_by_merchant(db_info[i][0]))
        delta_lat = random.randrange(-150, 150) * 1e-3
        delta_long = random.randrange(-150, 150) * 1e-3
        data['eta_arrive'] = round(estimate_eta(lat, lng,  db_info[i][1], db_info[i][2], 30, 1 ).get("eta_minutes"))
        data['lat_pickup'] = db_info[i][1]
        data['lng_pickup'] = db_info[i][2]
        data['lat_drop'] = db_info[i][1] + delta_lat
        data['lng_drop'] = db_info[i][2] + delta_long
        data['extra_info'] = extra_info[i % 3]
        out_list.append(data)

    return out_list


@router.get("/leaderboard")
async def leaderboard():
    # GET /api/leaderboard
    # Request: none
    # Response: Array of leaderboard items: [ { id, name, score } ]
    # Example response: [ { "id": 1, "name": "Electra", "score": 420 } ]
    scores = leaderboard_scores()
    data = [
        {"id": 1, "name": "Electra", "score": "x"},
        {"id": 2, "name": "Gian", "score": "x"},
        {"id": 3, "name": "Victor", "score": "x"},
        {"id": 4, "name": "Oleg", "score": "x"},
        {"id": 5, "name": "Kuba", "score": "x"},
    ]

    for d, s in zip(data, scores):
        d["score"] = s
    return data


@router.get("/position/{id}")
async def position(id: str):
    # GET /api/position/{id}
    # Request: path param 'id' (string)
    # Response: position info for the id (implementation-specific)
    return find_position(id)

@router.get("/percentile/{id}")
async def percentile(id: str):
    # GET /api/position/{id}
    # Request: path param 'id' (string)
    # Response: position info for the id (implementation-specific)
    return get_percentage(id)

@router.get("/remaining/{id}")
async def rides_left(id: str):
    # GET /api/remaining/{id}
    # Request: path param 'id' (string)
    # Response: remaining rides/count info for the id (implementation-specific)
    return remaining_rides(id)



@router.post("/tts")
async def generate_tts(text: Item):
    text = text.message
    reply = process_tts(text)
    return reply


class PreferredTimePayload(BaseModel):
    id: int
    time: str


@router.post("/preferred_return_time")
async def preferred_return_time(payload: PreferredTimePayload):
    """Accepts payload { id: int, time: 'HH:MM' } and stores the preferred return time.

    Converts HH:MM into integer minutes since midnight and calls `set_time_home(minutes)`.
    """
    t = payload.time
    try:
        parts = t.split(":")
        if len(parts) != 2:
            raise ValueError("invalid format")
        hh = int(parts[0])
        mm = int(parts[1])
        if hh < 0 or hh > 23 or mm < 0 or mm > 59:
            raise ValueError("out of range")
        minutes = hh * 60 + mm
    except Exception:
        return {"error": "invalid time format, expected HH:MM"}

    try:
        set_time_home(minutes)
    except Exception as e:
        return {"error": f"failed to save: {e}"}

    return {"status": "ok", "saved_minutes": minutes}

@router.get("/reverse_geocode/{lat}/{lon}")
async def reverse_geocode_router(lat: float, lon: float):
    return reverse_geocode(lat, lon)

@router.post("/time")
async def set_home_time(time : Item):
    set_time(time.message)
