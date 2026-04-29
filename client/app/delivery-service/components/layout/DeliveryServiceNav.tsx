"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDeliveryAuth } from "../../context/DeliveryAuthContext";
import { History, Navigation, Package } from "lucide-react";

const navItems = [
  { href: "/delivery-service", label: "Đặt hàng", icon: Package },
  { href: "/delivery-service/history", label: "Lịch sử", icon: History },
  { href: "/delivery-service/tracking", label: "Theo dõi", icon: Navigation },
];

export default function DeliveryServiceNav() {
  const pathname = usePathname();
  const { isAuthenticated, loading } = useDeliveryAuth();

  if (loading || !isAuthenticated) {
    return null;
  }

  return (
    <nav className="flex w-full max-w-md justify-between">
      <div className="flex w-full justify-between">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === "/delivery-service"
              ? pathname === href
              : pathname === href || pathname.startsWith(`${href}/`);

          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-1 flex-col items-center justify-center gap-0.5 rounded-xl transition-all ${
                isActive
                  ? "text-emerald-600"
                  : "text-slate-400 hover:text-emerald-500"
              }`}
            >
              <div
                className={`flex items-center justify-center rounded-xl p-2 transition-all ${
                  isActive ? "bg-emerald-100 shadow-sm" : "bg-transparent"
                }`}
              >
                <Icon size={22} strokeWidth={2.2} />
              </div>

              <span
                className={`text-[12px] font-medium leading-none tracking-normal ${
                  isActive ? "text-emerald-600" : ""
                }`}
              >
                {label}
              </span>

              <div
                className={`mt-0.5 h-1 w-5 rounded-full transition-all ${
                  isActive ? "bg-emerald-500" : "bg-transparent"
                }`}
              />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}