import pymysql

try:
    conn = pymysql.connect(
        host="localhost",
        user="root",
        password="mian12haroon",
        database="hr_system"
    )
    print("✅ Connected successfully!")
    conn.close()
except Exception as e:
    print(e)