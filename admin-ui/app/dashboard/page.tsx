import { Metadata } from 'next';
import DashboardAdmin from './DashboardAdmin';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Tổng quan hệ thống FastDeli',
};

export default function DashboardPage() {
  return <DashboardAdmin />;
}