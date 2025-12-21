'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CheckSquare } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export const dynamic = 'force-dynamic';
import { Button, Input } from '@/components/ui';

const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name is too long'),
    email: z.string().email('Please enter a valid email'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(100, 'Password is too long'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser } = useAuth();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setError('');
      setIsLoading(true);
      await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
      });
      router.push('/dashboard');
    } catch (err) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Registration failed';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <CheckSquare className="w-10 h-10 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">TaskFlow</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Create an account
          </h1>
          <p className="text-gray-500">Start managing your tasks today</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="Full Name"
              placeholder="John Doe"
              {...register('name')}
              {...(errors.name?.message ? { error: errors.name.message } : {})}
            />

            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              {...register('email')}
              {...(errors.email?.message ? { error: errors.email.message } : {})}
            />

            <Input
              label="Password"
              type="password"
              placeholder="At least 8 characters"
              {...register('password')}
              {...(errors.password?.message ? { error: errors.password.message } : {})}
            />

            <Input
              label="Confirm Password"
              type="password"
              placeholder="Confirm your password"
              {...register('confirmPassword')}
              {...(errors.confirmPassword?.message ? { error: errors.confirmPassword.message } : {})}
            />

            <Button
              type="submit"
              className="w-full"
              size="lg"
              isLoading={isLoading}
            >
              Create Account
            </Button>
          </form>
        </div>

        <p className="text-center mt-6 text-gray-500">
          Already have an account?{' '}
          <Link
            href="/auth/login"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
