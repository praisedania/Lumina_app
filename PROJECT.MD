# Product Requirements Document: Project Lumina

**Version:** 1.0 (MVP)  
**Author:** Ifeoluwa (Lead)  
**Developer:** Praise  
**Stack:** Node.js / Express, WebSockets (Socket.io), Database (SQL/NoSQL)

---

## 1. Product Overview
Lumina is a flexible, community-driven Learning Management System. Unlike traditional platforms that force a linear "Step A to Step B" path, Lumina allows for self-paced, non-linear learning. 

**Core Differentiator:** The **Real-Time Layer**, allowing students to interact with instructors and peers instantly through dedicated course rooms and private messaging.

---

## 2. User Roles & Permissions
- **Student:** Can browse/enroll in courses, view lessons in any order, mark progress, and participate in all chat forms.
- **Instructor:** Can create/edit courses and lessons, view student enrollment lists, and provide 1-on-1 support via DM.
- **Admin:** (Optional for MVP) Global oversight of users and course categories.

---

## 3. Core Functional Requirements

### 3.1 Course & Content Management
- **Course Structure:** Each course must have a Title, Description, Thumbnail, and Category.
- **Flexible Lessons:** Courses contain multiple lessons. Students must be able to access any lesson at any time (no locking/sequencing).
- **Content Types:** Support for Text, Markdown, and Video URLs (YouTube/Vimeo).

### 3.2 Progress Tracking
- **Stateless Completion:** A student can toggle a "Completed" status on any lesson.
- **Dynamic Progress Calculation:** The backend calculates completion percentage:
  $$\text{Progress} = \left( \frac{\text{Completed Lessons}}{\text{Total Lessons}} \right) \times 100$$

### 3.3 Communication Suite (Real-Time Layer)
- **Course Rooms:** Every course has a persistent group chat. Joining a course automatically grants access to that specific WebSocket room.
- **Direct Messaging (DM):**
  - *Student-to-Instructor:* Private support channel.
  - *Student-to-Student:* Peer-to-peer networking.
- **Presence System:** Real-time "Online/Offline" indicators for users.
- **Typing Indicators:** Visual feedback when a user is composing a message.

---

## 4. Technical Architecture

### 4.1 Database Schema (Proposed)
| Entity | Fields |
| :--- | :--- |
| **Users** | id, name, email, password_hash, role, avatar_url |
| **Courses** | id, instructor_id, title, description, category |
| **Lessons** | id, course_id, title, content, order_index |
| **Enrollments** | id, user_id, course_id, completed_lesson_ids[] |
| **Conversations** | id, type (room/dm), participants[], course_id (null for peer DMs) |
| **Messages** | id, conversation_id, sender_id, text, timestamp |

### 4.2 Key API Endpoints
| Method | Endpoint | Purpose |
| :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Returns JWT and User Profile. |
| `GET` | `/api/courses` | Fetch all courses (with filters). |
| `POST` | `/api/enroll/:id` | Link a student to a course. |
| `PATCH` | `/api/progress/:lessonId` | Toggle lesson completion. |
| `GET` | `/api/chat/history/:roomId` | Retrieve past messages for a specific room. |

### 4.3 WebSocket Events (Socket.io)
| Event | Action |
| :--- | :--- |
| `join_room` | Joins a `course_id` or a unique `dm_id`. |
| `send_message` | Emits a message to a specific room; persists it to the DB. |
| `typing` | Broadcasts "User X is typing..." to the room. |
| `user_status` | Emits when a user goes online or offline. |

---

## 5. Security & Constraints
- **JWT Authentication:** All API routes and WebSocket connections must be protected.
- **Room Isolation:** A user should only be able to join a `course_room` if they are enrolled in that course.
- **Data Sanitization:** Chat inputs must be sanitized to prevent XSS (Cross-Site Scripting).

---

## 6. Developer Roadmap
- **Phase 1:** Migrate "Blog" logic to "Course/Lesson" logic.
- **Phase 2:** Build the Enrollment and Progress tracking API.
- **Phase 3:** Implement Basic Socket.io setup (The "Hello World" of Chat).
- **Phase 4:** Develop the Room logic (Course Rooms first).
- **Phase 5:** Finalize Private DM logic using dynamic Room IDs (e.g., `user1_user2`).

---
**Lead’s Note:** *"Praise, you’ve already mastered the static side of APIs with your blog. This project is about making the backend alive. Focus on how data flows in real-time without refreshing the page. You've got this!"*