import Link from 'next/link'
import React from 'react'
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaTwitter } from 'react-icons/fa'

const SocialMedia = () => {
  return (
    <section className='p-8 border border-gray-200 w-[450px] mt-12 sm:w-[600px] sm:mt-12 md:mt-0 md:ml-12'>
      <p className='text-center'>Theo dõi các kênh truyền thông khác của FastDeli:</p>

      {/* mạng xã hội liên kết */}
      <div className='flex flex-row gap-4 mt-4 justify-evenly'>
        <Link href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer">
          <FaFacebookF className='text-[28px] cursor-pointer text-blue-800 px-1 rounded-sm' />
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
    </section>
  )
}

export default SocialMedia