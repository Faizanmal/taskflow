'use client';

import { motion } from 'framer-motion';

export default function LoadingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="flex flex-col items-center gap-6">
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
          <div className="relative rounded-full h-20 w-20 border-4 border-transparent border-t-blue-600 border-r-purple-600 border-b-pink-600" />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center"
        >
          <h2 className="text-xl font-bold bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Loading...
          </h2>
          <p className="text-sm text-gray-500 mt-2">Please wait while we prepare everything</p>
        </motion.div>
      </div>
    </div>
  );
}
