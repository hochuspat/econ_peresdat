import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, Select } from 'antd';
import { Calendar } from 'antd';
import { notification } from 'antd';
import { ConfigProvider } from 'antd';
import ruRU from 'antd/lib/locale/ru_RU';
import 'moment/locale/ru'; 
import moment from 'moment';
import styles from './MyCalendar.module.css'; 
moment.locale('ru'); 


const allowedDates = [
  { start: '2024-07-01', end: '2024-07-06' },
  { start: '2024-08-20', end: '2024-08-28' },
];

const disallowedDates = [
  { start: '2024-06-01', end: '2024-06-30' },
  { start: '2024-07-07', end: '2024-08-19' },
];
// Helper function to check if a date is within any of the specified ranges
const isDateWithinRanges = (date, ranges) => {
  return ranges.some(range => 
    moment(date).isSameOrAfter(moment(range.start)) && 
    moment(date).isSameOrBefore(moment(range.end))
  );
};




const getLessons = async (date) => {
  try {
    const url = `${process.env.NEXT_PUBLIC_BACKEND_API}/lessons/${date}`;
    const response = await fetch(url, {
      headers: {
        'ngrok-skip-browser-warning': 'true'  // Добавляем заголовок для пропуска предупреждения ngrok
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Ошибка при получении занятий:", error);
    return [];  // Возвращаем пустой массив в случае ошибки
  }
};

const bookLesson = async (lessonData) => {
  try {
    console.log('Lesson data:', lessonData);
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/book-lesson`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify(lessonData),
    });

    if (!response.ok) {
      throw new Error('Ошибка сервера: ' + response.status);
    }

    // Проверяем, что ответ сервера содержит JSON
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      throw new TypeError("Ответ сервера не является JSON!");
    }

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error("Ошибка при бронировании занятия:", error);
    throw error;
  }
};













const { Option } = Select;

const BookingForm = ({
  selectedGroup,
  bookingModalVisible,
  selectedDate,
  selectedTime,
  selectedSlot,
  handleCancel,
  initialLesson,
  groups // Добавьте это
}) => {   
  const [form] = Form.useForm(); 
  const [subject, setSubject] = useState(initialLesson ? initialLesson.subject : '');
useEffect(() => {
  if (bookingModalVisible && selectedDate && selectedGroup) {
    form.setFieldsValue({
      date: selectedDate.format('YYYY-MM-DD'),
      time: selectedTime, // время слота
      group: selectedGroup, // номер группы
    });
  }
}, [bookingModalVisible, selectedDate, selectedGroup, selectedTime, form]);

console.log("Selected Date:", selectedDate.format('YYYY-MM-DD'));  
const [selectedGroups, setSelectedGroups] = useState([selectedGroup]);

  const handleAddGroup = () => {
    setSelectedGroups([...selectedGroups, '']); // Добавление новой группы
  };
  
  const handleGroupChange = (value, index) => {
    const newSelectedGroups = [...selectedGroups];
    newSelectedGroups[index] = value;
    setSelectedGroups(newSelectedGroups);
  };
  const delay = ms => new Promise(res => setTimeout(res, ms));
  const onFormSubmit = async () => {
    const timeMapping = {
      '1': '8:00-9:20',
      '2': '9:30-10:40',
      '3': '11:10-12:30',
      '4': '12:40-14:00',
      '5': '14:10-15:30',
      '6': '15:40-17:00',
      '7': '17:10-18:30',
      '8': '18:40-20:00',
    };
    try {
      await form.validateFields().then(async (values) => {
        const subgroup = values.subgroup || 'whole';
        const para = Object.keys(timeMapping).find(key => timeMapping[key] === values.time);
  
        for (const group of selectedGroups) {
          const lessonData = {
            date: values.date,
            para: para,
            time: group,
            subject: values.predmet,
            subgroup: subgroup,
            teacherName: values.teacherName,
            typeOfEducation: values.typeOfEducation  // Ensuring typeOfEducation is included
          };
  
          console.log('Отправляемые данные на сервер для группы', group, ':', lessonData);
  
          await bookLesson(lessonData);
          await delay(500); // Задержка 500 мс между запросами
        }
  
        // Показываем уведомление об успехе после обработки всех групп
        notification.success({
          message: 'Успешное добавление',
          description: 'Данные успешно добавлены, закройте форму',
          duration: 20, // Указываем, что уведомление должно отображаться 20 секунд
        });
      });
    } catch (error) {
      console.error('Ошибка при отправке данных:', error);
      notification.error({
        message: 'Ошибка при бронировании занятия',
        description: error.message || 'Не удалось назначить пересдачу.',
      });
    }
  };
  

useEffect(() => {
  if (selectedSlot) {
  }
}, [selectedSlot]);

  const handleSubjectChange = (e) => {
    setSubject(e.target.value);
  };

  useEffect(() => {
    if (initialLesson) {
      form.setFieldsValue({
        predmet: initialLesson.subject,
      });
      setSubject(initialLesson.subject);
    }
  }, [initialLesson, form]);
  console.log('Is bookingModalVisible:', bookingModalVisible);

  return (
      <Modal
        title={`${initialLesson ? 'Редактировать' : 'Назначить'} пересдачу`}
        open={bookingModalVisible} 
    onCancel={handleCancel}
    footer={[
      <Button key="submit" type="primary" onClick={onFormSubmit}>
        Назначить пересдачу
      </Button>,
    ]}  

  >        
<Form
  form={form}
  layout="vertical"
  initialValues={{
    date: selectedSlot?.date || null,
    time: selectedSlot?.time || null,
    predmet: initialLesson?.subject || '',
    typeOfEducation: '',
  }}
>
<Form.Item
          name="typeOfEducation"
          label="Тип обучения"
          rules={[{ required: true, message: 'Пожалуйста, выберите тип обучения' }]}
        >
          <Select placeholder="Выберите тип обучения">
            <Option value="ОФО">ОФО</Option>
            <Option value="ОЗФО">ОЗФО</Option>
          </Select>
        </Form.Item>
<Form.Item label="Группа">
  {selectedGroups.map((group, index) => (
    <Select 
      key={index}
      value={group}
      onChange={(value) => handleGroupChange(value, index)}
      style={{ width: '100%', marginBottom: '10px' }}
    >
      {groups.map(g => (
        <Option key={g} value={g}>{g}</Option>
      ))}
    </Select>
  ))}
  <Button onClick={handleAddGroup}>Добавить группу</Button>
</Form.Item>     
 <Form.Item
  name="subgroup"
  label="Подгруппа"
>
  <Select placeholder="Выберите подгруппу" allowClear>
    <Option value="1">1</Option>
    <Option value="2">2</Option>
    <Option value="whole">Вся группа</Option>
  </Select>
</Form.Item>
<Form.Item name="time" label="Время">
  <Input readOnly />
</Form.Item><Form.Item name="date" label="Дата">
  <Input readOnly />
</Form.Item>

<Form.Item
  name="teacherName"
  label="ФИО преподавателя"
  rules={[{ required: true, message: 'Пожалуйста, введите ФИО преподавателя' }]}
>
  <Input />
</Form.Item>

        <Form.Item
          name="predmet"
          label="дисциплина"
        >
          <Input value={subject} onChange={handleSubjectChange} />
        </Form.Item>
  

  
    </Form>
  </Modal>
);
};

const ScheduleGrid = ({ groups, times, selectedDate, dailyLessons, onSlotClick, lessons }) => {      
    const formattedDate = selectedDate.format('YYYY-MM-DD');    
  const [freeSlots, setFreeSlots] = useState({});
  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: `max-content repeat(${groups.length}, 1fr)`, 
    gridGap: '10px',
    marginTop: '10px',
  };
  const timeMapping = {
    '1': '8:00-9:20',
    '2': '9:30-10:40',
    '3': '11:10-12:30',
    '4': '12:40-14:00',
    '5': '14:10-15:30',
    '6': '15:40-17:00',
    '7': '17:10-18:30',
    '8': '18:40-20:00',
  };
  useEffect(() => {
    async function checkFreeSlots() {
      const slots = {};
      for (let group of groups) {
        for (let time of times) {
          const para = Object.keys(timeMapping).find(key => timeMapping[key] === time);
          const isFree = !lessons.some(lesson => 
            lesson.time === group && 
            lesson.para === para 
          );
          slots[`${group}-${time}`] = isFree;
        }
      }
      setFreeSlots(slots);
    }
    
    checkFreeSlots();
  }, [groups, times, lessons]);

  
  
const isBooked = (group, para) => {
  return dailyLessons.some(lesson => lesson.time === group && lesson.para === para);
};



    moment(formattedDate, 'YYYY-MM-DD')

    
const handleCellClick = (group, time) => {
  const booked = isBooked(group, time);
  if (!booked) {
    onSlotClick(formattedDate, group, time);
  } else {
}
};

  return (
    
      <div className={styles.scheduleGrid} style={gridStyle}>      
      <div className={styles.gridHeader}>
        <div className={styles.gridCell}>Время\Группа</div>
        {groups.map((group) => (
          <div key={group} className={styles.gridCell}>{group}</div>
        ))}
      </div>
{times.map((time) => (
  <React.Fragment key={time}>
    <div className={styles.gridCell}>{time}</div>
    {groups.map((group) => {
      const slotKey = `${group}-${time}`;
      const isFree = freeSlots[slotKey];
      const cellClass = isFree ? styles.free : styles.booked;
      const cellText = isFree ? 'Свободно' : 'Занято';

      return (
        <div
          key={slotKey}
          className={cellClass}
          onClick={() => isFree && handleCellClick(group, time)}
        >
          {cellText}
        </div>
      );
    })}
  </React.Fragment>
))}
  </div>
  );
};
const LessonDetailsModal = ({ lesson, open, onClose }) => {
  if (!lesson) {
    return null; 
  }

  return (
    <Modal
      title="Детали занятия"
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="back" onClick={onClose}>
          Закрыть
        </Button>,
      ]}
    >
      <p>Дата: {lesson.date}</p>
      <p>Аудитория: {lesson.room}</p>
      <p>Время: {lesson.time}</p>
      <p>дисциплина: {lesson.subject}</p>
      <p>Группа: {lesson.group_number}</p>
      <p>Подгруппа: {lesson.subgroup}</p>
    </Modal>
  );
};

const MyCalendar = () => {
  const [selectedLessonDetails, setSelectedLessonDetails] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [bookingModalVisible, setBookingModalVisible] = useState(false);

  const [lessons, setLessons] = useState({});
  const [dailyLessons, setDailyLessons] = useState([]);


  const [selectedDate, setSelectedDate] = useState(moment()); 
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedTime, setSelectedTime] = useState('');



  const [form] = Form.useForm();
  const [bookedSlots, setBookedSlots] = useState([]);
  const [lessonModalVisible, setLessonModalVisible] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);

  

  const handleDateSelect = (value) => {
    const formattedDate = value.format('YYYY-MM-DD');
    if (isDateWithinRanges(formattedDate, disallowedDates)) {
      notification.info({
        message: 'Бронирование недоступно',
        description: 'На выбранную дату бронирование недоступно.',
      });
    } else if (isDateWithinRanges(formattedDate, allowedDates)) {
      setSelectedDate(value);
      setModalVisible(true);
    } else {
      notification.error({
        message: 'Дата вне допустимого диапазона',
        description: 'Выберите дату внутри разрешенных периодов.',
      });
    }
  };
  
  
  const [selectedSlot, setSelectedSlot] = useState(null);
  
  
  
  const handleFreeSlotClick = (date, group, time) => {
    setSelectedDate(moment(date, "YYYY-MM-DD"));
    setSelectedTime(time);
      setSelectedGroup(group);

    setSelectedSlot({
      date: moment(date, "YYYY-MM-DD").format("YYYY-MM-DD"),
      room: group,
      time: time,
    });
  
    setBookingModalVisible(true);
  };
  
 
  const [editingLesson, setEditingLesson] = useState(null);
  

  

  useEffect(() => {
    if (selectedDate) {
      const formattedDate = selectedDate.format('YYYY-MM-DD');
      getLessons(formattedDate)
        .then((lessons) => {
          console.log('Занятия на дату', formattedDate, lessons);
          setLessons({ ...lessons, [formattedDate]: lessons });
        })
        .catch((error) => {
          console.error('Ошибка при получении занятий:', error);
          setLessons({ ...lessons, [formattedDate]: [] });
        });
    }
  }, [selectedDate]);
  
  
useEffect(() => {
  if (selectedDate) {
    const formattedDate = selectedDate.format('YYYY-MM-DD');
    getLessons(formattedDate)
      .then((lessons) => {
        console.log('Занятия на дату', formattedDate, lessons);
        setLessons({ ...lessons, [formattedDate]: lessons });
      })
      .catch((error) => {
        console.error('Ошибка при получении занятий:', error);
        setLessons({ ...lessons, [formattedDate]: [] });
      });
  }
}, [selectedDate]);

  
  const [lessonsData, setLessonsData] = useState({});

  useEffect(() => {
    const fetchLessons = async () => {
      const datesToFetch = ['2023-11-01', '2023-11-02', '2023-11-03']; 
      let newLessons = {};
      for (const date of datesToFetch) {
        const lessonsForDate = await getLessons(date);
        newLessons[date] = lessonsForDate;
      }
      setLessons(newLessons);
    };
  
    fetchLessons();
  }, []);
  
  
  const dateCellRender = (value) => {
    const dateKey = value.format('YYYY-MM-DD');
    const lessons = lessonsData[dateKey] || [];

    return (
      <ul className="events">
        {lessons.map((lesson) => (
          <li key={lesson.time + lesson.room}>
            <Badge status="success" text={`${lesson.time} ${lesson.room} ${lesson.subject} ${lesson.group}${lesson.subgroup}`} />
          </li>
        ))}
      </ul>
    );
  };

  


 
  

  const handleFormSubmit = (lesson, slot) => {
    if (editingLesson) {
    } else {
      setBookedSlots([...bookedSlots, { ...slot, subject: lesson.subject }]);
    }
  
    setBookingModalVisible(false);
    setSelectedSlot(null);
    setEditingLesson(null);
  };

  const handleCancel = () => {
    setBookingModalVisible(false);
    setSelectedSlot(null);
    setEditingLesson(null);
  };



  const groupsByCourse = {
    '1': Array.from({length: 16}, (_, i) => `${i + 101}`),
    '2': Array.from({length: 21}, (_, i) => `${i + 201}`),
    '3': Array.from({ length: 20 }, (_, i) => `${i + 301}`),
    '4': Array.from({ length: 21 }, (_, i) => `${i + 401}`),
    '5': Array.from({ length: 6 }, (_, i) => `${i + 516}`),
  };
  const [selectedCourse, setSelectedCourse] = useState('1');
const groups = groupsByCourse[selectedCourse];
  const times = ['8:00-9:20', '9:30-10:40', '11:10-12:30', '12:40-14:00', '14:10-15:30','15:40-17:00','17:10-18:30','18:40-20:00'];
 
return (
  <ConfigProvider locale={ruRU}>
    <div className={styles.myCalendar}>
      <Calendar
        fullscreen={true}
        onSelect={handleDateSelect}
        cellRender={dateCellRender}
      />
      {selectedDate && (
 <Modal
 width="80%" // Установите ширину модального окна
 style={{ top: 20 }} // Можно настроить стиль, например, отступ сверху
 className="customModal" 
 title={`Расписание на ${selectedDate && moment.isMoment(selectedDate) ? selectedDate.format('DD.MM.YYYY') : ''}`}
 open={modalVisible} 
 onCancel={() => setModalVisible(false)}
 footer={null}
><Select
  defaultValue="1"
  style={{ width: 120 }}
  onChange={(value) => setSelectedCourse(value)}
>
  <Option value="1">1 курс</Option>
  <Option value="2">2 курс</Option>
  <Option value="3">3 курс</Option>
  <Option value="4">4 курс</Option>
  <Option value="5">5 курс</Option>

</Select>
<div className="scrollContainer"> 
<div style={{ overflowX: 'auto' }}> 
    <ScheduleGrid
      groups={groups}
      times={times}
      selectedDate={selectedDate}
      onSlotClick={handleFreeSlotClick}
      lessons={lessons[selectedDate.format('YYYY-MM-DD')] || []}
      dailyLessons={dailyLessons}
    />
  </div>

{lessonModalVisible && selectedLessonDetails && (
  <LessonDetailsModal
    lesson={selectedLessonDetails}
    open={lessonModalVisible}
    onClose={() => setLessonModalVisible(false)}
  />
)}

{bookingModalVisible && (
  <BookingForm
  bookingModalVisible={bookingModalVisible}
  selectedDate={selectedDate}
 selectedTime={selectedTime}
 handleFormSubmit={handleFormSubmit}
 handleCancel={handleCancel}
 initialLesson={editingLesson}
 selectedGroup={selectedGroup}
 groups={groups}
/>

    )}
</div>
</Modal>
      )}
       </div>
    </ConfigProvider>
  );
};

export default MyCalendar;