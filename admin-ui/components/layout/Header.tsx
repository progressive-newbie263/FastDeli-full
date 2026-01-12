interface HeaderProps {
  title: string;
  subtitle: string;
}

// tiêu đề + phụ đề mỗi trang / route.
export default function Header({ title, subtitle }: HeaderProps) {
  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-8 py-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">{title}</h1>

      <p className="text-gray-600 dark:text-gray-400">{subtitle}</p>
    </div>
  );
}