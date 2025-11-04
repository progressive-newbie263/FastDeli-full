import Sidebar from '@/components/ui/Sidebar';
import Header from '@/components/layout/Header';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export default function AdminLayout({ children, title, subtitle }: AdminLayoutProps) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex flex-col">
        <Header title={title} subtitle={subtitle} />

        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
}