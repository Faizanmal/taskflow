'use client';

import Link from 'next/link';
import { Home, ArrowLeft } from 'lucide-react';
import { GlassCard, GradientText } from '@/components/ui';

export const dynamic = 'force-dynamic';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 via-purple-50 to-pink-50 px-4">
      <GlassCard className="max-w-md w-full text-center">
        <GradientText className="text-9xl font-bold mb-4" from="from-red-600" to="to-orange-600">
          404
        </GradientText>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Page Not Found</h2>
        <p className="text-gray-600 mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-linear-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-500/30 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <Home className="w-5 h-5" />
            Go Home
          </Link>
          <button
            onClick={() => {
              if (typeof window !== 'undefined' && window.history) {
                window.history.back();
              }
            }}
            className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 bg-transparent text-gray-700 rounded-lg hover:bg-gray-50 transition-all focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Go Back
          </button>
        </div>
      </GlassCard>
    </div>
  );
}
