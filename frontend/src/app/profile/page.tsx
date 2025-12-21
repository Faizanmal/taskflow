'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/layout';
import { Button, Input, Card, CardHeader, CardBody, Alert } from '@/components/ui';
import { User as UserIcon, Mail, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';

export const dynamic = 'force-dynamic';
import api from '@/lib/api';

interface ProfileFormData {
  name: string;
  email: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, updateUser, isAuthenticated } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
    },
  });

  if (!isAuthenticated) {
    router.replace('/auth/login');
    return null;
  }

  const onSubmit = async (data: ProfileFormData) => {
    try {
      setIsLoading(true);
      setMessage(null);
      const response = await api.patch('/auth/me', { name: data.name });
      updateUser(response.data.data.user);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditing(false);
    } catch {
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Profile Settings</h1>
          <p className="text-gray-500">Manage your account information</p>
        </div>

        {message && (
          <Alert
            variant={message.type === 'success' ? 'success' : 'error'}
            onClose={() => setMessage(null)}
          >
            {message.text}
          </Alert>
        )}

        <div className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
            </CardHeader>
            <CardBody>
              {!isEditing ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <UserIcon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Name</p>
                      <p className="text-base font-medium text-gray-900">{user?.name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <Mail className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="text-base font-medium text-gray-900">{user?.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <Calendar className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Member Since</p>
                      <p className="text-base font-medium text-gray-900">
                        {user?.createdAt && format(new Date(user.createdAt), 'MMMM d, yyyy')}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <Input
                    label="Name"
                    placeholder="Your name"
                    {...register('name', { required: 'Name is required' })}
                    {...(errors.name?.message ? { error: errors.name.message } : {})}
                  />

                  <Input
                    label="Email"
                    type="email"
                    disabled
                    placeholder="Your email"
                    {...register('email')}
                  />
                  <p className="text-xs text-gray-500 -mt-2">Email cannot be changed</p>

                  <div className="flex gap-3 pt-2">
                    <Button type="submit" isLoading={isLoading}>
                      Save Changes
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">Account Statistics</h2>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">0</p>
                  <p className="text-sm text-gray-600 mt-1">Tasks Created</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">0</p>
                  <p className="text-sm text-gray-600 mt-1">Tasks Completed</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">0</p>
                  <p className="text-sm text-gray-600 mt-1">Collaborations</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </main>
    </div>
  );
}
