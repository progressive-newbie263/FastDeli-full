'use client';

import { ReactNode } from 'react';
import { SupplierAuthProvider } from './contexts/SupplierAuthContext';

export default function SupplierRootLayout({ children }: { children: ReactNode }) {
  return <SupplierAuthProvider>{children}</SupplierAuthProvider>;
}
