'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Bell, Check, CheckCheck, Inbox } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications, useMarkAsRead, useMarkAllAsRead } from '@/hooks/useNotifications';
import { cn } from '@/lib/utils';

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: notifications = [] } = useNotifications();
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAsRead = async (id: string) => {
    await markAsRead.mutateAsync(id);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead.mutateAsync();
  };

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Bell className="w-5 h-5" />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-linear-to-r from-red-500 to-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 z-20 max-h-128 overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-linear-to-r from-blue-50 to-purple-50">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-gray-900">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 bg-blue-500 text-white text-xs font-semibold rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleMarkAllAsRead}
                    className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <CheckCheck className="w-4 h-4" />
                    Mark all read
                  </motion.button>
                )}
              </div>

              {/* Notifications list */}
              <div className="overflow-y-auto flex-1">
                {notifications.length > 0 ? (
                  notifications.map((notification, index) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={cn(
                        'px-5 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors relative',
                        !notification.read && 'bg-blue-50/50'
                      )}
                    >
                      {!notification.read && (
                        <div className="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full" />
                      )}
                      
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 leading-relaxed">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                            {format(new Date(notification.createdAt), 'MMM d, h:mm a')}
                          </p>
                        </div>
                        
                        {!notification.read && (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-colors shrink-0"
                            title="Mark as read"
                          >
                            <Check className="w-4 h-4" />
                          </motion.button>
                        )}
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-16 text-gray-500"
                  >
                    <Inbox className="w-16 h-16 mb-4 text-gray-300" />
                    <p className="text-sm font-medium text-gray-600">No notifications yet</p>
                    <p className="text-xs text-gray-400 mt-1">We&apos;ll notify you when something arrives</p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
