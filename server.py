from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
import sqlite3
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
app = FastAPI()

# Add CORS middleware to allow connections from any origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)
def create_table():
    conn = sqlite3.connect('lessons.db')
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS lessons (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT,
            para TEXT,
            time TEXT,
            subject TEXT,
            subgroup TEXT,
            teacherName TEXT,
            typeOfEducation TEXT   -- New column for type of education
        );
    """)
    conn.commit()
    conn.close()



# Вызовите эту функцию в начале вашего приложения для создания таблицы
create_table()

# Step 2: Define your data models
class Lesson(BaseModel):
    date: str
    para: str
    time: str
    subject: str
    subgroup: str
    teacherName: Optional[str] = None
    typeOfEducation: Optional[str] =None


# Step 3: Database connection (example using SQLite)
def get_db_connection():
    conn = sqlite3.connect('lessons.db')
    conn.row_factory = sqlite3.Row
    return conn

# Step 4: Define endpoints
@app.get("/lessons/{date}", response_model=List[Lesson])
def get_lessons(date: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM lessons WHERE date = ?", (date,))
    rows = cursor.fetchall()
    lessons = [dict(row) for row in rows]  # Convert rows to dictionaries
    conn.close()
    return lessons
@app.get("/lessonsp/", response_model=List[dict])  # Измените тип возвращаемых данных в соответствии с вашей схемой
def get_lessons(time: Optional[str] = None, subgroup: Optional[str] = None):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Подготавливаем запрос и параметры в зависимости от наличия дополнительных фильтров
    query = "SELECT * FROM lessons WHERE 1=1"  # Всегда истинное условие для упрощения добавления дополнительных условий
    params = []
    
    if time:
        query += " AND time = ?"
        params.append(time)
    
    if subgroup:
        query += " AND subgroup = ?"
        params.append(subgroup)
    
    # Добавляем условие, чтобы возвращать только те уроки, у которых optional_column пуст
    query += " AND (optional_column IS NULL OR optional_column = '')"
    
    cursor.execute(query, tuple(params))
    rows = cursor.fetchall()
    lessons = [dict(row) for row in rows]
    conn.close()
    return lessons


# Новый маршрут для получения уроков по номеру группы
@app.get("/group-lessons/{group}", response_model=List[Lesson])
def get_group_lessons(group: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    # Добавляем условие, чтобы возвращать только те уроки, у которых optional_column пуст
    cursor.execute("SELECT * FROM lessons WHERE time = ? AND (optional_column IS NULL OR optional_column = '')", (group,))
    rows = cursor.fetchall()
    lessons = [dict(row) for row in rows]  # Convert rows to dictionaries
    conn.close()
    return lessons


@app.post("/book-lesson", response_model=Lesson)
def book_lesson(lesson: Lesson):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO lessons (date, para, time, subject, subgroup, teacherName, typeOfEducation) VALUES (?, ?, ?, ?, ?, ?, ?)",
        (lesson.date, lesson.para, lesson.time, lesson.subject, lesson.subgroup, lesson.teacherName, lesson.typeOfEducation)
    )
    conn.commit()
    new_lesson_id = cursor.lastrowid
    conn.close()
    return {**lesson.dict(), "id": new_lesson_id}

@app.put("/update-lesson/{lesson_id}", response_model=Lesson)
def update_lesson(lesson_id: int, updated_lesson: Lesson):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE lessons SET date = ?, para = ?, time = ?, subject = ?, subgroup = ?, teacherName = ?, typeOfEducation = ? WHERE id = ?",
        (
            updated_lesson.date,
            updated_lesson.para,
            updated_lesson.time,
            updated_lesson.subject,
            updated_lesson.subgroup,
            updated_lesson.teacherName,
            updated_lesson.typeOfEducation,
            lesson_id,
        ),
    )
    conn.commit()
    conn.close()
    return updated_lesson

# Маршрут для удаления урока
# Пример добавления простой проверки ошибок в операции удаления
@app.delete("/delete-lesson/{id}")
def delete_lesson(id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM lessons WHERE id=?", (id,))
    lesson = cursor.fetchone()
    if not lesson:
        raise HTTPException(status_code=404, detail="Урок не найден")
    cursor.execute("DELETE FROM lessons WHERE id=?", (id,))
    conn.commit()
    conn.close()
    return {"message": "Урок успешно удален"}



# Step 5: Run the server with Uvicorn
# Execute: uvicorn server:app --reload
