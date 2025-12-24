'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut, CheckSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import NotificationDropdown from './NotificationDropdown';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { IconButton } from '@/components/ui';
import { cn } from '@/lib/utils';

export default function Header() {
  const { user, logout } = useAuth();
  const { isConnected } = useSocket();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, type: 'spring' }}
      className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30 shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <motion.div
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-blue-500 rounded-lg blur opacity-50 group-hover:opacity-75 transition-opacity" />
              <CheckSquare className="w-8 h-8 text-blue-600 relative z-10" />
            </motion.div>
            <motion.span
              className="text-2xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
              whileHover={{ scale: 1.05 }}
            >
              TaskFlow
            </motion.span>
          </Link>

          <div className="flex items-center gap-4">
            {/* Connection status indicator */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
            >
              <motion.span
                animate={{
                  scale: isConnected ? [1, 1.2, 1] : 1,
                  opacity: isConnected ? [1, 0.5, 1] : 0.5,
                }}
                transition={{
                  repeat: isConnected ? Infinity : 0,
                  duration: 2,
                }}
                className={cn(
                  'w-2 h-2 rounded-full',
                  isConnected ? 'bg-green-500' : 'bg-red-500'
                )}
              />
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </motion.div>

            {/* Theme toggle */}
            <ThemeToggle />

            <NotificationDropdown />

            {/* User menu */}
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-gray-700">
              <Link
                href="/profile"
                className="hidden sm:block group"
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="text-right"
                >
                  <p className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                    {user?.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                </motion.div>
              </Link>

              {/* User avatar */}
              <Link href="/profile">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold shadow-lg cursor-pointer"
                >
                  {user?.name?.charAt(0).toUpperCase()}
                </motion.div>
              </Link>

              <IconButton
                icon={<LogOut className="w-5 h-5" />}
                onClick={handleLogout}
                variant="danger"
                tooltip="Logout"
              />
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
