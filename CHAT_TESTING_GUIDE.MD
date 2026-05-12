# Testing the Chat Feature in Postman

This guide provides step-by-step instructions for testing both the RESTful API endpoints and the real-time Socket.io implementation of the Lumina chat feature.

## 1. Preparation

Before testing, ensure:
1. Your server is running (`npm run dev`).
2. You have a valid **JWT Token** from the `/api/auth/login` or `/api/auth/register` endpoint.
3. You have at least two users created (for DM testing) and a course created (for Room testing).

---

## 2. Testing REST API Endpoints

These endpoints handle the "static" side of chat: history, conversation management, and metadata.

### A. Get All My Conversations
- **Method:** `GET`
- **URL:** `{{base_url}}/api/chat/conversations`
- **Auth:** Bearer Token (JWT)
- **Response:** Lists all course rooms (enrolled) and private DMs.

### B. Start/Get a DM Conversation
- **Method:** `POST`
- **URL:** `{{base_url}}/api/chat/conversation`
- **Auth:** Bearer Token (JWT)
- **Body (JSON):**
  ```json
  {
    "recipientId": "RECIPIENT_USER_ID",
    "recipientUsername": "RECIPIENT_USERNAME",
    "text": "Initial message (optional)"
  }
  ```
- **Note:** You can use either `recipientId` or `recipientUsername`. If `text` is provided, it sends the message immediately.

### C. Get Chat History
- **Method:** `GET`
- **URL:** `{{base_url}}/api/chat/history/:conversationId`
- **Auth:** Bearer Token (JWT)
- **Params:** `page` (optional), `limit` (optional)
- **Note:** Use the `conversationId` obtained from the "Conversations" or "Start DM" endpoint.

---

## 3. Testing Real-Time Chat (Socket.io)

Postman supports Socket.io natively. Follow these steps:

### A. Create a New Request
1. Click **New** -> **WebSocket**.
2. Change the protocol from `WebSocket` to **Socket.io**.

### B. Connection Setup
1. **URL:** `ws://localhost:3000` (or your server port).
2. **Auth (Crucial):**
   - Click the **Handshake** tab.
   - Click the **Auth** tab within Handshake.
   - Select **Bearer Token** and paste your JWT.
   - Alternatively, add a header: `Authorization: Bearer <your_token>`.
3. Click **Connect**. Check the console/log to ensure you are "Connected".

### C. Listening for Messages
1. In the **Events** tab (or the message area), Postman will automatically list events it "sees".
2. You should listen for:
   - `receive_message`: For new incoming messages.
   - `user_typing`: For typing indicators.
   - `error`: For any permission/server issues.

### D. Sending Events (The "Emit" part)
1. In the **Message** section, ensure the type is **Socket.io**.
2. **Event Name:** `join_room`
   - **Payload (Plain Text/ID):** `"CONVERSATION_ID_HERE"`
   - Click **Send**. You should receive a `joined` event back.
3. **Event Name:** `send_message`
   - **Payload (JSON):**
     ```json
     {
       "conversationId": "CONVERSATION_ID_HERE",
       "text": "Hello from Postman!"
     }
     ```
- **New Feature:** You no longer need to call `join_room` first for DMs or enrolled rooms. The server will auto-join you if you are authorized.
- **Strict Security:** If you try to send to a course room you aren't enrolled in, it will fail with an error.

3. **Event Name:** `send_dm` (Direct to Individual)
   - **Payload (JSON):**
     ```json
     {
       "recipientUsername": "johndoe",
       "text": "Direct message by username!"
     }
     ```
   - *OR* use `recipientId`. This is the easiest way to test DMs. No IDs or joining required.
4. **Event Name:** `typing`
   - **Payload (JSON):**
     ```json
     {
       "conversationId": "CONVERSATION_ID_HERE",
       "isTyping": true
     }
     ```

---

## 4. Suggested Test Flow

1. **User A Login:** Get Token A.
2. **User B Login:** Get Token B.
3. **User A Start DM:** Call `POST /api/chat/conversation` with User B's ID. Note the `conversationId`.
4. **User A Connect Socket:** Use Token A, emit `join_room` with the ID.
5. **User B Connect Socket:** Open a *second* Postman tab, use Token B, emit `join_room` with the same ID.
6. **User A Send Message:** Emit `send_message` event.
7. **Verify:** Check if User B received the `receive_message` event in their tab.
8. **Check History:** Call `GET /api/chat/history/:conversationId` to verify the message was persisted to the database.
