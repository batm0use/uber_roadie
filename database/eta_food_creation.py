import sqlite3

from numpy import mean
from database.initializer import get_id

MERCHANT = "M107"
velocities ={
    "car":[25, 35],
    "bike":[13, 22],
    "scooter":[29, 43]
}

for vehicle in velocities:
    velocities[vehicle][0] /= 60
    velocities[vehicle][1] /= 60

FCC = (3, 3)

def calculate_eta(distance, time, velocity, fcc):
    eta = time - (distance/velocity) - fcc
    return eta

query = ("SELECT vehicle_type, distance_km, duration_mins FROM eats_orders WHERE merchant_id = ?")

def get_restaurant_info():
    cursor = get_id()

    query1 = ("SELECT merchant_id, lat, lon  FROM merchants")

    cursor.execute(query1)
    rows = cursor.fetchall()
    return rows

def get_eta_for_food_by_merchant(merchant):
    cursor = get_id()

    cursor.execute(query, (merchant,))
    rows = cursor.fetchall()
    #print(rows, "\n")
    min_etas = []
    max_etas = []

    if(len(rows) == 0): return -1

    for i, delivery in enumerate(rows):
        vehicle = delivery[0]
        distance = delivery[1]
        time = delivery[2]

        velocity_range = velocities[vehicle]

        eta_min = calculate_eta(distance, time, velocity_range[0], FCC[1])
        eta_max = calculate_eta(distance, time, velocity_range[1], FCC[0])

        min_etas.append(eta_min)
        max_etas.append(eta_max)

    min_eta = (mean(min_etas))
    max_eta = (mean(max_etas))
    eta_mean = round(mean([min_eta, max_eta]))

    return eta_mean
