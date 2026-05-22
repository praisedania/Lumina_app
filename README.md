# Lumina LMS Backend 🌟

Lumina is a community-driven Learning Management System (LMS) built with a focus on real-time interaction and flexible learning paths.

---

## 🚀 Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Real-time:** Socket.io
- **Database:** PostgreSQL (with Sequelize ORM)
- **Security:** JWT Authentication, Helmet, CORS, Bcrypt

---

## 🛠️ Setup & Installation

### 1. Prerequisites
- Node.js (v18+)
- PostgreSQL installed and running

### 2. Installation
```bash
# Install dependencies
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory and add the following:
```env
PORT=3000
DB_USER=your_postgres_user
DB_PASSWORD=your_postgres_password
DB_NAME=lumina_db
DB_HOST=127.0.0.1
DB_PORT=5432
JWT_SECRET=your_super_secret_key
```

### 4. Database Setup
```bash
# Run migrations to create tables
npx sequelize-cli db:migrate
```

### 5. Start the Server
```bash
# Production mode
npm start

# Development mode (with nodemon)
npm run dev
```

---

## 📡 API Reference (for Frontend Devs)

All routes are prefixed with `/api`.

### 🔐 Authentication
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/auth/register` | Register a new user |
| `POST` | `/auth/login` | Login and get JWT token |

### 📚 Courses & Lessons
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/courses/home` | Get paginated courses for Home Page (Public / Optional Auth) |
| `GET` | `/courses` | Get all courses (Private) |
| `GET` | `/courses/:id` | Get single course details |
| `POST` | `/courses` | Create a course (Instructor only) |
| `GET` | `/lessons/course/:courseId` | Get all lessons for a course |

### 🎓 Enrollment & Progress
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/enroll/course/:courseId` | Enroll in a course |
| `GET` | `/enroll/my-enrollments` | Get current user's enrollments |
| `PATCH` | `/enroll/toggle-progress` | Toggle lesson completion status |

### 💬 Chat (REST fallback)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/chat/conversations` | Get user's active rooms and DMs |
| `GET` | `/chat/history/:conversationId` | Get message history |
| `POST` | `/chat/conversation` | Start/get DM by `recipientId` or `recipientUsername` |

---

## 🔌 Socket.io Events (Real-Time)

Connect to the server using the JWT token in the handshake or headers.

### Client-to-Server (Emit)
| Event | Payload | Description |
| :--- | :--- | :--- |
| `join_room` | `conversationId` | Joins a course room or DM |
| `send_message` | `{ conversationId, text }` | Send message to an existing chat |
| `send_dm` | `{ recipientUsername, text }` | Send a DM directly to a user |
| `typing` | `{ conversationId, isTyping }` | Send typing status |

### Server-to-Client (Listen)
| Event | Payload | Description |
| :--- | :--- | :--- |
| `receive_message` | `Message Object` | Received when a new message arrives |
| `user_typing` | `{ userId, userName, isTyping }` | Typing indicator from others |
| `joined` | `{ conversationId }` | Confirmation after joining a room |
| `dm_sent` | `{ conversationId, message }` | Confirmation after `send_dm` |

---

## 🧪 Testing
For detailed testing steps using Postman, refer to the [CHAT_TESTING_GUIDE.md](CHAT_TESTING_GUIDE.MD).

---

## 🤝 Contributing
1. Create a feature branch.
2. Commit your changes.
3. Open a Pull Request.

---
**Lead:** Ifeoluwa | **Backend Dev:** Praise
