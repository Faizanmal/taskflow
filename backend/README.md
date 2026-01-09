# TaskFlow Backend
A NestJS backend for TaskFlow with JWT authentication, Prisma/PostgreSQL data access, and Socket.io real-time updates.
## Features
- Authentication and authorization
- Task CRUD operations
- Notifications and live updates
- PostgreSQL via Prisma
## Setup
Prerequisites: Node.js 18+, PostgreSQL 14+
Run the following commands:
  npm install
  cp .env.example .env
  # update .env values
  npx prisma migrate dev --name init
  npx prisma generate
  npm run start:dev
## Scripts
- npm run start:dev - start development server
- npm run build - build production bundle
- npm run start - run production server
- npm run test - run tests
- npm run lint - lint source files
## License
This backend is part of TaskFlow and follows the repository license.
