<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

# TaskFlow Backend

A robust NestJS backend for the TaskFlow collaborative task management application, featuring real-time WebSocket communication, secure JWT authentication, and PostgreSQL database integration.

## 🚀 Features

- **Authentication & Authorization**: JWT-based auth with HTTP-only cookies
- **Task Management**: Full CRUD operations with role-based access
- **Real-time Notifications**: WebSocket integration for live updates
- **Database**: PostgreSQL with Prisma ORM
- **Validation**: Class-validator DTOs
- **Testing**: Jest unit tests

## 🛠️ Tech Stack

- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: Passport JWT
- **WebSocket**: Socket.io
- **Validation**: class-validator
- **Testing**: Jest

## 📁 Project Structure

```
src/
├── auth/                 # Authentication module
│   ├── controllers/      # HTTP endpoints
│   ├── services/         # Business logic
│   ├── repositories/     # Data access
│   ├── strategies/       # JWT strategy
│   ├── guards/           # Auth guards
│   ├── decorators/       # Custom decorators
│   └── dto/              # Data transfer objects
├── tasks/                # Task management module
├── notifications/        # Notification system
├── events/               # WebSocket events
├── prisma/               # Database module
└── common/               # Shared utilities
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your database URL and JWT secret
   ```

3. Run database migrations:
   ```bash
   npx prisma migrate dev --name init
   ```

4. Generate Prisma client:
   ```bash
   npx prisma generate
   ```

5. Start the development server:
   ```bash
   npm run start:dev
   ```

The API will be available at `http://localhost:3001`

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:cov
```

## 📡 API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/me` - Get current user

### Tasks
- `GET /tasks` - Get all tasks
- `POST /tasks` - Create new task
- `PATCH /tasks/:id` - Update task
- `DELETE /tasks/:id` - Delete task

### Notifications
- `GET /notifications` - Get user notifications
- `PATCH /notifications/:id/read` - Mark notification as read

## 🔌 WebSocket Events

- `task:created` - New task created
- `task:updated` - Task updated
- `task:deleted` - Task deleted
- `notification` - New notification

## 📜 Scripts

- `npm run start` - Start production server
- `npm run start:dev` - Start development server with hot reload
- `npm run build` - Build the application
- `npm run test` - Run tests
- `npm run lint` - Run ESLint

## 🤝 Contributing

1. Follow the existing code style
2. Write tests for new features
3. Update documentation as needed
4. Ensure all tests pass before submitting PR

## 📄 License

This project is part of TaskFlow and follows the same license terms.
