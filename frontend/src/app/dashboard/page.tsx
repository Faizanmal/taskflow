'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Header, Footer } from '@/components/layout';
import { DashboardStats } from '@/components/dashboard';
import { TaskList } from '@/components/tasks';

export const dynamic = 'force-dynamic';
import { PageTransition, GradientText, GlassCard, AnimatedBadge } from '@/components/ui';

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-purple-50">
        <GlassCard className="p-8 text-center">
          <motion.div
            animate={{
              rotate: 360,
              scale: [1, 1.2, 1],
            }}
            transition={{
              rotate: { duration: 1, repeat: Infinity, ease: 'linear' },
              scale: { duration: 0.5, repeat: Infinity },
            }}
            className="relative mx-auto mb-4"
          >
            <div className="absolute inset-0 rounded-full bg-linear-to-r from-blue-600 to-purple-600 blur-xl opacity-50" />
            <div className="relative rounded-full h-16 w-16 border-4 border-transparent border-t-blue-600 border-r-purple-600" />
          </motion.div>
          <p className="text-lg text-gray-600">Loading your dashboard...</p>
        </GlassCard>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-blue-50/30 to-purple-50/30 flex flex-col">
      <Header />
      <PageTransition>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-10"
          >
            <GlassCard className="p-8 text-center">
              <div className="flex items-center justify-center gap-3 mb-3">
                <motion.div
                  animate={{
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  <Sparkles className="w-8 h-8 text-yellow-500" />
                </motion.div>
                <h1 className="text-4xl font-bold">
                  <GradientText from="from-blue-600" to="to-purple-600">
                    Welcome back, {user?.name?.split(' ')[0]}!
                  </GradientText>
                </h1>
              </div>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-lg text-gray-600"
              >
                Here&apos;s an overview of your tasks and productivity.
              </motion.p>
            </GlassCard>
          </motion.div>

          {/* Stats Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="mb-12"
          >
            <DashboardStats />
          </motion.div>

          {/* Tasks Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-gray-900">
                Your Tasks
              </h2>
              <AnimatedBadge variant="info" pulse>
                Live Updates
              </AnimatedBadge>
            </div>
            <TaskList />
          </motion.div>
        </main>
      </PageTransition>
      <Footer />
    </div>
  );
}
