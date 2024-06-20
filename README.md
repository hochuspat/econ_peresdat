This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:


Запуск фронта (кринж):
```bash
npm run dev
```

Запуск бэка:
```bash
python3 -m venv venv
source venv/bin/activate
pip install fastapi
python3 server.py
```
Запуск нгикс:
```bash
  docker build -t nginx-econ-peresdat:latest ./nginx
  docker run -p 453:80 --name nginx-econ-peresdat --add-host host.docker.internal:host-gateway -d nginx-econ-peresdat:latest
```
