'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CheckSquare, Mail, Lock, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { AnimatedButton, FloatingLabelInput, GradientText } from '@/components/ui';
import toast from 'react-hot-toast';

export const dynamic = 'force-dynamic';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      await login(data);
      toast.success('Welcome back! 🎉');
      router.push('/dashboard');
    } catch (err) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Invalid credentials';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-linear-to-br from-blue-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute top-20 left-20 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute bottom-20 right-20 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-6 group">
            <motion.div
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.6 }}
            >
              <CheckSquare className="w-12 h-12 text-blue-600" />
            </motion.div>
            <span className="text-3xl font-bold">
              <GradientText from="from-blue-600" to="to-purple-600">
                TaskFlow
              </GradientText>
            </span>
          </Link>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl font-bold text-gray-900 mb-2"
          >
            Welcome back! 👋
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-gray-600"
          >
            Sign in to your account to continue
          </motion.p>
        </div>

        {/* Login Form Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="relative">
              <Mail className="absolute left-4 top-8 w-5 h-5 text-gray-400 z-10" />
              <FloatingLabelInput
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                className="pl-12"
                {...register('email')}
                {...(errors.email?.message ? { error: errors.email.message } : {})}
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-8 w-5 h-5 text-gray-400 z-10" />
              <FloatingLabelInput
                label="Password"
                type="password"
                placeholder="Enter your password"
                className="pl-12"
                {...register('password')}
                {...(errors.password?.message ? { error: errors.password.message } : {})}
              />
            </div>

            <AnimatedButton
              type="submit"
              className="w-full"
              size="lg"
              disabled={isLoading}
              icon={isLoading ? undefined : <ArrowRight className="w-5 h-5" />}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </AnimatedButton>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">or</span>
            </div>
          </div>

          {/* Demo credentials */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="p-4 bg-blue-50 rounded-xl border border-blue-200"
          >
            <p className="text-xs font-semibold text-blue-900 mb-2">Demo Credentials:</p>
            <p className="text-xs text-blue-700">Email: demo@taskflow.com</p>
            <p className="text-xs text-blue-700">Password: demo123</p>
          </motion.div>
        </motion.div>

        {/* Sign up link */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-6 text-gray-600"
        >
          Don&apos;t have an account?{' '}
          <Link
            href="/auth/register"
            className="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-all"
          >
            Sign up for free
          </Link>
        </motion.p>
      </motion.div>
    </div>
  );
}
