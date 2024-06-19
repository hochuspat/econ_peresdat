// Импортируем React и date-fns

import React from 'react'
import { format, startOfWeek, endOfWeek, addDays, isSameDay } from 'date-fns'

// Создаем массив с номерами аудиторий
const rooms = [101, 102, 103, 104, 105]

// Создаем массив с временными интервалами
const times = ['8:00-9:30', '9:40-11:10', '11:20-12:50', '13:00-14:30', '14:40-16:10', '16:20-17:50']

// Создаем компонент календаря
export default function Calendar({ date, onDateChange, lessons, onRoomTimeChange }) {
  // Создаем функцию для рендеринга дней недели
  const renderDays = () => {
    // Получаем начало и конец недели
    const startDate = startOfWeek(date)
    const endDate = endOfWeek(date)

    // Создаем пустой массив для хранения дней
    const days = []

    // Создаем переменную для текущего дня
    let currentDay = startDate

    // Пока текущий день не превышает конец недели
    while (currentDay <= endDate) {
      // Добавляем текущий день в массив дней
      days.push(currentDay)
      // Прибавляем к текущему дню один день
      currentDay = addDays(currentDay, 1)
    }

    // Возвращаем JSX разметку с днями
    return (
      <div className="days row">
        {days.map((day) => (
          <div
            className={`col cell ${isSameDay(day, date) ? 'selected' : ''}`}
            key={day}
            onClick={() => onDateChange(day)}
          >
            <span className="number">{format(day, 'd')}</span>
            <span className="name">{format(day, 'EEEEEE')}</span>
          </div>
        ))}
      </div>
    )
  }

  // Создаем функцию для рендеринга аудиторий
  const renderRooms = () => {
    // Возвращаем JSX разметку с аудиториями
    return (
      <div className="rooms row">
        {rooms.map((room) => (
          <div className="col cell" key={room}>
            <span className="number">{room}</span>
          </div>
        ))}
      </div>
    )
  }

  // Создаем функцию для рендеринга времени
  const renderTime = () => {
    // Возвращаем JSX разметку с временем
    return (
      <div className="time column">
        {times.map((time) => (
          <div className="row cell" key={time}>
            <span className="number">{time}</span>
          </div>
        ))}
      </div>
    )
  }

  // Создаем функцию для рендеринга занятий
  const renderLessons = () => {
    // Возвращаем JSX разметку с занятиями
    return (
      <div className="lessons">
        {rooms.map((room) => (
          <div className="column" key={room}>
            {times.map((time) => {
              // Находим занятие в эту дату, аудиторию и время
              const lesson = lessons.find(
                (lesson) =>
                  lesson.date.toDateString() === date.toDateString() &&
                  lesson.room === room &&
                  lesson.time === time
              )
              // Если занятие есть, то рендерим его
              if (lesson) {
                return (
                  <div className="row cell lesson" key={time}>
                    <span className="subject">{lesson.subject}</span>
                    <span className="group">{lesson.group}</span>
                    <span className="subgroup">{lesson.subgroup}</span>
                  </div>
                )
              }
              // Если занятия нет, то рендерим пустую клетку с обработчиком клика
              else {
                return (
                  <div
                    className="row cell empty"
                    key={time}
                    onClick={() => onRoomTimeChange(room, time)}
                  ></div>
                )
              }
            })}
          </div>
        ))}
      </div>
    )
  }

  // Возвращаем JSX разметку календаря
  return (
    <div className="calendar">
      {renderDays()}
      {renderRooms()}
      {renderTime()}
      {renderLessons()}
      <style jsx>{`
.calendar {
  display: flex;
  flex-direction: column;
  border: 1px solid black;
}

.row, .column {
  display: flex;
}

.cell {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100px;
  height: 50px;
  border: 1px solid black;
}

.days, .rooms, .time {
  flex-direction: row;
}

.days .cell, .rooms .cell {
  flex: 1; /* Это позволяет клеткам растягиваться равномерно */
}

.time .cell {
  flex-direction: column;
  flex: none; /* Это предотвращает растягивание временных интервалов */
}

.lessons {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap; /* Позволяет переносить элементы на новую строку если не хватает места */
}

.lessons .column {
  flex: 1;
}

.lessons .row {
  flex: 1 100%; /* Каждая строка будет занимать всю ширину */
}

.lesson {
  background-color: pink;
  flex-direction: column;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty {
  cursor: pointer;
}

.selected {
  background-color: orange;
}

`}</style>

    </div>
  )
}
