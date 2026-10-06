# Lumina LMS Frontend Specification

**Project:** Lumina LMS  
**Frontend:** Next.js + TypeScript + React  
**Backend:** Node.js + Express + PostgreSQL + Sequelize  
**Real-time:** Socket.io  
**Version:** MVP 1.0

---

# 1. AI AGENT MASTER INSTRUCTIONS

You are building the frontend for **Lumina LMS**, a community-driven Learning Management System.

Build a production-quality frontend based strictly on this specification and the existing backend API documentation/source code available in the repository.

## Non-negotiable rules

1. **Do not invent backend endpoints.**
   - Use the documented API routes and inspect the existing backend source code where available.
   - If an operation is not supported by the backend, do not fake it.

2. **Do not invent request or response shapes.**
   - Inspect controllers, routes, models, serializers, and existing API responses before implementing integration.
   - If the README and backend source disagree, prefer the actual backend implementation.

3. **Do not use permanent mock data.**
   - Temporary mock data is allowed during UI development.
   - Remove mock data before considering the feature complete.

4. **Do not hardcode users, courses, lessons, messages, enrollment status, or progress.**
   - These must come from the backend.

5. **Keep API logic separate from UI components.**
   - Use centralized API clients, service modules, hooks, and query/mutation functions.

6. **Use TypeScript throughout.**
   - Avoid `any` unless absolutely unavoidable and document why it is needed.

7. **Every asynchronous screen must handle:**
   - Loading
   - Success
   - Error
   - Empty state where applicable

8. **Frontend authorization is not security.**
   - Route guards are for user experience.
   - The backend remains the authority for permissions.

9. **Socket.io must be genuinely real-time.**
   - Do not replace Socket.io with fake polling.
   - Clean up listeners when components unmount or conversations change.

10. **Do not pretend unsupported backend functionality works.**
    - If a UI requires an endpoint that does not exist, isolate the service method and clearly document the missing backend requirement.

11. **Do not expose secrets in the frontend.**
    - Never expose database credentials, JWT secrets, or other server secrets.

12. **Sanitize rendered content.**
    - Do not dangerously render arbitrary user-generated chat or lesson HTML.

13. **Prioritize working functionality over decorative UI.**
    - The finished application should be usable end-to-end.

14. **Do not stop at a visual prototype.**
    - Connect implemented screens to the actual backend wherever the required API exists.

15. **Before declaring the project complete, test the major user journeys end-to-end.**

---

# 2. PRODUCT OVERVIEW

Lumina is a flexible, community-driven LMS.

Unlike traditional LMS platforms that force learners through a strict sequence, Lumina allows students to access lessons in any order.

The core differentiator is the **real-time communication layer**:

- Course rooms
- Direct messages
- Typing indicators
- Online/offline presence
- Instructor/student communication
- Peer-to-peer communication

---

# 3. USER ROLES

## Student

Students can:

- Browse courses
- View course details
- Enroll in courses
- View lessons in any order
- Mark lessons completed
- Track course progress
- Participate in course rooms
- Send direct messages
- Receive real-time messages
- See typing indicators
- See user presence

## Instructor

Instructors can:

- Create courses
- Manage their courses
- Manage lessons where supported by the backend
- View enrolled students where supported
- Participate in course rooms
- Communicate with students through DMs

## Admin

Admin functionality is optional for MVP.

If the backend supports it, provide an isolated admin area for:

- User oversight
- Course oversight
- Categories

Do not invent admin endpoints.

---

# 4. RECOMMENDED FRONTEND STACK

Use:

- Next.js
- TypeScript
- React
- Tailwind CSS
- shadcn/ui
- Lucide React
- Axios
- Socket.io Client
- TanStack Query
- React Hook Form
- Zod
- Sonner or an equivalent toast library

Do not add unnecessary dependencies.

---

# 5. VISUAL DESIGN

Lumina should look like a modern education/productivity platform.

Design characteristics:

- Clean
- Modern
- Professional
- Friendly
- Minimal
- Spacious
- Accessible
- Strong visual hierarchy

Use:

- Light background
- White cards
- Soft gray surfaces
- Dark readable text
- One primary accent color
- Subtle borders
- Moderate rounded corners
- Minimal shadows

Avoid:

- Excessive gradients
- Excessive animation
- Overly colorful dashboards
- Huge decorative elements
- Crowded layouts

Animations should be subtle and purposeful.

---

# 6. APPLICATION LAYOUTS

## Public Layout

Routes:

```text
/
 /courses
 /courses/[id]
 /login
 /register
```

Navigation:

```text
Lumina

Courses
About

Login
Get Started
```

## Authenticated Layout

Desktop:

```text
┌──────────────────────────────────────────────────────┐
│ Lumina                 Search        🔔    Avatar     │
├──────────────┬───────────────────────────────────────┤
│ Dashboard    │                                       │
│ My Learning  │                                       │
│ Courses      │            Main Content               │
│ Messages     │                                       │
│              │                                       │
│ Settings     │                                       │
│ Logout       │                                       │
└──────────────┴───────────────────────────────────────┘
```

Mobile:

- Collapsible sidebar or drawer
- Bottom navigation where appropriate

## Instructor Layout

Include:

```text
Dashboard
My Courses
Create Course
Students
Messages
Settings
```

---

# 7. ROUTES

## Public

```text
/
/courses
/courses/[id]
/login
/register
```

## Student

```text
/dashboard
/my-learning
/my-learning/[courseId]
/my-learning/[courseId]/lesson/[lessonId]
/messages
/messages/[conversationId]
/courses/[courseId]/room
/profile
/settings
```

## Instructor

```text
/instructor
/instructor/courses
/instructor/courses/create
/instructor/courses/[id]
/instructor/courses/[id]/edit
/instructor/courses/[id]/lessons
/instructor/courses/[id]/students
/instructor/messages
```

## Optional Admin

```text
/admin
/admin/users
/admin/courses
/admin/categories
```

Only implement admin functionality when corresponding backend APIs exist.

---

# 8. AUTHENTICATION

## Register

Endpoint:

```http
POST /api/auth/register
```

Form:

```text
Name
Email
Password
Confirm Password
```

Validation:

- Name required
- Valid email
- Password minimum 8 characters
- Password confirmation must match

Successful registration:

```text
Registration successful
→ redirect to login
```

## Login

Endpoint:

```http
POST /api/auth/login
```

Form:

```text
Email
Password
```

The backend returns a JWT and user profile.

Create an authentication layer exposing:

```ts
user
token
isAuthenticated
isLoading
login()
logout()
```

Prefer HTTP-only cookies if the backend supports them.

If the backend requires token-based client authentication, implement the safest compatible approach.

---

# 9. AUTH GUARDS

Create:

```text
ProtectedRoute
InstructorRoute
AdminRoute
```

Expected behavior:

```text
Unauthenticated
→ /login

Authenticated student accessing instructor-only page
→ /dashboard

Unauthorized admin page
→ appropriate safe route
```

Do not rely on frontend guards for actual authorization.

---

# 10. HOMEPAGE

Route:

```text
/
```

Sections:

## Hero

```text
Learn at your own pace.
Connect. Learn. Grow.

Explore courses, learn from instructors,
and connect with a community of learners.

[Explore Courses]
[Get Started]
```

## Featured Courses

Display real courses from the backend when the endpoint supports it.

## Why Lumina?

Features:

```text
Flexible Learning
Learn lessons in any order.

Real-Time Community
Connect with instructors and learners.

Track Your Progress
Know exactly how far you've come.

Learn Together
Participate in course discussions.
```

## CTA

```text
Ready to start learning?

[Explore Courses]
```

---

# 11. COURSE DISCOVERY

Route:

```text
/courses
```

Primary endpoint:

```http
GET /api/courses/home
```

Support pagination when the backend provides pagination.

Course cards display:

- Thumbnail
- Category
- Course title
- Short description
- Instructor
- Number of lessons when available
- Enrollment status when authenticated
- Progress when enrolled

Example:

```text
┌─────────────────────────────┐
│        Course Image         │
├─────────────────────────────┤
│ BACKEND DEVELOPMENT         │
│                             │
│ Node.js Backend Development │
│                             │
│ Learn how to build APIs...  │
│                             │
│ Instructor Name             │
│ 12 Lessons                  │
│                             │
│ [View Course]               │
└─────────────────────────────┘
```

---

# 12. SEARCH AND FILTERING

Provide a course search UI:

```text
Search courses...
```

Potential filters:

- Category
- Instructor

Potential sorting:

- Newest
- Most Popular

Only send filtering/sorting parameters that the backend actually supports.

If the backend does not currently support a filter, do not silently implement a fake server-side filter.

---

# 13. COURSE DETAILS

Route:

```text
/courses/[id]
```

Endpoint:

```http
GET /api/courses/:id
```

Display:

- Thumbnail
- Category
- Course title
- Description
- Instructor
- Lesson count when available
- Enrollment status
- Enroll button

Below:

```text
What you'll learn

Course Lessons
```

Lesson list example:

```text
01 Introduction
02 Setting up the environment
03 Variables
04 Functions
05 APIs
```

Important:

**Lessons must never be presented as sequentially locked.**

Students can access any lesson after enrollment.

---

# 14. ENROLLMENT

Endpoint:

```http
POST /api/enroll/course/:courseId
```

Button states:

```text
Enroll Now
Enrolling...
You're enrolled!
Start Learning
```

After successful enrollment:

- Refresh course state
- Refresh enrollment state
- Update dashboard/my-learning data
- Update UI without requiring a full page reload

---

# 15. STUDENT DASHBOARD

Route:

```text
/dashboard
```

Welcome section:

```text
Welcome back, {name}.

Continue your learning journey.
```

Stats:

```text
Courses Enrolled
Courses Completed
Lessons Completed
Learning Progress
```

Continue Learning:

```text
Node.js Backend Development

Progress
████████████░░░░ 75%

9 / 12 lessons completed

[Continue Learning]
```

Recent courses should use actual backend data.

---

# 16. MY LEARNING

Route:

```text
/my-learning
```

Endpoint:

```http
GET /api/enroll/my-enrollments
```

Filters:

```text
All
In Progress
Completed
```

Each course card displays:

- Course
- Instructor
- Progress
- Completed lessons
- Total lessons
- Continue button

---

# 17. LEARNING INTERFACE

Route:

```text
/my-learning/[courseId]
```

Primary layout:

```text
┌─────────────────────────────────────────────────────┐
│ Course Name                              Progress 65%│
├───────────────────┬─────────────────────────────────┤
│ Lessons           │ Lesson Content                  │
│                   │                                 │
│ ✓ Introduction    │ Introduction to Node.js         │
│ ✓ Setup           │                                 │
│ ✓ Variables       │ Lesson content                  │
│ → Functions       │                                 │
│ ○ APIs            │ Video                           │
│ ○ Express         │                                 │
│                   │ [Mark as Complete]              │
└───────────────────┴─────────────────────────────────┘
```

On mobile:

```text
Course
↓
Progress
↓
Lesson selector
↓
Lesson content
```

---

# 18. LESSON CONTENT

Supported content types:

- Text
- Markdown
- Video URLs
- YouTube
- Vimeo

Use a safe Markdown renderer.

For YouTube/Vimeo:

- Extract/validate the supported video URL
- Render an appropriate embed
- Do not inject arbitrary HTML

Never render untrusted HTML directly.

---

# 19. LESSON COMPLETION

Current documented endpoint:

```http
PATCH /api/enroll/toggle-progress
```

The exact request payload must be confirmed against the actual backend controller/service.

When completed:

```text
Mark as Complete
```

changes to:

```text
✓ Completed
```

If the backend supports toggling back:

```text
✓ Completed
```

can toggle to incomplete.

After successful mutation:

- Update lesson status
- Update progress percentage
- Update enrollment state
- Update dashboard/my-learning cache

---

# 20. PROGRESS

Conceptually:

```text
Progress =
(completed lessons / total lessons) × 100
```

Display:

```text
8 / 10 lessons
80%
```

Use:

- Progress bar
- Percentage
- Completed count
- Total count

Do not enforce lesson ordering.

---

# 21. COURSE ROOM

Every course has a persistent community room.

Route:

```text
/courses/[courseId]/room
```

Only authenticated/enrolled users should be able to access it according to backend authorization.

Example:

```text
┌─────────────────────────────────────────────────────┐
│ Node.js Backend Course Room                         │
│ 128 learners                                        │
├─────────────────────────────┬───────────────────────┤
│ Messages                    │ Course Members        │
│                             │                       │
│ Sarah                       │ 🟢 Praise             │
│ Hey everyone!               │ 🟢 Sarah              │
│                             │ ⚪ John                │
│ Praise                      │ ⚪ David              │
│ Welcome!                    │                       │
│                             │                       │
│ John is typing...           │                       │
├─────────────────────────────┴───────────────────────┤
│ Type a message...                         [Send]    │
└─────────────────────────────────────────────────────┘
```

---

# 22. SOCKET.IO

Install:

```bash
npm install socket.io-client
```

Create a centralized socket service/provider.

Conceptually:

```ts
io(SOCKET_URL, {
  auth: {
    token
  }
})
```

The exact handshake must match the backend implementation.

Use one authenticated socket connection per logged-in user.

Do not create sockets on every render.

---

# 23. SOCKET EVENTS

## Client → Server

### join_room

```text
join_room
```

Payload:

```text
conversationId
```

### send_message

```text
send_message
```

Payload:

```json
{
  "conversationId": "...",
  "text": "Hello everyone"
}
```

### send_dm

```text
send_dm
```

Payload:

```json
{
  "recipientUsername": "...",
  "text": "Hello"
}
```

### typing

```text
typing
```

Payload:

```json
{
  "conversationId": "...",
  "isTyping": true
}
```

---

# 24. SOCKET LISTENERS

Listen for:

```text
receive_message
user_typing
joined
dm_sent
```

Where supported by the backend, also listen for:

```text
user_status
```

### receive_message

Append the new message immediately.

### user_typing

Display:

```text
Sarah is typing...
```

### joined

Use as room-join confirmation.

### dm_sent

Use as confirmation for direct-message sends where applicable.

### user_status

Update online/offline indicators.

---

# 25. TYPING INDICATORS

Typing events should be debounced/throttled.

Do not emit a socket event for every keystroke.

Behavior:

```text
User starts typing
→ typing(true)

User stops typing
→ typing(false)
```

Use a reasonable debounce, such as approximately 300–500ms, while matching backend expectations.

---

# 26. MESSAGES PAGE

Route:

```text
/messages
```

Endpoint:

```http
GET /api/chat/conversations
```

Layout:

```text
┌─────────────────────────────────────────────────────┐
│ Messages                                            │
├──────────────────┬──────────────────────────────────┤
│ Conversations    │ Select a conversation             │
│                  │                                  │
│ Course Room      │                                  │
│ Sarah            │                                  │
│ John             │                                  │
│ Instructor       │                                  │
└──────────────────┴──────────────────────────────────┘
```

Conversation items should show:

- Name/title
- Avatar where available
- Conversation type
- Last message where available
- Timestamp where available
- Unread state where supported

---

# 27. CONVERSATION PAGE

Route:

```text
/messages/[conversationId]
```

Endpoint:

```http
GET /api/chat/history/:conversationId
```

Display:

- Message history
- Current user messages
- Other user messages
- Timestamps
- Typing indicator
- Message input
- Online status when supported

Message example:

```text
Sarah
10:32 AM
Welcome everyone!

Praise
10:33 AM
Hey Sarah! How are you?
```

---

# 28. STARTING A DM

Endpoint:

```http
POST /api/chat/conversation
```

Support backend-supported input:

```text
recipientId
```

or:

```text
recipientUsername
```

UI:

```text
New Message

Search for a user...

[Start Conversation]
```

After success:

```text
/messages/[conversationId]
```

---

# 29. CHAT UX

Support:

- Message history
- Sending
- Enter to send
- Shift + Enter for newline
- Typing indicators
- Online/offline status
- Auto-scroll
- Date separators
- Empty state
- Loading state
- Error state
- Socket reconnection handling
- Duplicate-message prevention

Use optimistic UI only if it can be safely reconciled with the backend.

---

# 30. INSTRUCTOR DASHBOARD

Route:

```text
/instructor
```

Display:

```text
Welcome back, Instructor.

Total Courses
Total Students
Total Lessons

Your Courses
```

Course cards:

```text
Node.js Fundamentals

124 Students
15 Lessons

[Manage Course]
```

Use actual backend data where supported.

---

# 31. CREATE COURSE

Route:

```text
/instructor/courses/create
```

Endpoint:

```http
POST /api/courses
```

Form:

```text
Course Title
Description
Thumbnail URL
Category
```

Button:

```text
Create Course
```

Use React Hook Form + Zod.

---

# 32. EDIT COURSE

Route:

```text
/instructor/courses/[id]/edit
```

Expected fields:

```text
Title
Description
Thumbnail
Category
```

Buttons:

```text
Save Changes
Cancel
```

Important:

The currently documented backend does not provide a course update endpoint.

Do not invent:

```text
PATCH /api/courses/:id
```

unless it actually exists in the backend.

If missing:

- Keep the UI/service abstraction ready
- Clearly document the missing backend endpoint
- Do not pretend the save operation works

---

# 33. LESSON MANAGEMENT

Route:

```text
/instructor/courses/[id]/lessons
```

Display:

```text
Lessons

01 Introduction
02 Node.js Basics
03 Express
04 PostgreSQL
05 Authentication
```

Potential actions:

```text
Edit
Delete
Reorder
Add Lesson
```

Current documented backend only exposes:

```http
GET /api/lessons/course/:courseId
```

No documented endpoints currently exist for:

```text
POST /lessons
PATCH/PUT /lessons/:id
DELETE /lessons/:id
```

Do not invent these endpoints.

Build the UI architecture so these operations can be added once the backend exposes them.

---

# 34. INSTRUCTOR STUDENTS

Route:

```text
/instructor/courses/[id]/students
```

Desired display:

```text
Student
Email
Progress
Enrollment Date
```

Example:

```text
Sarah Johnson
sarah@example.com

Progress
80%

[Message]
```

The current API documentation does not expose a course-specific enrollment-list endpoint.

Do not invent one.

Prepare a service abstraction for future backend support.

---

# 35. PROFILE

Route:

```text
/profile
```

Display:

```text
Avatar
Name
Username
Email
Role
```

Potential actions:

```text
Edit Profile
Change Password
```

Only implement operations supported by the backend.

---

# 36. NOTIFICATIONS

Header:

```text
🔔
```

Potential real-time notifications:

```text
You have a new message.
You were enrolled in a course.
Sarah replied in Node.js Course Room.
```

Do not build a persistent notification API unless the backend supports it.

For MVP, transient notifications can be generated from relevant real-time events.

---

# 37. API ARCHITECTURE

Do not put Axios calls directly throughout components.

Recommended structure:

```text
services/
├── api.ts
├── auth.service.ts
├── courses.service.ts
├── lessons.service.ts
├── enrollment.service.ts
├── chat.service.ts
└── users.service.ts
```

Architecture:

```text
React Component
      ↓
React Query Hook
      ↓
Service
      ↓
Axios Client
      ↓
Express API
```

---

# 38. AXIOS CLIENT

Create a centralized client:

```text
lib/api.ts
```

Responsibilities:

- Base URL
- Authentication
- Headers
- Error normalization
- 401 handling
- Token/cookie handling

Environment:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

Never hardcode API URLs throughout components.

---

# 39. TANSTACK QUERY

Use TanStack Query for server state.

Queries:

```text
useCourses()
useCourse(id)
useLessons(courseId)
useEnrollments()
useConversations()
useConversationHistory(conversationId)
```

Mutations:

```text
useLogin()
useRegister()
useEnroll()
useToggleProgress()
useCreateCourse()
```

Invalidate/update relevant queries after mutations.

Example:

```text
Enrollment successful
→ invalidate course
→ invalidate my-enrollments
→ refresh dashboard data
```

---

# 40. ERROR HANDLING

Every request must have appropriate:

## Loading

Use skeletons/spinners.

## Error

Example:

```text
Unable to load courses.

[Try Again]
```

## Empty

Example:

```text
You haven't enrolled in any courses yet.

[Explore Courses]
```

Never leave a page blank with no explanation.

---

# 41. FORM VALIDATION

Use Zod + React Hook Form.

## Login

```text
email: valid email
password: required
```

## Register

```text
name: required
email: valid email
password: minimum 8 characters
confirmPassword: must match
```

## Course

```text
title: required, minimum 3 characters
description: required
category: required
thumbnail: validate as URL when provided
```

Show field-level errors.

---

# 42. TOASTS

Use toast notifications rather than `alert()`.

Examples:

```text
✓ Course enrolled successfully
✓ Lesson marked as completed
✓ Message sent
✓ Course created
✕ Unable to enroll in course
✕ Invalid login credentials
```

---

# 43. LOADING BUTTONS

Examples:

```text
Login
→ Signing in...

Create Course
→ Creating...

Enroll Now
→ Enrolling...

Send
→ Sending...
```

Disable duplicate submissions.

---

# 44. RESPONSIVE DESIGN

Desktop:

```text
Sidebar + Main Content
```

Tablet:

```text
Collapsible Sidebar
```

Mobile:

```text
Top Header
Main Content
Bottom Navigation or Drawer
```

The learning interface and chat interface must receive special mobile attention.

---

# 45. ACCESSIBILITY

Implement:

- Semantic HTML
- Keyboard navigation
- Visible focus states
- Proper labels
- Alt text
- ARIA attributes where necessary
- Sufficient contrast

Never communicate state using color alone.

For example:

```text
✓ Completed
```

rather than only using a green color.

---

# 46. SECURITY

Frontend requirements:

- Never expose `JWT_SECRET`
- Never expose database credentials
- Never store passwords
- Validate user input
- Sanitize chat content
- Safely render Markdown
- Handle expired authentication
- Handle 401 responses
- Disconnect Socket.io on logout
- Do not trust client-side roles for backend authorization

---

# 47. SOCKET LIFECYCLE

Login:

```text
User logs in
    ↓
Create socket
    ↓
Authenticate
    ↓
Register global listeners
```

Logout:

```text
Disconnect socket
    ↓
Remove listeners
    ↓
Clear auth state
    ↓
Redirect to login
```

Conversation change:

```text
Leave/cleanup previous room listeners
    ↓
Load history
    ↓
Join new room
    ↓
Register room-specific listeners
```

Prevent duplicated listeners.

---

# 48. COMPONENT ARCHITECTURE

Recommended structure:

```text
components/
├── layout/
│   ├── Navbar
│   ├── Sidebar
│   ├── MobileNav
│   └── PageHeader
│
├── courses/
│   ├── CourseCard
│   ├── CourseGrid
│   ├── CourseFilters
│   ├── CourseHeader
│   └── LessonList
│
├── learning/
│   ├── LessonSidebar
│   ├── LessonContent
│   ├── ProgressBar
│   ├── VideoPlayer
│   └── MarkdownRenderer
│
├── chat/
│   ├── ConversationList
│   ├── ConversationItem
│   ├── MessageList
│   ├── MessageBubble
│   ├── MessageInput
│   ├── TypingIndicator
│   └── OnlineIndicator
│
├── dashboard/
│   ├── StatCard
│   ├── ContinueLearning
│   └── RecentCourses
│
├── instructor/
│   ├── CourseForm
│   ├── LessonManager
│   ├── StudentList
│   └── InstructorStats
│
└── ui/
    ├── Button
    ├── Input
    ├── Modal
    ├── Dropdown
    ├── Avatar
    ├── Badge
    ├── Card
    ├── Progress
    └── Skeleton
```

---

# 49. PROJECT STRUCTURE

Recommended Next.js structure:

```text
lumina-frontend/
├── app/
│   ├── page.tsx
│   ├── login/
│   │   └── page.tsx
│   ├── register/
│   │   └── page.tsx
│   ├── courses/
│   │   ├── page.tsx
│   │   └── [id]/
│   │       └── page.tsx
│   ├── dashboard/
│   │   └── page.tsx
│   ├── my-learning/
│   │   ├── page.tsx
│   │   └── [courseId]/
│   │       ├── page.tsx
│   │       └── lesson/
│   │           └── [lessonId]/
│   │               └── page.tsx
│   ├── messages/
│   │   ├── page.tsx
│   │   └── [conversationId]/
│   │       └── page.tsx
│   ├── instructor/
│   │   ├── page.tsx
│   │   ├── courses/
│   │   └── ...
│   └── profile/
│       └── page.tsx
│
├── components/
├── hooks/
├── services/
├── lib/
├── providers/
├── types/
├── utils/
├── public/
├── middleware.ts
├── .env.local
├── package.json
└── README.md
```

---

# 50. TYPESCRIPT TYPES

Create centralized types.

Example:

```ts
export type UserRole = "student" | "instructor" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar_url?: string;
}
```

Course:

```ts
export interface Course {
  id: string;
  instructor_id: string;
  title: string;
  description: string;
  thumbnail?: string;
  category: string;
}
```

Lesson:

```ts
export interface Lesson {
  id: string;
  course_id: string;
  title: string;
  content: string;
  order_index: number;
}
```

Enrollment:

```ts
export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  completed_lesson_ids: string[];
}
```

Message:

```ts
export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  text: string;
  timestamp: string;
}
```

Conversation:

```ts
export interface Conversation {
  id: string;
  type: "room" | "dm";
  participants: User[];
  course_id?: string;
}
```

Important: adjust these interfaces to match the actual backend response shapes if they differ.

---

# 51. BACKEND API CONTRACT

The currently documented endpoints are:

## Authentication

```text
POST /api/auth/register
POST /api/auth/login
```

## Courses

```text
GET /api/courses/home
GET /api/courses
GET /api/courses/:id
POST /api/courses
```

## Lessons

```text
GET /api/lessons/course/:courseId
```

## Enrollment

```text
POST /api/enroll/course/:courseId
GET /api/enroll/my-enrollments
PATCH /api/enroll/toggle-progress
```

## Chat

```text
GET /api/chat/conversations
GET /api/chat/history/:conversationId
POST /api/chat/conversation
```

## Socket.io

Client events:

```text
join_room
send_message
send_dm
typing
```

Server events:

```text
receive_message
user_typing
joined
dm_sent
```

The backend documentation also describes a possible:

```text
user_status
```

event for presence.

Verify its actual implementation before depending on it.

---

# 52. BACKEND GAPS

The following operations are desired by the product but are not currently documented as backend endpoints.

| Feature | Required API | Current Status |
|---|---|---|
| Course creation | POST /api/courses | Available |
| Course editing | PATCH/PUT /api/courses/:id | Not documented |
| Lesson retrieval | GET /api/lessons/course/:courseId | Available |
| Lesson creation | POST /api/lessons | Not documented |
| Lesson editing | PATCH/PUT /api/lessons/:id | Not documented |
| Lesson deletion | DELETE /api/lessons/:id | Not documented |
| Instructor student list | Course enrollment endpoint | Not documented |
| User profile update | Profile endpoint | Not documented |
| Presence | user_status | Verify implementation |
| Course-room discovery | Conversation/course relationship | Verify implementation |

Do not fabricate these endpoints.

If the backend source code reveals that they actually exist, use the real routes.

---

# 53. ENVIRONMENT VARIABLES

Development:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
```

Production:

```env
NEXT_PUBLIC_API_URL=https://your-api-domain.com/api
NEXT_PUBLIC_SOCKET_URL=https://your-api-domain.com
```

Never put these in frontend environment variables:

```text
JWT_SECRET
DB_PASSWORD
DB_USER
DB_NAME
```

---

# 54. PERFORMANCE

Implement:

- Image optimization
- Pagination
- React Query caching
- Debounced search
- Lazy loading where appropriate
- Socket listener cleanup
- Minimal unnecessary re-renders
- Efficient message rendering
- Efficient course/lesson rendering

Do not load huge message/course datasets if the backend supports pagination.

---

# 55. SEO

Public pages should include metadata.

Homepage:

```text
Lumina LMS — Learn. Connect. Grow.
```

Course:

```text
{Course Name} | Lumina LMS
```

Include:

- title
- description
- Open Graph metadata where appropriate

Authenticated dashboard pages do not require heavy SEO.

---

# 56. DOCKER SUPPORT

The frontend should eventually support Docker.

Use a multi-stage build:

```text
Dependencies
    ↓
Build
    ↓
Production runtime
```

The final image should contain only production runtime dependencies and required application output.

---

# 57. DEFINITION OF DONE — STUDENT FLOW

The following must work:

```text
Visit Lumina
    ↓
Register
    ↓
Login
    ↓
Dashboard
    ↓
Browse Courses
    ↓
Open Course
    ↓
Enroll
    ↓
My Learning
    ↓
Open Course
    ↓
Select ANY Lesson
    ↓
Read/Watch Lesson
    ↓
Mark Lesson Complete
    ↓
Progress Updates
    ↓
Open Course Room
    ↓
Send Message
    ↓
Another User Receives Message
    ↓
Typing Indicator Appears
    ↓
Open Messages
    ↓
Start DM
    ↓
Send Private Message
```

---

# 58. DEFINITION OF DONE — INSTRUCTOR FLOW

Where backend endpoints exist:

```text
Login as Instructor
    ↓
Instructor Dashboard
    ↓
Create Course
    ↓
Manage Course
    ↓
View Course
    ↓
Interact with Students
    ↓
Open Course Room
    ↓
Receive Student Messages
    ↓
Send DM to Student
```

Do not mark unsupported course/lesson management operations as complete.

---

# 59. TESTING REQUIREMENTS

Before completion, test at minimum:

## Authentication

- Register
- Login
- Invalid login
- Logout
- Expired/invalid authentication
- Protected route access

## Courses

- Course list
- Course details
- Course enrollment
- Empty course list
- Course loading/error states

## Learning

- Lesson list
- Open any lesson
- Markdown rendering
- Video rendering
- Toggle progress
- Progress calculation/update

## Chat

- Conversation list
- Message history
- Send message
- Receive message
- Typing indicator
- Room joining
- DM creation
- Socket reconnect
- Socket cleanup

## Instructor

- Instructor route protection
- Create course
- Course management UI
- Unsupported operations clearly handled

## Responsive

Test:

- Desktop
- Tablet
- Mobile

---

# 60. IMPLEMENTATION ORDER

Build in this order.

## Phase 1 — Foundation

Implement:

- Next.js
- TypeScript
- Tailwind
- shadcn/ui
- Axios
- TanStack Query
- Authentication infrastructure
- Layouts
- Shared UI components

## Phase 2 — Public Pages

Implement:

- Homepage
- Course discovery
- Course details
- Login
- Register

## Phase 3 — Student Experience

Implement:

- Dashboard
- My Learning
- Enrollment
- Learning interface
- Lesson rendering
- Progress tracking

## Phase 4 — Instructor

Implement:

- Instructor dashboard
- Course creation
- Course management UI
- Lesson management UI
- Student management UI

Only connect operations that have real backend endpoints.

## Phase 5 — Chat REST

Implement:

- Conversation list
- Message history
- DM creation
- Message UI

## Phase 6 — Socket.io

Implement:

- Authenticated socket connection
- join_room
- send_message
- receive_message
- send_dm
- typing
- user_typing
- dm_sent
- presence where supported

## Phase 7 — Polish

Implement:

- Responsive design
- Loading states
- Error states
- Empty states
- Accessibility
- SEO
- Performance
- Small animations
- Toasts

## Phase 8 — Deployment

Implement:

- Production environment configuration
- Docker
- Production build
- Backend integration testing

---

# 61. RECOMMENDED AGENT WORKFLOW

The coding agent should follow this workflow:

### Step 1 — Inspect

Before writing code:

- Inspect repository structure.
- Inspect backend routes.
- Inspect controllers.
- Inspect Sequelize models.
- Inspect middleware.
- Inspect authentication implementation.
- Inspect Socket.io implementation.
- Identify actual request/response shapes.

### Step 2 — Document discrepancies

If the README says one thing but the code does another:

- Identify the discrepancy.
- Prefer actual backend behavior.
- Keep the frontend abstraction flexible.

### Step 3 — Build foundation

Set up:

- Next.js
- TypeScript
- Tailwind
- UI library
- API client
- Query provider
- Auth provider
- Socket provider

### Step 4 — Build public experience

Complete:

- Homepage
- Courses
- Course details
- Login
- Register

### Step 5 — Build student experience

Complete:

- Dashboard
- Enrollment
- My Learning
- Lesson viewer
- Progress

### Step 6 — Build communication

Complete:

- Conversation list
- History
- Course rooms
- DMs
- Socket events
- Typing
- Presence

### Step 7 — Build instructor experience

Complete all backend-supported instructor functionality.

### Step 8 — Test

Test real backend integration rather than relying on mocks.

### Step 9 — Polish

Fix:

- Mobile layout
- Loading
- Errors
- Accessibility
- Performance
- Navigation
- Socket lifecycle

### Step 10 — Final audit

Before completion verify:

- No fake API calls
- No permanent mock data
- No exposed secrets
- No duplicated socket listeners
- No TypeScript errors
- No broken routes
- No console errors
- No obvious responsive issues

---

# 62. FINAL AGENT PROMPT

Use the following as the final instruction to the coding agent:

> Build the Lumina LMS frontend as a complete, production-quality Next.js application based strictly on this specification and the actual backend implementation.
>
> Start by inspecting the repository and existing backend source code. Identify the real routes, authentication flow, request payloads, response shapes, Sequelize models, authorization rules, and Socket.io events before implementing integration.
>
> Do not invent APIs, payloads, response structures, permissions, or backend behavior.
>
> If the documentation and backend source code disagree, use the actual backend implementation and document the discrepancy.
>
> Build reusable components and keep the application modular. Use TypeScript, TanStack Query, Axios, React Hook Form, Zod, Tailwind CSS, and Socket.io Client as appropriate.
>
> Separate presentation from data access. Components should not contain scattered Axios calls. Use centralized services and hooks.
>
> Implement authentication, route protection, course discovery, course details, enrollment, learning, lesson rendering, progress tracking, instructor functionality supported by the backend, REST chat, and real-time Socket.io communication.
>
> The chat must work in real time without page refreshes and must correctly handle connection lifecycle, room joining, receiving messages, typing indicators, and cleanup.
>
> Every asynchronous operation must have loading, error, success, and appropriate empty states.
>
> The application must be fully responsive and accessible.
>
> Never expose secrets in the frontend.
>
> Never use permanent mock data.
>
> Never pretend an unsupported backend operation works. If a required backend endpoint is missing, isolate the feature and document exactly what backend endpoint is required.
>
> Do not stop after creating the UI. Connect every supported feature to the actual backend and test the complete user flows.
>
> The final result should feel like a real LMS product rather than a generic dashboard template.

---

# 63. FINAL QUALITY BAR

The finished application should satisfy this standard:

```text
                 LUMINA LMS
                     │
        ┌────────────┴────────────┐
        │                         │
     STUDENT                  INSTRUCTOR
        │                         │
   ┌────┴────┐              ┌─────┴─────┐
   │         │              │           │
Courses   Learning       Courses      Students
   │         │              │           │
Enroll    Progress       Create      Support
   │         │              │           │
   └────┬────┘              └─────┬─────┘
        │                         │
        └──────────┬──────────────┘
                   │
              REAL-TIME LAYER
                   │
        ┌──────────┼──────────┐
        │          │          │
     Course       DMs      Presence
      Rooms                 Typing
        │          │          │
        └──────────┴──────────┘
                   │
               Socket.io
                   │
               Express API
                   │
              PostgreSQL
```

The central product principle is:

**Lumina should make learning flexible and social while keeping the learning experience simple and focused.**
