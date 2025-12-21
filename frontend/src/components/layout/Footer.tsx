'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Github, Heart, CheckSquare } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-linear-to-r from-gray-50 to-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Logo and copyright */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <CheckSquare className="w-6 h-6 text-blue-600" />
            <div className="text-center md:text-left">
              <p className="text-sm font-semibold text-gray-900">TaskFlow</p>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                Made with <Heart className="w-3 h-3 text-red-500 fill-red-500" /> © {currentYear}
              </p>
            </div>
          </motion.div>
          
          {/* Navigation links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex gap-6"
          >
            <Link
              href="/dashboard"
              className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/profile"
              className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
            >
              Profile
            </Link>
            <motion.a
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Github className="w-4 h-4" />
              GitHub
            </motion.a>
          </motion.div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
