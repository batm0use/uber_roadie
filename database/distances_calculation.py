import sqlite3
import pandas as pd
from math import radians, sin, cos, sqrt, atan2
from database.initializer import get_id

def haversine(lat1, lon1, lat2, lon2):


    R = 6371.0
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
    dlon = lon2 - lon1
    dlat = lat2 - lat1
    a = sin(dlat / 2)**2 + cos(lat1) * cos(lat2) * sin(dlon / 2)**2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))
    return R * c


query = ("SELECT merchant_id, lat, lon  FROM merchants")
def nearest_merchants(lat1,lon1):
    # conn = sqlite3.connect('uber.db')
    # cursor = conn.cursor()
    cursor = get_id()
    cursor.execute(query)
    rows = cursor.fetchall()

    merchants = []
    for row in rows:
        merchant= row[0]
        lat = row[1]
        lon = row[2]

        distance = haversine(lat1, lon1, lat, lon)

        merchants.append([merchant, distance, lat, lon])

    merchants = sorted(merchants, key = lambda x: x[1])
    res= list(filter(lambda x: x[1]<=10, merchants))
    return res

def estimate_eta(lat1, lon1, lat2, lon2, avg_speed_kmh, traffic_bias):
    distance_km = haversine(lat1, lon1, lat2, lon2)
    time_hours = traffic_bias* distance_km / avg_speed_kmh
    return {
        "distance_km": round(distance_km, 2),
        "eta_minutes": round(time_hours * 60, 1)
    }

def make_it_home(lat1, lon1, lat2, lon2, lat3, lon3, avg_speed_kmh, traffic_bias, available_time):
    loc_dest= estimate_eta(lat1, lon1, lat2, lon2, avg_speed_kmh, traffic_bias).get("eta_minutes")
    dest_home= estimate_eta(lat2, lon2, lat3, lon3, avg_speed_kmh, traffic_bias).get("eta_minutes")

    return loc_dest + dest_home <= available_time

def close_to_home(lat1, lon1, lat2, lon2):
    distance= haversine(lat1, lon1, lat2, lon2)
    return distance <= 5

    cursor = get_id()
    cursor.execute(query)


print(nearest_merchants(52.07, 4.4))
