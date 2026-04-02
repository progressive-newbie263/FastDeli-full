import { Metadata } from 'next';
import DriversAdmin from './DriversAdmin';

export const metadata: Metadata = {
  title: 'Quản lý tài xế - Admin',
  description: 'Quản lý tài khoản tài xế hệ thống',
};

export default function DriversPage() {
  return <DriversAdmin />;
}
