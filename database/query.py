import sqlite3
import pandas as pd
from database.initializer import get_id


def drives_per_one_driver(id):
    cursor = get_id()
    group_drives = f"SELECT COUNT(ride_id) FROM rides_trips WHERE driver_id= ? GROUP BY driver_id"
    cursor.execute(group_drives, (id,))
    res = cursor.fetchall()
    if len(res) == 0: return 0
    return res[0][0]

#returns number of drivers in DB
def count_drivers():
    cursor = get_id()
    num_drivers= f"SELECT COUNT(DISTINCT earner_id) FROM earners WHERE earner_type=?"
    cursor.execute(num_drivers, ("driver",))
    res = cursor.fetchall()
    return res[0][0]

#returns number of couriers in DB
def count_couriers():
    cursor = get_id()
    num_drivers= f"SELECT COUNT(DISTINCT earner_id) FROM earners WHERE earner_type=?"
    cursor.execute(num_drivers, ("courier",))
    res = cursor.fetchall()
    return res[0][0]


def cutoff(percentage):
    cursor = get_id()
    cutoff = round(percentage * count_drivers())
    query_top_per= f"SELECT COUNT(ride_id) FROM rides_trips GROUP BY driver_id ORDER BY COUNT(ride_id) DESC LIMIT ?"
    cursor.execute(query_top_per, (cutoff,))
    res = cursor.fetchall()

    return res[cutoff-1][0]

def position_by_id(driver_id):
    cursor = get_id()
    drives= drives_per_one_driver(driver_id)

    _query = f"SELECT COUNT(ride_id) FROM rides_trips GROUP BY driver_id HAVING COUNT(ride_id) > ?"
    cursor.execute(_query, (drives,))
    res = cursor.fetchall()

    return len(res)+1

def calculate_percentile(driver_id):
    cursor = get_id()
    pos= position_by_id(driver_id)
    total= count_drivers()
    percentage= (1- ((pos-1)/total))*100
    return percentage


def what_you_need(driver_id, percentage):
    cursor = get_id()
    current_drives= drives_per_one_driver(driver_id)
    goal= cutoff(percentage)

    return goal-current_drives

def top_drivers():
    # conn = sqlite3.connect('uber.db')
    # cursor = conn.cursor()
    cursor = get_id()
    _query = f"SELECT COUNT(ride_id) FROM rides_trips GROUP BY driver_id"
    cursor.execute(_query)
    res = cursor.fetchall()
    values = [row[0] for row in res]

    return values[:5]

#print(drives_per_one_driver("E10000777"))
#print(count_drivers())
#print(cutoff(0.25))
#print(position_by_id("E10000"))
#rows = cursor.fetchall()
print(top_drivers())

#for row in rows:
#    print(row)

