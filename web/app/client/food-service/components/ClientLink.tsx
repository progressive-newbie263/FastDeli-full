"use client";
import Link from "next/link";

const basePath = "/client/food-service";

export default function ClientLink({
  href,
  children,
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link href={`${basePath}${href}`} className={className}>
      {children}
    </Link>
  );
}
