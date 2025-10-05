import sqlite3

conn  = None
cursor :sqlite3.Cursor

def get_id():
    global conn, cursor
    if not isinstance(conn, sqlite3.Connection):
        conn = sqlite3.connect("database/uber.db")
        cursor = conn.cursor()
    return cursor
