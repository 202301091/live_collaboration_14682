# Live Collaboration

A web application for working together in real time. Users can collaborate, communicate and work on the same workspace while changes are updated in real time.

## Features

* **Heatmaps** - Shows user activity on the shared board
* **Cursor Tracking** - See other users' cursors in real time
* **Shared Board** - Multiple users can draw and work on the same board
* **Synchronized Counter** - Counter updates are synchronized between users
* **Voting System** - Users can create and participate in votes
* **Activity Logs** - Keeps track of user activities in the collaboration session
* **Reaction Blaster** - Users can send reactions that are shown to other users
* **Theme Sync** - Changes in theme are synchronized between users
* **Real-Time Communication** - Uses Socket.IO to send updates between connected users
* **User Authentication** - JWT based authentication for users



## Tech Stack

### Frontend

* Next.js
* React
* Tailwind CSS
* Zustand
* Socket.IO Client

### Backend

* Node.js
* Express.js
* Socket.IO
* MongoDB
* Mongoose
* JWT

## Project Structure

```text
live_collaboration_14682/
│
├── client/          
│
└── server/          
    ├── src/
    │   ├── config/
    │   ├── controllers/
    │   ├── middleware/
    │   ├── models/
    │   ├── routes/
    │   └── sockets/
    │
    ├── app.js
    └── server.js
```

## Getting Started

Clone the repository:

```bash
git clone https://github.com/202301091/live_collaboration_14682.git
```

### Frontend

Go to the client folder:

```bash
cd client
npm install
npm run dev
```

The frontend will run on:

```text
http://localhost:3000
```

### Backend

Open another terminal and go to the server folder:

```bash
cd server
npm install
npm run dev
```

The backend runs on the configured server port.

## Environment Variables

Create a `.env` file inside the `server` folder.

Example:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CORS_ORIGIN=http://localhost:3000
```

Use your own values for the environment variables.

## Real-Time Communication

The application uses Socket.IO for real-time communication between users.

The backend creates a Socket.IO server and uses socket authentication before handling socket events.

## Deployment

The frontend can be deployed separately from the backend.

Live frontend:

https://livecollaboration-drab.vercel.app/

## What I Learned

While building this project, I worked with:

* Real-time communication using WebSockets
* Socket.IO events
* JWT authentication
* REST API development
* MongoDB and Mongoose
* Connecting a Next.js frontend with a Node.js backend
* Managing application state with Zustand
* Handling client-server communication

## Future Improvements

* Add private rooms/groups so users can see and access only the chats and collaboration data of their group
* Handle simultaneous events and concurrent updates when multiple users make changes at the same time
* Add better collaboration permissions for different users
* Add more collaboration features to the workspace

