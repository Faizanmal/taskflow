# TaskFlow
A full-stack collaborative task management app with a Next.js frontend and a NestJS backend.
TaskFlow provides task management, authentication, notifications, and real-time updates using Socket.io.
## Getting Started
### Backend
Run the following commands from the backend folder:
  cd backend
  npm install
  cp .env.example .env
  # update .env values
  npx prisma migrate dev --name init
  npx prisma generate
  npm run start:dev
### Frontend
Run the following commands from the frontend folder:
  cd frontend
  npm install
  cp .env.example .env.local
  # update .env.local values
  npm run dev
## Local URLs
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/api
- WebSocket: http://localhost:3001/events
## Project Layout
- backend/ - NestJS API and real-time server
- frontend/ - Next.js client application
## License
This project is part of TaskFlow and follows the repository license.
