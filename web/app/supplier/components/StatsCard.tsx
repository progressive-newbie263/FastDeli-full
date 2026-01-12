'use client';

import React from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  iconBgColor?: string;
  trend?: number;
  loading?: boolean;
}

export default function StatsCard({
  title,
  value,
  subtitle,
  icon,
  iconBgColor = 'bg-orange-100',
  trend,
  loading = false,
}: StatsCardProps) {
  const getTrendColor = (trend: number) => {
    if (trend > 0) return 'text-green-600';
    if (trend < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return '↗';
    if (trend < 0) return '↘';
    return '→';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 ${iconBgColor} rounded-lg`}>
            <div className="w-6 h-6 bg-gray-300 rounded"></div>
          </div>
        </div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
        <div className="h-8 bg-gray-300 rounded w-3/4"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 ${iconBgColor} rounded-lg`}>{icon}</div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-sm font-medium ${getTrendColor(trend)}`}>
            <span>{getTrendIcon(trend)}</span>
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>

      <h3 className="text-gray-600 text-sm mb-1 font-medium">{title}</h3>
      <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>

      {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
    </div>
  );
}
