import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  trend?: string;
  trendType?: 'up' | 'down' | 'neutral';
  icon?: string;
  color?: 'green' | 'blue' | 'purple' | 'orange';
}

const colorStyles = {
  green: 'border-l-green-500 bg-green-50 dark:bg-green-900/20 dark:border-green-400',
  blue: 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400',
  purple: 'border-l-purple-500 bg-purple-50 dark:bg-purple-900/20 dark:border-purple-400',
  orange: 'border-l-orange-500 bg-orange-50 dark:bg-orange-900/20 dark:border-orange-400',
};

const trendStyles = {
  up: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
  down: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
  neutral: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300',
};

export default function StatsCard({
  title,
  value,
  trend,
  trendType = 'neutral',
  icon,
  color = 'blue'
}: StatsCardProps) {
  return (
    <div className={cn(
      'bg-white dark:bg-gray-800 p-6 rounded-xl border-l-4 card-shadow hover-lift relative overflow-hidden',
      colorStyles[color]
    )}>
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/20 to-white/5 dark:from-gray-700/20 dark:to-gray-700/5 rounded-full transform translate-x-8 -translate-y-8" />
      
      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</h3>
          {icon && <span className="text-2xl">{icon}</span>}
        </div>
        
        <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          {value}
        </div>
        
        {trend && (
          <div className={cn(
            'inline-flex items-center px-2 py-1 rounded-md text-xs font-medium',
            trendStyles[trendType]
          )}>
            {trendType === 'up' && '↗'}
            {trendType === 'down' && '↘'}
            {trend}
          </div>
        )}
      </div>
    </div>
  );
}