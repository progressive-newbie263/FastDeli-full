import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: 'new' | 'processing' | 'completed' | 'cancelled' | 'pending' | 'approved' | 'rejected';
  children: React.ReactNode;
}

const statusStyles = {
  new: 'bg-teal-50 text-teal-700 border-teal-200',
  processing: 'bg-orange-50 text-orange-700 border-orange-200',
  completed: 'bg-green-50 text-green-700 border-green-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
  pending: 'bg-purple-50 text-purple-700 border-purple-200',
  approved: 'bg-green-50 text-green-700 border-green-200',
  rejected: 'bg-red-50 text-red-700 border-red-200',
};

export default function StatusBadge({ status, children }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border',
        statusStyles[status]
      )}
    >
      {children}
    </span>
  );
}