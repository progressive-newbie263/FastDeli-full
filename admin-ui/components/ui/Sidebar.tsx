'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface NavItem {
  href: string;
  label: string;
  icon: string;
  badge?: number;
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/orders', label: 'Quản lý đơn hàng', icon: '🛒', badge: 12 },
  { href: '/restaurants/pending', label: 'Yêu cầu nhà hàng', icon: '🏪', badge: 5 },
  { href: '/restaurants/approved', label: 'Nhà hàng đã duyệt', icon: '✅' },
  { href: '/users', label: 'Quản lý người dùng', icon: '👥' },
  { href: '/analytics', label: 'Báo cáo & Thống kê', icon: '📈' },
  { href: '/settings', label: 'Cài đặt hệ thống', icon: '⚙️' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="fixed left-0 top-0 h-full w-72 sidebar-gradient text-white shadow-xl z-30">
      {/* Header */}
      <div className="p-6 border-b border-white/10 bg-black/10">
        <h2 className="text-2xl font-bold text-primary-500 mb-1">FoodDeli Admin</h2>
        <p className="text-white/80 text-sm">Hệ thống quản lý</p>
      </div>

      {/* Navigation */}
      <nav className="mt-6">
        {navItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href.includes('/restaurants') && pathname.startsWith('/restaurants'));
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center px-6 py-4 text-white/90 hover:bg-white/10 hover:text-white transition-all duration-200 border-l-4 border-transparent',
                isActive && 'bg-white/20 border-l-primary-500 text-white font-medium'
              )}
            >
              <span className="text-lg mr-3">{item.icon}</span>
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}