'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.replace('/dashboard');
      } else {
        router.replace('/auth/login');
      }
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 via-purple-50 to-pink-50">
      <motion.div
        animate={{
          rotate: 360,
          scale: [1, 1.2, 1],
        }}
        transition={{
          rotate: { duration: 1, repeat: Infinity, ease: 'linear' },
          scale: { duration: 0.5, repeat: Infinity },
        }}
        className="relative"
      >
        <div className="absolute inset-0 rounded-full bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 blur-2xl opacity-50" />
        <div className="relative rounded-full h-16 w-16 border-4 border-transparent border-t-blue-600 border-r-purple-600 border-b-pink-600" />
      </motion.div>
    </div>
  );
}
