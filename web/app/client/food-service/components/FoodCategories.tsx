'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

// Giao diện định nghĩa cho một category
export interface Category {
  category_id: number;
  category_name: string;
  image_url: string;
}

interface CategoryListProps {
  categories: Category[];
}

const FoodCategories: React.FC<CategoryListProps> = ({ categories }) => {
  return (
    <>
      <h1 className='text-4xl font-bold'>Thỏa thích lựa chọn thể loại món ăn bạn muốn tại đây</h1>
      
      <div
        className="grid 
          grid-cols-2 
          lg:grid-cols-3 
          xl:grid-cols-4 
          gap-6 py-10"
      >
        {categories.map((category) => (
          <Link
            key={category.category_id}
            href={`/client/food-service/categories/${category.category_id}`}
            className="block rounded-md overflow-hidden bg-white"
          >
            <div className="relative w-full h-48">
              <Image
                src={category.image_url}
                alt={category.category_name}
                fill
                className="object-cover"
              />
            </div>

            <div className="p-4">
              <h3 className="text-md font-semibold text-gray-800">{category.category_name}</h3>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
};

export default FoodCategories;
