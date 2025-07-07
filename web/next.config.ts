import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      // thêm kết nối đên với Cloudinary để lấy ảnh avatars + food.
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '**'
      },
      // ảnh placeholder cho các món ăn của nhà hàng mà chửa có ảnh minh họa.
      // tam thoi
      {
        protocol: 'https',
        hostname: 'encrypted-tbn0.gstatic.com',
        pathname: '**'
      }
    ]
  },
};

export default nextConfig;
