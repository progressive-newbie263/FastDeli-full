"use client"

import Image from 'next/image'
import Link from 'next/link'
import React, { useEffect, useRef, useState } from 'react'
import { FaAngleDown } from "react-icons/fa"
import { SlMagnifier } from "react-icons/sl"
import { RxHamburgerMenu } from "react-icons/rx";

const Navbar = () => {
  const [isDropdownOpenPartner, setIsDropdownOpenPartner] = useState(false)
  const [isDropdownOpenLanguage, setIsDropdownOpenLanguage] = useState(false)

  // Ref tham chiếu tới vùng dropdown Partner và Language
  const partnerRef = useRef<HTMLDivElement>(null)
  const languageRef = useRef<HTMLDivElement>(null)

  // Toggle on/off cho các dropdown
  const partnerChoiceSelector = () => {
    setIsDropdownOpenPartner(!isDropdownOpenPartner)
  }
  const languageSelector = () => {
    setIsDropdownOpenLanguage(!isDropdownOpenLanguage)
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        partnerRef.current &&
        !partnerRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpenPartner(false)
      }

      if (
        languageRef.current &&
        !languageRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpenLanguage(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  return (
    <nav className="bg-gray-950 shadow-md fixed w-full z-10">
      <div className="max-w-8xl mx-auto px-2 sm:px-3 lg:px-4">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className='cursor-pointer border-solid border-1 border-black p-1.5 rounded-sm hover:border-white text-white'>
              <RxHamburgerMenu className='w-6 h-6 ml-1.5' width={200} height={200} />
              
              <div className='text-sm'>Menu</div>
            </div>
            
            <div className="relative w-50 h-16 overflow-hidden flex items-center justify-center">
              <Link href="/">
                <Image
                  src="/logo/logo.png"
                  alt="Logo"
                  width={300}
                  height={300}
                  className="z-10 relative hover:cursor-pointer w-44 h-32"
                />
              </Link> 
            </div>
          </div>

          {/* Navigation */}
          <div className="hidden md:flex items-center w-[700px] justify-around">

            {/* Partner Dropdown */}
            <div className="relative" ref={partnerRef}>
              <div className="text-white hover:text-green-600 cursor-pointer" onClick={partnerChoiceSelector}>
                Trở thành Đối tác của FastDeli <FaAngleDown className="inline-block ml-1" />
              </div>

              {isDropdownOpenPartner && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-white shadow-lg rounded-md py-2 z-20">
                  <Link href="#" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">Đối tác giao hàng</Link>
                  <Link href="#" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">Đối tác nhà hàng</Link>
                  <Link href="#" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">Đối tác doanh nghiệp</Link>
                </div>
              )}
            </div>

            <div className="text-white hover:text-green-600 cursor-pointer" onClick={() => {}}>
              Giới thiệu <FaAngleDown className="inline-block ml-1" />
            </div>

            {/* Language Dropdown */}
            <div className="relative" ref={languageRef}>
              <div className="bg-green-600 text-white px-4 py-2 rounded-full hover:bg-green-700 cursor-pointer" onClick={languageSelector}>
                Tiếng Việt <FaAngleDown className="inline-block ml-1" />
              </div>

              {isDropdownOpenLanguage && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-white shadow-lg rounded-md py-2 z-20">
                  <Link href="#" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">Tiếng Anh</Link>
                </div>
              )}
            </div>

            <SlMagnifier className="cursor-pointer" />
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
