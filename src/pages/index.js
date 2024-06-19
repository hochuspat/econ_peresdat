
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Form, Input, Button, notification } from 'antd';

const API_URL = 'http://212.192.134.23/api'; 
export default function Login() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const login = () => {
    // Отправка на основной сервер для аутентификации
    fetch(`${API_URL}/user/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ login: username, password }),
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Ошибка сети');
      }
      return response.json();
    })
    .then(data => {
      console.log('Успешный вход:', data);
      router.push('/pages');
  
      // Отправка только логина на другой сервер
      return fetch('http://localhost:8000/record-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: username }),
      });
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Ошибка при отправке логина');
      }
      return response.json();
    })
    .then(data => {
      console.log('Логин отправлен на второй сервер:', data);
    })
    .catch(error => {
      notification.error({
        message: 'Ошибка входа',
        description: error.message,
      });
    });
  };
  

  const handleSubmit = (values) => {
    setUsername(values.username);
    setPassword(values.password);
    login();
  };


  return (
    <div
    style={{
      backgroundImage: `url('https://sun6-22.userapi.com/impg/ea5efJ08T6CZ5554OWarwvx1apcUUPQ1J0VKzg/W49gxvtXSJQ.jpg?size=1280x1280&quality=95&sign=7742d1e6d8c6dbc782c90053de6e9958&type=album')`, // Задний фон
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
<div style={{ maxWidth: '800px', padding: '40px', background: 'rgb(185 185 185 / 90%)', borderRadius: '20px' }}>
    <Form
      name="basic"
      initialValues={{ remember: true }}
      onFinish={handleSubmit}
      style={{ fontSize: '24px' }} 
    >
          <Form.Item
            label="Логин"
            name="username"
            rules={[{ required: true, message: 'Пожалуйста, введите ваш логин!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Пароль"
            name="password"
            rules={[{ required: true, message: 'Пожалуйста, введите ваш пароль!' }]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Войти
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}