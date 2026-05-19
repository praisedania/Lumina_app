# Product Requirements Document (PRD): Lumina Flutter Mobile Application

## 1. Executive Summary
This document defines the product and technical specifications for the **Lumina Native Mobile Application** built with **Flutter**. 

The mobile client enables students to browse and purchase courses, stream offline-cached videos, participate in real-time chat rooms, and receive native push notifications upon live events (messaging, enrollment success, and sales).

---

## 2. Technical Stack & Architecture

- **Framework:** Flutter (Targeting iOS and Android from a single codebase).
- **Architecture Pattern:** Clean Architecture with Feature-First structure.
- **State Management:** **Bloc (Business Logic Component)** or **Riverpod** for robust, highly predictable state streams.
- **Networking:** `dio` for advanced HTTP client networking (interceptors, authorization, chunked video streaming, request cancellation).
- **WebSockets:** `socket_io_client` (pure Dart package) to handle real-time chat pipelines, typing triggers, and instant transaction responses.
- **Local Persistence & Caching:** 
  - `flutter_secure_storage` to encrypt and store auth JWT credentials.
  - `isar` or `hive` for fast, lightweight local database storage of chat histories and catalog caches.
- **Core Plugins:**
  - `video_player` / `chewie` for custom controls, speed toggles, and video streaming.
  - `webview_flutter` to render secure checkout forms inside an in-app browser interface.
  - `flutter_local_notifications` + Firebase Cloud Messaging (FCM) for push notifications.

---

## 3. Core Mobile Flows & Wireframe Architecture

```
Lumina Mobile Screen Layout
 ├── Splash / Auth Gateway
 │    ├── Login Screen
 │    └── Registration (Student/Instructor toggles)
 ├── Main Tab Navigator (BottomNavigationBar)
 │    ├── 🏠 Home / Course Catalog (Grids, Search, Category Tabs)
 │    ├── 📖 My Learning (Enrolled Course Lists, Progress Bars)
 │    ├── 💬 Chat Center (Group Rooms & DM Sidebars)
 │    └── 👤 Profile & Instructor Panel (Settings, Bank Setup, Sales Stats)
 └── Sub-routes / Detail Screens
      ├── 🎬 Video Course Player Screen (Split-screen player, lesson lists)
      ├── 💳 In-App Paystack Checkout Webview
      └── 📊 Earnings Analytics Dashboard (for elevated Instructors)
```

---

## 4. Key Mobile Screen Requirements

### 4.1 Home & Course Catalog (`catalog_screen.dart`)
- **UX Layout:** Clean search bar at the top, followed by horizontal scrolling category pills, and a vertically scrolling course grid.
- **Purchase & Checkout Flow:**
  1. Clicking a course card navigates to `course_detail_screen.dart`.
  2. Clicking **"Buy Course"** dispatches a `POST` request to `/api/payments/checkout`.
  3. If **Free**, instantly updates local state, plays a success checkmark animation, and navigates to the video player.
  4. If **Paid**:
     - The app launches the in-app checkout screen (`checkout_webview.dart`) passing the returned `authorization_url`.
     - **Webview Handshake Logic:**
       - The webview loads the Paystack payment gateway.
       - A custom navigation interceptor (`onPageStarted` / `onUrlChange`) monitors redirect links.
       - Upon detecting a redirect to the Lumina callback URL (or showing `status=success`), the webview terminates automatically.
       - The parent screen triggers a success dialog: *"Payment verified! Welcome to the class!"* and updates the student's enrollment status.

---

### 4.2 LMS Video Player Screen (`course_player_screen.dart`)
- **UX Layout:** Landscape/portrait auto-rotation support.
  - **Portrait:** Video player occupies the top third. Tab panels below switch between **"Lessons Checklist"**, **"Rich Notes"**, and **"Course Chat"**.
  - **Landscape:** Video enters immersive full-screen. Controls reveal custom forward/backward 10s skip buttons and playback speed selector.
- **Progress Synchronization:**
  - Checking a lesson triggers `PATCH /api/enroll/progress/:lessonId`.
  - The local progress state is updated in the Bloc and updates the custom circular progress indicator in real-time.

---

### 4.3 Collaboration Messaging Hub (`chat_hub_screen.dart`)
- **UX Layout:** Top toggle tab bar switching between **"Classrooms"** and **"Direct Messages"**.
- **Real-Time Pipeline:**
  - Authenticates automatically upon connection using JWT headers via `socket_io_client`.
  - Typing in the message box emits `typing` state; displays a sliding bubble text *"Jane is typing..."* on other clients via `user_typing` listeners.
  - Chat history is cached locally using Hive so the student can read previous conversations offline immediately. New incoming messages append to the list smoothly with a spring animation.

---

### 4.4 Instructor Workspace & Earnings (`instructor_dashboard.dart`)
- **Onboarding bank details (`bank_onboarding.dart`)**:
  - Drops down bank selection fields, validates routing codes, and handles `POST /api/instructor/profile/bank-details` with elegant error indicators (e.g. highlighting invalid account length).
- **Earnings stats view (`earnings_view.dart`)**:
  - Employs beautiful custom vector charts (using `fl_chart`) representing sales performance.
  - **Live Sale push alert**:
    - If the app is in the background, a native system notification pops up via FCM on successful checkout: *"Sale Alert! Jane Student just bought your course. You earned ₦12,000!"*.
    - If the app is active, it plays a custom cash register sound effect, pops a sliding toast alert, and increments stats metrics instantly via WebSocket `'live_sale_notification'` listeners.

---

## 5. Mobile Security & Offline Resilience

### 5.1 Storage Security
- JWT keys, user roles, and profile metadata must be saved using `flutter_secure_storage` (leveraging **Keychain** on iOS and **AES-encrypted SharedPreferences** on Android).

### 5.2 Network Resilience (Offline Mode)
- **Offline Caching:** The Home Catalog and Chat details should load instantly from local Hive caches before refreshing from the server.
- **Status Indicator:** A subtle ribbon banner should slide down from the app bar notifying the user if their device has lost network connectivity, converting buttons into safe, disabled read-only states until reconnection is achieved.
