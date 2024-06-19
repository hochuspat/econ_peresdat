import React, { useState, useEffect } from 'react';
import { Select, DatePicker, Button, Table, Input, Popconfirm, Form } from 'antd';
import moment from 'moment';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';

const { Option } = Select;

const MyComponent = () => {
  const [selectedTime, setSelectedTime] = useState('1');
  const [selectedCourse, setSelectedCourse] = useState('1');
  const [selectedDate, setSelectedDate] = useState(moment());

  const [selectedGroup, setSelectedGroup] = useState('101');
  const [selectedSubgroup, setSelectedSubgroup] = useState('1');
  const [data, setData] = useState([]);
  const [editingKey, setEditingKey] = useState('');
  const [form] = Form.useForm();
  const [filterDate, setFilterDate] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  
  const groupsByCourse = {
    '1': Array.from({length: 18}, (_, i) => `${i + 101}`),
    '2': Array.from({length: 21}, (_, i) => `${i + 201}`),
    '3': Array.from({ length: 20 }, (_, i) => `${i + 301}`),
    '4': Array.from({ length: 21 }, (_, i) => `${i + 401}`),
    '5': Array.from({ length: 6 }, (_, i) => `${i + 516}`),
  };

  useEffect(() => {
    setSelectedGroup(groupsByCourse[selectedCourse][0]);
  }, [selectedCourse]);

  const handleCourseChange = value => {
    setSelectedCourse(value);
  };

  const handleGroupChange = value => {
    setSelectedGroup(value);
  };

  const handleSubgroupChange = value => {
    setSelectedSubgroup(value);
  };

const fetchData = async () => {
    try {
        // Форматируем дату в строку формата YYYY-MM-DD
        const formattedDate = selectedDate.format('YYYY-MM-DD');
        const response = await fetch(`http://localhost:8000/lessonsp/`, {
            headers: {
                'ngrok-skip-browser-warning': 'true'
            }
        });
        

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const lessons = await response.json();
        console.log("Полученные уроки:", lessons);       
        const filteredLessons = lessons.filter(lesson => !lesson.optional_column || lesson.optional_column === '');
        setData(filteredLessons);
    } catch (error) {
        console.error('Error fetching data:', error);
        setData([]);
    }
};

  

  const isEditing = record => record.id === editingKey;

  const edit = record => {
    form.setFieldsValue({ ...record });
    setEditingKey(record.id); // Здесь должен устанавливаться ID
  };
  

  const cancel = () => {
    setEditingKey('');
  };
  const [date, setDate] = useState('');
  const [para, setPara] = useState('');
  const [time, setTime] = useState('');
  
  // Обработчики изменений для каждого поля
 
  const handleParaChange = (newValue) => {
    setPara(newValue);
  };
  

const handleDateChange = (date) => {
  setSelectedDate(date);
};

  const handleTimeChange = value => {
    setSelectedTime(value); // Обновление selectedTime
  };

 
  const save = async (id) => {
    try {
      const row = await form.validateFields();
  
      const updatedData = {
        date: selectedDate,      // Использование selectedDate
        para: row.para,          // Использование значения из row
        time: selectedTime,      // Использование selectedTime
        subject: row.subject, 
        subgroup: row.subgroup,
        teacherName: row.teacherName // Если это поле есть в форме
      };
  
      console.log("Отправляемые данные:", updatedData);
  
      if (!id) {
        console.error('ID урока не определен');
        return;
      }
  
      await updateLessonInDatabase(id, updatedData);
      setData(data.map((item) => (item.id === id ? { ...item, ...row } : item)));
      setEditingKey('');
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };
  
  
  

  const columns = [
    {
      title: 'Дата',
      dataIndex: 'date',
      key: 'date',
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <DatePicker
            value={selectedKeys[0] ? moment(selectedKeys[0], 'YYYY-MM-DD') : null}
            placeholder="Выберите дату"
            onChange={(date) => setSelectedKeys(date ? [date.format('YYYY-MM-DD')] : [])}
            style={{ marginBottom: 8, display: 'block' }}
          />
          <Button
            type="primary"
            onClick={() => confirm()}
            size="small"
            style={{ width: 90, marginRight: 8 }}
          >
            Поиск
          </Button>
          <Button onClick={() => clearFilters()} size="small" style={{ width: 90 }}>
            Сброс
          </Button>
        </div>
      ),
      onFilter: (value, record) => moment(record.date).format('YYYY-MM-DD') === value,
    },
    {
      title: 'Группа',
      dataIndex: 'time',
      key: 'time',
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Поиск по группе"
            value={selectedKeys[0]}
            onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => confirm()}
            style={{ marginBottom: 8, display: 'block' }}
          />
          <Button
            type="primary"
            onClick={() => confirm()}
            size="small"
            style={{ width: 90, marginRight: 8 }}
          >
            Поиск
          </Button>
          <Button onClick={() => clearFilters()} size="small" style={{ width: 90 }}>
            Сброс
          </Button>
        </div>
      ),
      onFilter: (value, record) => record.time.toLowerCase().includes(value.toLowerCase()),
    },
    
    {
      title: 'Временной Слот',
      dataIndex: 'para',
      key: 'para',
      render: para => {
        const timeSlots = {
          '1': '8:00-9:20',
          '2': '9:30-10:40',
          '3': '11:10-12:30',
          '4': '12:40-14:00',
          '5': '14:10-15:30',
          '6': '15:40-17:00',
          '7': '17:10-18:30',
          '8': '18:40-20:00',
        };
        return timeSlots[para] || para;
      },
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Select
            placeholder="Выберите временной слот"
            value={selectedKeys[0]}
            onChange={(value) => setSelectedKeys(value ? [value] : [])}
            style={{ marginBottom: 8, display: 'block' }}
          >
                        <Option value="0"> </Option>

            <Option value="1">8:00-9:20</Option>
            <Option value="2">9:30-10:40</Option>
            <Option value="3">11:10-12:30</Option>
            <Option value="4">12:40-14:00</Option>
            <Option value="5">14:10-15:30</Option>
            <Option value="6">15:40-17:00</Option>
            <Option value="7">17:10-18:30</Option>
            <Option value="8">18:40-20:00</Option>
          </Select>
          <Button
            type="primary"
            onClick={() => confirm()}
            size="small"
            style={{ width: 90, marginRight: 8 }}
          >
            Поиск
          </Button>
          <Button onClick={() => clearFilters()} size="small" style={{ width: 90 }}>
            Сброс
          </Button>
        </div>
      ),
      onFilter: (value, record) => record.para === value,
    },
    
    {
      title: 'Дисциплина',
      dataIndex: 'subject',
      key: 'subject',
      editable: true,
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Поиск по дисциплине"
            value={selectedKeys[0]}
            onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => confirm()}
            style={{ marginBottom: 8, display: 'block' }}
          />
          <Button
            type="primary"
            onClick={() => confirm()}
            size="small"
            style={{ width: 90, marginRight: 8 }}
          >
            Поиск
          </Button>
          <Button onClick={() => clearFilters()} size="small" style={{ width: 90 }}>
            Сброс
          </Button>
        </div>
      ),
      onFilter: (value, record) => record.subject.toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: 'Подгруппа',
      dataIndex: 'subgroup',
      key: 'subgroup',
      editable: true,
    },
    {
      title: 'фио',
      dataIndex: 'teacherName',
      key: 'teacherName',
      editable: true,
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Поиск по фио"
            value={selectedKeys[0]}
            onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => confirm()}
            style={{ marginBottom: 8, display: 'block' }}
          />
          <Button
            type="primary"
            onClick={() => confirm()}
            size="small"
            style={{ width: 90, marginRight: 8 }}
          >
            Поиск
          </Button>
          <Button onClick={() => clearFilters()} size="small" style={{ width: 90 }}>
            Сброс
          </Button>
        </div>
      ),
      onFilter: (value, record) => record.teacherName.toLowerCase().includes(value.toLowerCase()),
    },
    
    {
      title: 'Действие',
      dataIndex: 'operation',
      render: (_, record) =>
        data.length >= 1 ? (
          <Popconfirm title="Вы уверены, что хотите удалить?" onConfirm={() => handleDelete(record.id)}>
            <a>Удалить</a>
          </Popconfirm>
        ) : null,
    }
  ];
    const mergedColumns = columns.map(col => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: record => ({
        record,
        inputType: col.dataIndex === 'date' ? 'date' : 'text',
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });

  const handleDelete = async id => {
    console.log("Deleting lesson with ID:", id); // Debugging line
    // Implement deletion logic here, as you've already done in your existing code.
    try {
      await deleteLessonFromDatabase(id); 
      const updatedData = data.filter(item => item.id !== id);
      setData(updatedData);
    } catch (error) {
      console.error('Error deleting data:', error);
    }
  };
  
  

  const updateLessonInDatabase = async (id, updatedData) => {
    try {
      const response = await fetch(`http://localhost:8000/update-lesson/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error updating data:', error);
    }
  };
  

  const deleteLessonFromDatabase = async (id) => {
    console.log("Deleting lesson with ID:", id);
    try {
      const response = await fetch(`http://localhost:8000/delete-lesson/${id}`, {
        method: 'DELETE',
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error deleting data:', error);
    }
  };
  
// Функция для экспорта данных в Excel
const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const fileExtension = '.xlsx';

const exportToExcel = (excelData, fileName) => {
  const ws = XLSX.utils.json_to_sheet(excelData);
  const wb = { Sheets: { 'data': ws }, SheetNames: ['data'] };
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const data = new Blob([excelBuffer], {type: fileType});
  FileSaver.saveAs(data, fileName + fileExtension);
}
return (
  <div style={{ padding: '20px' }}>



 



 

    <Button type="primary" onClick={() => exportToExcel(data, 'lessons_data')}>
      скачать Excel
    </Button>

    <Button type="primary" onClick={fetchData}>
      сформировать 
    </Button>

    <Form form={form} component={false}>
      <Table
        components={{
          body: {
            cell: EditableCell,
          },
        }}
        bordered
        dataSource={data}
        columns={mergedColumns}
        rowClassName="editable-row"
        rowKey="id"
      />
    </Form>
  </div>
);
};

const EditableCell = ({
editing,
dataIndex,
title,
inputType,
record,
index,
children,
...restProps
}) => {
const inputNode = inputType === 'date' ? <DatePicker /> : <Input />;
return (
  <td {...restProps}>
    {editing ? (
      <Form.Item
        name={dataIndex}
        style={{
          margin: 0,
        }}
        rules={[
          {
            required: true,
            message: `Пожалуйста, введите ${title.toLowerCase()}!`,
          },
        ]}
      >
        {inputNode}
      </Form.Item>
    ) : (
      children
    )}
  </td>
);
};

export default MyComponent;