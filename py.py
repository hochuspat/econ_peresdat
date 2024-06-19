
import sqlite3

def add_teacher_name_column():
    try:
        conn = sqlite3.connect('lessons.db')
        cursor = conn.cursor()
        cursor.execute("ALTER TABLE lessons ADD COLUMN teacherName TEXT;")
        conn.commit()
    except sqlite3.Error as e:
        print(f"Произошла ошибка: {e}")
    finally:
        conn.close()

add_teacher_name_column()
