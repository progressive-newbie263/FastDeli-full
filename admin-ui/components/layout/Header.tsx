interface HeaderProps {
  title: string;
  subtitle: string;
}

// tiêu đề + phụ đề mỗi trang / route.
export default function Header({ title, subtitle }: HeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200 px-8 py-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>

      <p className="text-gray-600">{subtitle}</p>
    </div>
  );
}