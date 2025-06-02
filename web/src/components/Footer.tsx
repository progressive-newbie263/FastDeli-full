import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

import { FaFacebookF, FaInstagram, FaLinkedinIn, FaTwitter } from 'react-icons/fa'

const Footer = () => {
  return (
    <div>
      <footer className="bg-gray-200 text-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-5 gap-7 sm:flex-col text-center md:text-left">
          {/* Company Info */}
          <div className="min-h-[200px] max-w-40">
            <Link href="/">
              <Image
                src="/logo/logo-black.png"
                alt="Logo"
                width={300}
                height={300}
                className="z-10 relative hover:cursor-pointer w-40 h-30 -ml-6 -mt-12 mb-0"
              />
            </Link>
            
            <h3 className="text-md font-bold mb-2 -mt-4">About FastDeli</h3>

            <div className="text-sm">
              <p>Công ty TNHH FastDeli.</p>
              
              <p>Hà Nội, Việt Nam</p>
              
              <p>Mã số doanh nghiệp: 0123-456-789</p>
              
              <p className='my-3'>Theo dõi chúng tôi trên các nền tảng mạng xã hội khác:</p>

              <div className='flex flex-row justify-around -ml-2'>
                <Link href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer">
                  <FaFacebookF className="text-blue-600 text-2xl inline-block" />
                </Link>
                
                <Link href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer">
                  <FaInstagram href='/' className='text-[28px] cursor-pointer text-white bg-pink-600 px-1 rounded-sm' />
                </Link>
                
                <Link href="https://www.linkedin.com/" target="_blank" rel="noopener noreferrer">
                  <FaLinkedinIn href='/' className='text-[28px] cursor-pointer text-white bg-blue-500 px-1 rounded-sm' />
                </Link>
                
                <Link href="https://www.x.com/" target="_blank" rel="noopener noreferrer">
                  <FaTwitter href='/' className='text-[28px] cursor-pointer text-white bg-blue-300 px-1 rounded-sm' />
                </Link>
              </div>
            </div>
          </div>

          {/* User Links */}
          <div className="min-h-[200px] max-w-40">
            <h3 className="text-md font-bold mb-4">Hướng dẫn sử dụng</h3>

            <ul className="text-sm space-y-2">
              <li><a href="#" className="hover:underline">Cách hoạt động</a></li>
              <li><a href="#" className="hover:underline">Các câu hỏi thường gặp</a></li>
              <li><a href="#" className="hover:underline">Liên hệ với chúng tôi</a></li>
              <li><a href="#" className="hover:underline">Blog</a></li>
            </ul>
          </div>

          {/* Services */}
          <div className="min-h-[200px] max-w-40">
            <h3 className="text-md font-bold mb-4">Dịch vụ</h3>

            <ul className="text-sm space-y-2">
              <li><a href="/food-landing-page" className="hover:underline">FoodDeli</a></li>
              <li><a href="/delivery-landing-page" className="hover:underline">ShipDeli</a></li>
              <li><a href="/bike-landing-page" className="hover:underline">BikeDeli</a></li>
            </ul>
          </div>

          {/* Partners */}
          <div className="min-h-[200px] max-w-40">
            <h3 className="text-md font-bold mb-4">Hợp tác cùng FastDeli</h3>

            <ul className="text-sm space-y-2">
              <li><a href="#" className="hover:underline">Đăng kí làm tài xế</a></li>
              <li><a href="#" className="hover:underline">Hợp tác với chúng tôi</a></li>
              <li><a href="#" className="hover:underline">Business Solutions</a></li>
            </ul>
          </div>

          {/* Đường dẫn nhanh/utilities */}
          <div className="min-h-[200px] max-w-40">
            <h3 className="text-md font-bold mb-4">Đường dẫn nhanh</h3>
            
            <ul className="text-sm space-y-2">
              <li><a href="#" className="hover:underline">Trung tâm hỗ trợ</a></li>
              <li><a href="#" className="hover:underline">Thực đơn</a></li>
              <li><a href="#" className="hover:underline">Nền tảng nhà phát triển</a></li>
            </ul>
          </div>
        </div>
      </footer>

      {/* Thông tin phụ */}
      <footer className="bg-gray-800 text-white py-8 flex justify-between px-20 items-center">
        <div className=''>
          <span className='hover:underline cursor-pointer'>Điều khoản và chính sách</span> 
          &nbsp; • &nbsp;  
          <span className='hover:underline cursor-pointer'>Thông báo và bảo mật</span>
        </div>

        <div className="text-center text-gray-400">
          <p> &copy; 2025 FastDeli.</p>
        </div>

        <Link href="/">
          <Image
            src="/assets/download-ggplay.png"
            alt="Logo"
            width={300}
            height={300}
            className="z-10 relative hover:cursor-pointer w-36 h-10"
          />
        </Link>
      </footer>
    </div>
  )
}

export default Footer