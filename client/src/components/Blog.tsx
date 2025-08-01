'use client';

import Image from 'next/image';
import Link from 'next/link';

interface BlogProps {
  image: string;
  title: string;
  description: string;
  href: string;
}

export default function Blog({ image, title, description, href }: BlogProps) {
  return (
    <div className="border p-4 rounded-lg shadow hover:shadow-lg transition md:max-w-[350px]">
      <Link href={href}>
        <Image src={image} alt={title} className="w-full h-48 object-cover rounded-lg mb-4" width={300} height={300} />

        <h2 className="text-xl font-bold mb-2">{title}</h2>
        
        <p className="text-gray-600 line-clamp-3">{description}</p>
      </Link>
    </div>
  );
}
