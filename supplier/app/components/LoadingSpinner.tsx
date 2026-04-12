'use client';

import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullScreen?: boolean;
}

export default function LoadingSpinner({ size = 'md', text, fullScreen = false }: LoadingSpinnerProps) {
  const getSizeClass = () => {
    const sizes = {
      sm: 'h-6 w-6',
      md: 'h-12 w-12',
      lg: 'h-16 w-16',
    };
    return sizes[size];
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-4">
      <div
        className={`${getSizeClass()} animate-spin rounded-full border-b-2 border-orange-600`}
      ></div>
      {text && <p className="text-gray-600 text-sm">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
}
