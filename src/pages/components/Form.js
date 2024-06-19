// Импортируем React и date-fns
import React, { useState } from 'react'
import { format } from 'date-fns'

// Создаем компонент формы
export default function Form({ date, room, time, onSubmit, onCancel }) {
  // Создаем состояние для полей формы
  const [subject, setSubject] = useState('')
  const [group, setGroup] = useState('')
  const [subgroup, setSubgroup] = useState('')

  // Создаем функцию для обработки изменения полей формы
  const handleChange = (event) => {
    // Получаем имя и значение поля
    const { name, value } = event.target
    // В зависимости от имени поля, устанавливаем соответствующее состояние
    switch (name) {
      case 'subject':
        setSubject(value)
        break
      case 'group':
        setGroup(value)
        break
      case 'subgroup':
        setSubgroup(value)
        break
      default:
        break
    }
  }

// Создаем функцию для обработки отправки формы
const handleSubmit = (event) => {
  // Предотвращаем действие по умолчанию
  event.preventDefault();

  // Преобразуем введенное значение номера группы в число
  const groupNumber = parseInt(group);
  if (isNaN(groupNumber)) {
    // Если groupNumber не число, выводим сообщение об ошибке
    console.error('Номер группы должен быть числом');
    return;
  }

  // Вызываем функцию onSubmit с данными формы
  onSubmit({ 
    date: format(date, 'yyyy-MM-dd'), // Форматируем дату для соответствия формату сервера
    time: time, // Используем время, предоставленное в пропсах
    subject: subject,
    group_number: groupNumber, // Используем преобразованное в число значение
    subgroup: subgroup,
    para: time // Ваше предположение, как можно отправить время как параметр "para"
  });
}

  // Возвращаем JSX разметку формы
  return (
    <form onSubmit={handleSubmit}>
      <h2>Добавить занятие</h2>
      <p>
        Дата: <strong>{format(date, 'dd.MM.yyyy')}</strong>
      </p>
      <p>
        Аудитория: <strong>{room}</strong>
      </p>
      <p>
        Время: <strong>{time}</strong>
      </p>
      <div className="field">
        <label htmlFor="subject">Название дисциплинаа:</label>
        <input
          type="text"
          id="subject"
          name="subject"
          value={subject}
          onChange={handleChange}
          required
        />
      </div>
      <div className="field">
        <label htmlFor="group">Номер группы:</label>
        <input
  type="number"
  id="group"
  name="group"
  value={group}
  onChange={handleChange}
  required
/>

      </div>
      <div className="field">
        <label htmlFor="subgroup">Номер подгруппы:</label>
        <input
          type="text"
          id="subgroup"
          name="subgroup"
          value={subgroup}
          onChange={handleChange}
          required
        />
      </div>
      <div className="buttons">
        <button type="submit">Окей</button>
        <button type="button" onClick={onCancel}>
          Отмена
        </button>
      </div>
      <style jsx>{`
        form {
          display: flex;
          flex-direction: column;
          border: 1px solid black;
          padding: 20px;
        }
        .field {
          display: flex;
          align-items: center;
          margin: 10px 0;
        }
        label {
          width: 200px;
        }
        input {
            width: 100px; 
        } 
        .buttons 
        { 
            display: flex; 
            justify-content: space-around; 
            margin-top: 20px; 
        } `}
        </style> 
        </form> 
        ) 
    }