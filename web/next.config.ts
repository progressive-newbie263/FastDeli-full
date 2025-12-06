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
    ],
    
    formats: ['image/avif', 'image/webp'], // Thêm formats để tối ưu
    // Các kích thước device để Next.js tối ưu
    // cỡ thiết bị /device.
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    // cỡ ảnh
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },
};

export default nextConfig;
