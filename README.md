# 🚀 TaskFlow - Collaborative Task Manager

A **production-ready, full-stack collaborative task management application** built with modern technologies. Features real-time collaboration, secure authentication, and a beautiful responsive UI.

![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Database Schema](#database-schema)
- [API Documentation](#api-documentation)
- [Socket.io Integration](#socketio-integration)
- [Setup Instructions](#setup-instructions)
- [Environment Variables](#environment-variables)
- [Testing](#testing)
- [Deployment](#deployment)
- [Trade-offs & Decisions](#trade-offs--decisions)

---

## 🎯 Overview

Taskflow is a collaborative task management application that enables teams to create, manage, and track tasks in real-time. Built as a demonstration of enterprise-grade full-stack development practices.

### Key Highlights

- **Real-time Collaboration**: Changes sync instantly across all connected users
- **Secure Authentication**: JWT-based auth with HTTP-only cookies
- **Clean Architecture**: Service/Repository pattern with clear separation of concerns
- **Type Safety**: Full TypeScript coverage on both frontend and backend
- **Optimistic Updates**: Instant UI feedback with automatic rollback on errors
- **Responsive Design**: Mobile-first approach with Tailwind CSS

---

## ✨ Features

### Authentication & Authorization
- ✅ User registration with email validation
- ✅ Secure login with bcrypt password hashing
- ✅ JWT tokens stored in HTTP-only cookies
- ✅ Protected routes with middleware guards
- ✅ Profile viewing and updating

### Task Management
- ✅ Create, read, update, delete tasks
- ✅ Task assignment to team members
- ✅ Status tracking (To Do, In Progress, In Review, Completed)
- ✅ Priority levels (Low, Medium, High, Urgent)
- ✅ Due date management with overdue detection
- ✅ Authorization: Only creators can modify their tasks

### Real-time Collaboration
- ✅ Live task updates via Socket.io
- ✅ Real-time notifications when assigned to tasks
- ✅ Persistent notifications stored in database
- ✅ Connection status indicator

### Messaging
- ✅ Direct messaging between users
- ✅ Real-time chat with Socket.io
- ✅ Conversation history
- ✅ Unread message indicators

### Dashboard & Data Exploration
- ✅ Statistics overview (assigned, completed, overdue tasks)
- ✅ Filtering by status and priority
- ✅ Sorting by due date, creation date, priority
- ✅ View modes: All tasks, Assigned to me, Created by me, Overdue

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **Next.js 16** | React framework with App Router |
| **TypeScript** | Type safety and developer experience |
| **Tailwind CSS** | Utility-first styling |
| **React Query** | Server state management & caching |
| **React Hook Form** | Form handling with validation |
| **Zod** | Schema validation |
| **Socket.io Client** | Real-time communication |
| **Lucide React** | Icon library |

### Backend
| Technology | Purpose |
|------------|---------|
| **NestJS** | Node.js framework with TypeScript |
| **Prisma** | Type-safe ORM for PostgreSQL |
| **PostgreSQL** | Relational database |
| **Socket.io** | WebSocket server |
| **Passport JWT** | Authentication strategy |
| **bcrypt** | Password hashing |
| **class-validator** | DTO validation |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Next.js   │  │ React Query │  │   Socket.io Client  │  │
│  │   Pages     │  │   (Cache)   │  │   (Real-time)       │  │
│  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘  │
└─────────┼────────────────┼─────────────────────┼────────────┘
          │                │                     │
          ▼                ▼                     ▼
┌─────────────────────────────────────────────────────────────┐
│                         Backend                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                    NestJS Server                        ││
│  │  ┌───────────────┐  ┌────────────┐  ┌────────────────┐ ││
│  │  │  Controllers  │  │  Services  │  │  Repositories  │ ││
│  │  │  (REST API)   │──│  (Logic)   │──│  (Data Access) │ ││
│  │  └───────────────┘  └────────────┘  └───────┬────────┘ ││
│  │  ┌───────────────┐                          │          ││
│  │  │ Events Gateway│  Socket.io Server        │          ││
│  │  │ (WebSocket)   │──────────────────────────┘          ││
│  │  └───────────────┘                                     ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     PostgreSQL Database                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │    Users    │  │    Tasks    │  │    Notifications    │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Backend Structure

```
backend/
├── src/
│   ├── auth/                 # Authentication module
│   │   ├── controllers/      # HTTP endpoints
│   │   ├── services/         # Business logic
│   │   ├── repositories/     # Data access
│   │   ├── strategies/       # JWT strategy
│   │   ├── guards/           # Auth guards
│   │   ├── decorators/       # Custom decorators
│   │   └── dto/              # Data transfer objects
│   ├── tasks/                # Task management module
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── repositories/
│   │   └── dto/
│   ├── notifications/        # Notification module
│   │   ├── controllers/
│   │   ├── services/
│   │   └── repositories/
│   ├── events/               # Socket.io module
│   │   └── events.gateway.ts # WebSocket handler
│   ├── prisma/               # Database module
│   └── common/               # Shared utilities
├── prisma/
│   └── schema.prisma         # Database schema
└── test/                     # Unit tests
```

---

## 🗄️ Database Schema

### Why PostgreSQL?

1. **Relational Data Integrity**: Strong relationships between users, tasks, and notifications
2. **ACID Compliance**: Critical for task state consistency
3. **Complex Queries**: Efficient filtering, sorting, and aggregations
4. **Prisma Support**: Excellent type-safe ORM integration
5. **Production Scalability**: Handles high concurrent connections

### Entity Relationship Diagram

```
┌──────────────────┐     ┌──────────────────────────┐     ┌──────────────────────┐
│      User        │     │          Task            │     │    Notification      │
├──────────────────┤     ├──────────────────────────┤     ├──────────────────────┤
│ id: UUID (PK)    │     │ id: UUID (PK)            │     │ id: UUID (PK)        │
│ email: String    │     │ title: String            │     │ type: Enum           │
│ password: String │     │ description: String?     │     │ message: String      │
│ name: String     │     │ status: Enum             │     │ read: Boolean        │
│ avatar: String?  │     │ priority: Enum           │     │ data: JSON?          │
│ createdAt: Date  │────<│ creatorId: UUID (FK)     │>────│ userId: UUID (FK)    │
│ updatedAt: Date  │────<│ assigneeId: UUID? (FK)   │     │ createdAt: Date      │
└──────────────────┘     │ dueDate: Date?           │     └──────────────────────┘
                         │ createdAt: Date          │
                         │ updatedAt: Date          │
                         └──────────────────────────┘
```

---

## 📡 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/logout` | Logout user |
| GET | `/api/auth/me` | Get current user profile |
| PATCH | `/api/auth/me` | Update user profile |
| POST | `/api/auth/change-password` | Change password |
| GET | `/api/auth/users` | Get all users (for assignment) |

### Task Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | Get all tasks (with filters) |
| GET | `/api/tasks/stats` | Get dashboard statistics |
| GET | `/api/tasks/:id` | Get single task |
| POST | `/api/tasks` | Create new task |
| PATCH | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task |

#### Query Parameters for GET /api/tasks

| Parameter | Type | Description |
|-----------|------|-------------|
| status | string | Filter by status (TODO, IN_PROGRESS, IN_REVIEW, COMPLETED) |
| priority | string | Filter by priority (LOW, MEDIUM, HIGH, URGENT) |
| sortBy | string | Sort field (dueDate, createdAt, priority, status) |
| sortOrder | string | Sort direction (asc, desc) |
| view | string | View filter (all, assigned, created, overdue) |

### Notification Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications` | Get all notifications |
| GET | `/api/notifications/unread-count` | Get unread count |
| PATCH | `/api/notifications/:id/read` | Mark as read |
| PATCH | `/api/notifications/read-all` | Mark all as read |

### Messaging Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/messages/conversations` | Get all conversations |
| GET | `/api/messages/:userId` | Get messages with a specific user |
| POST | `/api/messages` | Send a direct message |
| POST | `/api/messages/:userId/read` | Mark messages from a user as read |
| GET | `/api/messages/unread/count` | Get unread message count |

### API Response Format

```typescript
// Success Response
{
  "success": true,
  "message": "Optional success message",
  "data": { /* Response data */ }
}

// Error Response
{
  "success": false,
  "statusCode": 400,
  "message": "Error message",
  "errors": ["Validation errors array"],
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/api/endpoint"
}
```

---

## 🔌 Socket.io Integration

### Connection

Clients connect to the WebSocket server at `/events` namespace:

```typescript
const socket = io('http://localhost:3001/events', {
  auth: { token: 'jwt-token' },
  transports: ['websocket', 'polling'],
});
```

### Events

| Event | Direction | Payload | Description |
|-------|-----------|---------|-------------|
| `task:created` | Server → Client | Task object | New task created |
| `task:updated` | Server → Client | Task object | Task was updated |
| `task:deleted` | Server → Client | `{ id: string }` | Task was deleted |
| `notification` | Server → Client | Notification object | New notification |
| `message:new` | Server → Client | Message object | New direct message |
| `message:read` | Server → Client | `{ senderId: string }` | Messages marked as read |
| `ping` | Client → Server | - | Keep-alive ping |
| `pong` | Server → Client | - | Keep-alive response |

### User Rooms

Each authenticated user joins a private room (`user:{userId}`) for targeted notifications.

---

## 🚀 Setup Instructions

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### 1. Clone the Repository

```bash
git clone <repository-url>
cd taskflow
```

### 2. Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# Run database migrations
npx prisma migrate dev --name init

# Generate Prisma client
npx prisma generate

# Start development server
npm run start:dev
```

### 3. Frontend Setup

```bash
# Navigate to frontend (in new terminal)
cd frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

### 4. Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/api
- WebSocket: http://localhost:3001/events

---

## 🔐 Environment Variables

### Backend (.env)

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/taskmanager"

# JWT
JWT_SECRET="your-super-secret-key"
JWT_EXPIRES_IN="7d"

# Server
PORT=3001
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL="http://localhost:3000"
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_WS_URL=http://localhost:3001
```

---

## 🧪 Testing

### Running Tests

```bash
cd backend

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:cov
```

### Test Coverage

The backend includes unit tests for:

1. **AuthService** - Registration, login, validation
2. **TaskService** - CRUD operations, authorization
3. **NotificationService** - Notification creation and delivery

---

## 🌐 Deployment

### Frontend (Vercel)

1. Push to GitHub
2. Connect repository to Vercel
3. Set environment variables:
   - `NEXT_PUBLIC_API_URL`
   - `NEXT_PUBLIC_WS_URL`
4. Deploy

### Backend (Railway/Render)

1. Create PostgreSQL database
2. Set environment variables
3. Deploy from GitHub
4. Run migrations: `npx prisma migrate deploy`

### Production Checklist

- [ ] Set strong JWT_SECRET
- [ ] Enable HTTPS
- [ ] Configure CORS for production domains
- [ ] Set NODE_ENV=production
- [ ] Enable database connection pooling
- [ ] Set up monitoring and logging

---

## ⚖️ Trade-offs & Decisions

### Database: PostgreSQL over MongoDB

**Chosen**: PostgreSQL with Prisma
- ✅ Strong data relationships (user ↔ tasks ↔ notifications)
- ✅ ACID compliance for task state consistency
- ✅ Better support for complex queries and aggregations
- ✅ Type-safe queries with Prisma
- ❌ Less flexible schema (mitigated by Prisma migrations)

### Framework: NestJS over Express

**Chosen**: NestJS
- ✅ Built-in module system and dependency injection
- ✅ First-class TypeScript support
- ✅ Integrated WebSocket support
- ✅ Decorators for clean code organization
- ❌ Steeper learning curve (acceptable for maintainability)

### State Management: React Query over Redux

**Chosen**: React Query
- ✅ Built-in caching and stale-while-revalidate
- ✅ Automatic background refetching
- ✅ Easy optimistic updates
- ✅ Less boilerplate than Redux
- ❌ Only for server state (sufficient for this app)

### Authentication: JWT + Cookies over Sessions

**Chosen**: JWT with HTTP-only cookies
- ✅ Stateless authentication (scalable)
- ✅ HTTP-only cookies prevent XSS attacks
- ✅ Works with multiple frontends
- ❌ Token refresh complexity (mitigated with 7-day expiry)

### Assumptions

1. Single tenant application (no organization/team isolation)
2. Tasks can only have one assignee
3. Only task creators can edit/delete their tasks
4. Notifications are not paginated (last 50 shown)

---

## � Repository

- **GitHub**: [your-username/taskflow](https://github.com/your-username/taskflow)

---

## �📝 License

MIT License - feel free to use this project as a reference or starting point.

---

## 👨‍💻 Author

Built as part of a full-stack engineering assessment demonstrating:
- Clean architecture principles
- Real-time collaboration
- Type-safe development
- Production-ready code quality
