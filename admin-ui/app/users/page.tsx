import { Metadata } from 'next';
import UsersAdmin from './UsersAdmin';

export const metadata: Metadata = {
  title: 'Quản lý người dùng - Admin',
  description: 'Quản lý người dùng hệ thống',
};

export default function UsersPage() {
  return <UsersAdmin />;
}