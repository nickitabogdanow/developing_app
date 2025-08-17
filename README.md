# AI Team Platform

Платформа для командной работы ИИ-разработчиков. Это приложение позволяет создавать проекты и работать с командой ИИ агентов, которые могут общаться, планировать спринты, отслеживать баги и разрабатывать продукты.

## 🚀 Возможности

- **Команда ИИ агентов**: 6 предустановленных ИИ агентов с разными ролями (Project Manager, Senior Developer, Frontend Developer, Backend Developer, QA Engineer, DevOps Engineer)
- **Чат-система**: Общий чат и специализированные чаты по группам (менеджеры, разработчики, тестировщики)
- **Управление проектами**: Создание, редактирование и отслеживание проектов
- **Планирование спринтов**: Автоматическое планирование спринтов с помощью ИИ
- **Система багов**: Отслеживание и управление багами
- **Real-time общение**: Мгновенные сообщения через WebSocket
- **Современный UI**: Красивый и отзывчивый интерфейс на React + Tailwind CSS

## 🛠 Технологии

### Backend
- **Node.js** с Express
- **PostgreSQL** для базы данных
- **Socket.io** для real-time коммуникации
- **OpenAI API** для ИИ агентов
- **JWT** для аутентификации

### Frontend
- **React 18** с TypeScript
- **Tailwind CSS** для стилизации
- **Socket.io-client** для WebSocket соединения
- **React Router** для навигации
- **React Hook Form** для форм
- **React Hot Toast** для уведомлений

## 📋 Требования

- Node.js 16+ 
- PostgreSQL 12+
- OpenAI API ключ

## 🔧 Установка

### 1. Клонирование репозитория
```bash
git clone <repository-url>
cd ai-team-platform
```

### 2. Установка зависимостей
```bash
# Установка всех зависимостей
npm run install-all

# Или по отдельности:
npm install
cd server && npm install
cd ../client && npm install
```

### 3. Настройка базы данных

1. Создайте базу данных PostgreSQL:
```sql
CREATE DATABASE ai_team_platform;
```

2. Выполните SQL скрипт для создания таблиц:
```bash
psql -d ai_team_platform -f server/models/schema.sql
```

### 4. Настройка переменных окружения

1. Скопируйте файл окружения:
```bash
cp server/env.example server/.env
```

2. Отредактируйте `server/.env`:
```env
# Database Configuration
DB_USER=your_db_user
DB_HOST=localhost
DB_NAME=ai_team_platform
DB_PASSWORD=your_db_password
DB_PORT=5432

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here

# Server Configuration
PORT=5000
CLIENT_URL=http://localhost:3000
```

### 5. Инициализация ИИ агентов

После запуска сервера, выполните POST запрос для инициализации агентов:
```bash
curl -X POST http://localhost:5000/api/ai/initialize
```

## 🚀 Запуск

### Разработка
```bash
# Запуск сервера и клиента одновременно
npm run dev

# Или по отдельности:
npm run server  # Запуск сервера на порту 5000
npm run client  # Запуск клиента на порту 3000
```

### Продакшн
```bash
# Сборка клиента
npm run build

# Запуск сервера
cd server && npm start
```

## 📖 Использование

### 1. Регистрация и вход
- Зарегистрируйтесь с email и паролем
- Войдите в систему

### 2. Создание проекта
- Нажмите "Новый проект" на главной странице
- Заполните название, описание, бюджет и дедлайн
- Проект автоматически создаст чат-комнаты

### 3. Работа с командой ИИ
- Перейдите в проект
- Откройте чат-комнату
- Начните общение с ИИ агентами
- Агенты будут отвечать в соответствии со своими ролями

### 4. Управление проектом
- Просматривайте команду в разделе "Команда"
- Отслеживайте прогресс в разных чат-комнатах
- Используйте планирование спринтов

## 🏗 Архитектура

### Структура проекта
```
ai-team-platform/
├── server/                 # Backend
│   ├── controllers/        # Контроллеры
│   ├── models/            # Модели БД
│   ├── routes/            # API маршруты
│   └── index.js           # Точка входа сервера
├── client/                # Frontend
│   ├── src/
│   │   ├── components/    # React компоненты
│   │   ├── contexts/      # React контексты
│   │   ├── pages/         # Страницы приложения
│   │   └── App.tsx        # Главный компонент
│   └── public/            # Статические файлы
└── README.md
```

### ИИ агенты

1. **Алексей (Project Manager)** - управление проектами, планирование
2. **Мария (Senior Developer)** - архитектура, full-stack разработка
3. **Дмитрий (Frontend Developer)** - React, UI/UX
4. **Анна (Backend Developer)** - Node.js, API, базы данных
5. **Сергей (QA Engineer)** - тестирование, качество
6. **Елена (DevOps Engineer)** - CI/CD, инфраструктура

## 🔒 Безопасность

- JWT токены для аутентификации
- Хеширование паролей с bcrypt
- Валидация входных данных
- Rate limiting для API
- CORS настройки

## 🤝 API Endpoints

### Аутентификация
- `POST /api/auth/register` - Регистрация
- `POST /api/auth/login` - Вход
- `GET /api/auth/me` - Получить текущего пользователя

### Проекты
- `GET /api/projects/user/:userId` - Проекты пользователя
- `POST /api/projects` - Создать проект
- `GET /api/projects/:id` - Получить проект
- `PUT /api/projects/:id` - Обновить проект

### ИИ агенты
- `GET /api/ai/agents` - Все агенты
- `POST /api/ai/teams` - Создать команду
- `GET /api/ai/teams/:projectId` - Команда проекта

### Чат
- `GET /api/chat/rooms/:roomId/messages` - Сообщения комнаты
- `GET /api/chat/projects/:projectId/rooms` - Комнаты проекта

## 🐛 Устранение неполадок

### Проблемы с базой данных
```bash
# Проверка подключения
psql -h localhost -U your_user -d ai_team_platform

# Пересоздание таблиц
psql -d ai_team_platform -f server/models/schema.sql
```

### Проблемы с OpenAI API
- Убедитесь, что API ключ правильный
- Проверьте лимиты API
- Проверьте подключение к интернету

### Проблемы с WebSocket
- Проверьте, что сервер запущен на порту 5000
- Убедитесь, что CORS настроен правильно
- Проверьте консоль браузера на ошибки

## 📝 Лицензия

MIT License

## 🤝 Вклад в проект

1. Fork репозитория
2. Создайте ветку для новой функции
3. Внесите изменения
4. Создайте Pull Request

## 📞 Поддержка

Если у вас есть вопросы или проблемы, создайте Issue в репозитории.
