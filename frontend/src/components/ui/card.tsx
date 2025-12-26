'use client';

import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

const Card = ({ children, className = '', hover = false }: CardProps) => {
  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 ${
        hover ? 'hover:shadow-md transition-shadow' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

export const CardHeader = ({ children, className = '' }: CardHeaderProps) => {
  return <div className={`px-6 py-4 border-b border-gray-200 ${className}`}>{children}</div>;
};

interface CardBodyProps {
  children: ReactNode;
  className?: string;
}

export const CardBody = ({ children, className = '' }: CardBodyProps) => {
  return <div className={`px-6 py-4 ${className}`}>{children}</div>;
};

interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

export const CardFooter = ({ children, className = '' }: CardFooterProps) => {
  return <div className={`px-6 py-4 border-t border-gray-200 ${className}`}>{children}</div>;
};

export const CardContent = CardBody;

interface CardTitleProps {
  children: ReactNode;
  className?: string;
}

export const CardTitle = ({ children, className = '' }: CardTitleProps) => {
  return <h3 className={`text-lg font-semibold text-gray-900 ${className}`}>{children}</h3>;
};

interface CardDescriptionProps {
  children: ReactNode;
  className?: string;
}

export const CardDescription = ({ children, className = '' }: CardDescriptionProps) => {
  return <p className={`text-sm text-gray-600 ${className}`}>{children}</p>;
};

export { Card };
