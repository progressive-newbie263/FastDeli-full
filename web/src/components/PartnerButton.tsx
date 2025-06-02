import React from 'react';

import { IoPersonSharp } from "react-icons/io5";

const PartnerButton = () => {
  return (
    <button className='fixed top-24 right-6 bg-green-700 w-30 h-36 z-10
      text-white rounded-lg p-5 cursor-pointer
      flex flex-col items-center justify-center space-y-2
    '>
      <IoPersonSharp className="text-5xl" />

      <p className='text-sm text-center'>Trở Thành Nhà Hàng Đối Tác</p>
    </button> 
  )
}

export default PartnerButton;
