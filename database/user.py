from database.initializer import get_id
def get_user_home():
    cursor = get_id()
    query = ("SELECT lat_home, lng_home FROM user")

    cursor.execute(query)
    row = cursor.fetchall()[0]
    return row


def current_user_trips():
    cursor = get_id()
    query = ("SELECT completed_trips FROM user")

    cursor.execute(query)
    row = cursor.fetchall()[0]
    return row[0]

def set_time_home(time : str):
    cursor = get_id()
    query = ("UPDATE user SET time_home = ?")
    cursor.execute(query, (time, ))
    cursor.connection.commit()

def get_time_home():
    cursor = get_id()
    query = ("SELECT time_home FROM user")

    cursor.execute(query)
    row = cursor.fetchall()[0]
    return row[0]

