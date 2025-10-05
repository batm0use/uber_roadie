from database.query import position_by_id, what_you_need, top_drivers, calculate_percentile
from database.distances_calculation import nearest_merchants
from database.eta_food_creation import get_restaurant_info
from database.user import set_time_home
from typing import Dict

PERCENTAGE = 0.25

def find_position(id: str) -> Dict[str, int]:
    return {"position" : position_by_id(id)}

def remaining_rides(id: str) -> Dict[str, int]:
    return {"remaining" : what_you_need(id, PERCENTAGE)}

def get_percentage(id: str) -> Dict[str, int]:
    return {"percentile" : calculate_percentile(id)}

def get_leaderboard_summary(id: str) -> Dict[str, int]:
    return {
        "remaining": what_you_need(id, PERCENTAGE),
        "percentile": calculate_percentile(id)
    }

def set_time(time :str):
    set_time_home(time)


def nearby_locations(lat: float, lng: float, count: int = 3):
    """Return a small list of demo nearby points around the provided lat/lng.
    This is intentionally simple and deterministic for testing.
    """
    list_merchants = nearest_merchants(lat, lng)
    # [id, dist, lat, long] 

    results = []
    for i, x in enumerate(list_merchants):
        if i > count:
            break
        results.append({
            "id": x[0],
            "lat": round(x[2], 7),
            "lng": round(x[3], 7),
            "name": f"Nearby {i}"
        })
    return results

def leaderboard_scores() -> list[int]:
    list_scores = top_drivers()
    list_scores.sort(reverse=True)
    return list_scores

def restaurants():
    # returns list of truples
    out = get_restaurant_info()

    return out

