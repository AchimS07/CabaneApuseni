import * as React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
}

export function Card({ children, className = '', as: Tag = 'div' }: CardProps) {
  return (
    <Tag className={`rounded-xl border bg-white p-6 shadow-sm ${className}`}>
      {children}
    </Tag>
  );
}
