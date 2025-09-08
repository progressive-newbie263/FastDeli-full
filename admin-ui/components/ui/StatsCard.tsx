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
  green: 'border-l-green-500 bg-green-50',
  blue: 'border-l-blue-500 bg-blue-50',
  purple: 'border-l-purple-500 bg-purple-50',
  orange: 'border-l-orange-500 bg-orange-50',
};

const trendStyles = {
  up: 'bg-green-100 text-green-800',
  down: 'bg-red-100 text-red-800',
  neutral: 'bg-gray-100 text-gray-800',
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
      'bg-white p-6 rounded-xl border-l-4 card-shadow hover-lift relative overflow-hidden',
      colorStyles[color]
    )}>
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/20 to-white/5 rounded-full transform translate-x-8 -translate-y-8" />
      
      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-600">{title}</h3>
          {icon && <span className="text-2xl">{icon}</span>}
        </div>
        
        <div className="text-3xl font-bold text-gray-900 mb-2">
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