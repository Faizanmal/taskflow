'use client';

import { XCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { ReactNode } from 'react';

interface AlertProps {
  children: ReactNode;
  variant?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  onClose?: () => void;
}

const Alert = ({ children, variant = 'info', title, onClose }: AlertProps) => {
  const variants = {
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      icon: <Info className="w-5 h-5 text-blue-600" />,
    },
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      icon: <CheckCircle className="w-5 h-5 text-green-600" />,
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-800',
      icon: <AlertTriangle className="w-5 h-5 text-yellow-600" />,
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      icon: <XCircle className="w-5 h-5 text-red-600" />,
    },
  };

  const config = variants[variant];

  return (
    <div className={`rounded-lg border p-4 ${config.bg} ${config.border}`}>
      <div className="flex items-start gap-3">
        <div className="shrink-0">{config.icon}</div>
        <div className="flex-1">
          {title && <h4 className={`font-medium mb-1 ${config.text}`}>{title}</h4>}
          <div className={`text-sm ${config.text}`}>{children}</div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className={`shrink-0 ${config.text} hover:opacity-70`}
          >
            <XCircle className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export { Alert };
export const AlertDescription = ({ children }: { children: ReactNode }) => <div>{children}</div>;
export const AlertTitle = ({ children }: { children: ReactNode }) => <div className="font-medium">{children}</div>;
