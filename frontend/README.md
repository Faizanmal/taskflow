# TaskFlow Frontend

A modern Next.js frontend for the TaskFlow collaborative task management application, featuring real-time updates, responsive design, and intuitive user experience.

## 🚀 Features

- **Real-time Collaboration**: Live task updates via WebSocket
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Authentication**: Secure login and registration
- **Task Management**: Create, edit, assign, and track tasks
- **Dashboard**: Statistics and filtering capabilities
- **Notifications**: Real-time notification system

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Query
- **Forms**: React Hook Form + Zod
- **UI Components**: Custom components with Lucide icons
- **Real-time**: Socket.io Client
- **Authentication**: JWT with HTTP-only cookies

## 📁 Project Structure

```
src/
├── app/                  # Next.js App Router pages
│   ├── auth/            # Authentication pages
│   ├── dashboard/       # Dashboard pages
│   ├── profile/         # Profile pages
│   └── api/             # API routes (if any)
├── components/          # Reusable UI components
│   ├── dashboard/       # Dashboard-specific components
│   ├── layout/          # Layout components
│   ├── tasks/           # Task-related components
│   └── ui/              # Base UI components
├── constants/           # Application constants
├── contexts/            # React contexts (Auth, Socket)
├── hooks/               # Custom React hooks
└── lib/                 # Utilities and configurations
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Backend server running (see backend README)

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with API and WebSocket URLs
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:3000`

## 📜 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## 🔧 Environment Variables

Create a `.env.local` file in the root of the frontend directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_WS_URL=http://localhost:3001
```

## 🎨 Styling

This project uses Tailwind CSS for styling with a custom design system. Key styling files:

- `app/globals.css` - Global styles and Tailwind imports
- `components/ui/` - Reusable UI components
- `constants/` - Color schemes and variants

## 🔐 Authentication

The frontend handles authentication through:

- JWT tokens stored in HTTP-only cookies
- Automatic token refresh
- Protected routes with redirects
- User context for global state

## 🔌 Real-time Features

- **WebSocket Connection**: Connects to backend Socket.io server
- **Task Updates**: Live synchronization of task changes
- **Notifications**: Real-time notification delivery
- **Connection Status**: Visual indicators for connection state

## 📱 Responsive Design

- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Touch-friendly interactions
- Adaptive layouts

## 🤝 Contributing

1. Follow the existing component patterns
2. Use TypeScript for all new code
3. Ensure responsive design
4. Test on multiple screen sizes
5. Update types and interfaces as needed

## 📄 License

This project is part of TaskFlow and follows the same license terms.
