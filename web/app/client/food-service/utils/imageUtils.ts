/**
 * Tối ưu URL Cloudinary bằng cách thêm transformations
 * @param url - URL gốc từ Cloudinary hoặc bất kỳ URL nào
 * @param width - Chiều rộng mong muốn (default: 400px)
 * @returns URL đã được tối ưu
 */
export function getOptimizedCloudinaryUrl(
  url: string | null | undefined, 
  width: number = 400
): string {
  // Nếu không có URL, trả về placeholder
  if (!url) {
    return '/placeholder-restaurant.jpg';
  }
  
  // Nếu không phải Cloudinary, trả về URL gốc
  if (!url.includes('cloudinary.com') && !url.includes('res.cloudinary')) {
    return url;
  }
  
  // Transform Cloudinary URL
  // From: https://res.cloudinary.com/demo/image/upload/v1234/sample.jpg
  // To:   https://res.cloudinary.com/demo/image/upload/w_400,f_auto,q_auto,c_limit/v1234/sample.jpg
  return url.replace('/upload/', `/upload/w_${width},f_auto,q_auto,c_limit/`);
}

/**
 * Kiểm tra xem URL có phải từ Cloudinary không
 */
export function isCloudinaryUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  return url.includes('cloudinary.com') || url.includes('res.cloudinary');
}

/**
 * Tạo blur placeholder cho Next.js Image component
 */
export function getBlurDataURL(): string {
  return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNzAwIiBoZWlnaHQ9IjQ3NSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2ZXJzaW9uPSIxLjEiLz4=';
}