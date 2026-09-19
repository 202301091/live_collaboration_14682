# Live Collaboration

A real-time web application that allows multiple users to collaborate, communicate, and work together in the same workspace while changes are synchronized in real time.

## Features

* **Heatmaps** - Shows user activity on the shared board
* **Cursor Tracking** - Displays other users' cursors in real time
* **Shared Board** - Multiple users can draw and work on the same board
* **Synchronized Counter** - Counter updates are synchronized between users
* **Voting System** - Users can create and participate in votes
* **Activity Logs** - Tracks user activities during collaboration sessions
* **Reaction Blaster** - Users can send real-time reactions to other users
* **Theme Sync** - Synchronizes theme changes between users
* **Real-Time Communication** - Uses Socket.IO for real-time updates
* **User Authentication** - JWT-based authentication
* **Horizontal Scaling** - Multiple backend instances can run behind an Nginx load balancer
* **Distributed Real-Time Communication** - Redis synchronizes Socket.IO events across backend instances

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
* Redis
* Socket.IO Redis Adapter

### Infrastructure

* Nginx
* Redis

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

### Clone the Repository

```bash
git clone https://github.com/202301091/live_collaboration_14682.git
cd live_collaboration_14682
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

REDIS_URL=redis://localhost:6379
```

Use your own values for the environment variables.

> `.env` contains sensitive information and should not be committed to the repository.

## Real-Time Communication

The application uses **Socket.IO** for real-time communication between connected users.

Socket authentication is performed before handling Socket.IO events. Events such as cursor movement, drawing, counter updates, reactions, voting, and theme changes are synchronized between users.

For horizontal scaling, the **Socket.IO Redis Adapter** is used so that events can be propagated between users connected to different backend instances.

## Scaling

### Horizontal Scaling

The backend can be horizontally scaled by running multiple Node.js instances and using **Nginx as a load balancer** to distribute incoming requests.

```text
                         Client
                            │
                            ▼
                         Nginx
                      Load Balancer
                            │
               ┌────────────┼────────────┐
               ▼            ▼            ▼
          Node.js       Node.js       Node.js
          Server 1      Server 2      Server 3
```

Example:

```bash
PORT=5000 npm run dev
PORT=5001 npm run dev
PORT=5002 npm run dev
```

Nginx distributes incoming traffic between these backend instances.

### Redis for Real-Time Scaling

When multiple Socket.IO servers are running, each server can have users connected to it. **Redis** acts as a shared message broker so Socket.IO events can be synchronized across all backend instances.

```text
Node.js Server 1 ──┐
Node.js Server 2 ──┼──► Redis
Node.js Server 3 ──┘
```

Install the required packages:

```bash
npm install @socket.io/redis-adapter redis
```

Redis can be tested using:

```bash
redis-cli ping
```

Expected output:

```text
PONG
```

This architecture allows the application to support more concurrent users while maintaining real-time communication across multiple backend instances.

## Deployment

The frontend and backend can be deployed separately.

Live frontend:

https://livecollaboration-drab.vercel.app/

For backend scaling, multiple Node.js instances can be deployed behind an Nginx load balancer with Redis handling cross-instance Socket.IO communication.

## What I Learned

While building and scaling this project, I worked with:

* Real-time communication using WebSockets and Socket.IO
* Socket.IO event handling
* JWT authentication
* REST API development
* MongoDB and Mongoose
* Connecting a Next.js frontend with a Node.js backend
* State management using Zustand
* Client-server communication
* Horizontal scaling of backend services
* Load balancing using Nginx
* Redis as a message broker
* Scaling Socket.IO using the Redis Adapter
* Handling communication between multiple backend instances

## Future Improvements

* Add private rooms/groups so users can access only their group's collaboration data
* Improve handling of simultaneous events and concurrent updates
* Add role-based collaboration permissions
* Add better conflict resolution for concurrent changes
* Add caching for frequently accessed data using Redis
* Add health checks and automatic recovery for backend instances
* Containerize the application using Docker
* Add monitoring and logging for distributed backend instances
* Add more collaboration features to the workspace
