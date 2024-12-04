"use client"
import { useState } from 'react'
import { ChevronDown, User } from 'lucide-react'
import Link from 'next/link'

export default function Header() {
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null)

    const handleDropdownToggle = (dropdown: string) => {
        setActiveDropdown(activeDropdown === dropdown ? null : dropdown)
    }

    return (
        <nav className="w-full h-[70px] flex items-center justify-center px-5 backdrop-blur-[10px] bg-[rgba(0,0,0,0.75)] shadow-[0_25px_50px_0_rgba(0,0,0,0.25),0_5px_25px_0_rgba(0,0,0,0.5)]">
            <div className="w-full max-w-[1200px] flex items-center justify-between">
                <div className="flex items-center">
                    <Link href={{ pathname: '/' }} className="flex items-center space-x-2">
                        <svg width="18" height="27" viewBox="0 0 18 27" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M17.6 0C17.821 0 18 0.179 18 0.4V8.6C18 8.821 17.821 9 17.6 9H9.166C9.06 9 8.958 8.958 8.883 8.883L0.512 0.512C0.323 0.323 0.457 0 0.724 0H17.6Z" fill="white"/>
                            <path d="M0 9.5C0 9.224 0.224 9 0.5 9H8.793C8.926 9 9.053 9.053 9.146 9.146L17.488 17.488C17.677 17.677 17.543 18 17.276 18H9.3C9.134 18 9 18.134 9 18.3V26.276C9 26.543 8.677 26.677 8.488 26.488L0.293 18.293C0.105 18.105 0 17.851 0 17.586V9.5Z" fill="white"/>
                        </svg>
                        <span className="text-white text-lg font-bold" style={{fontFamily: '"GT Walsheim Bold", sans-serif'}}>Framer</span>
                    </Link>
                </div>
                <div className="flex items-center space-x-6">
                    {['Features', 'Resources', 'Support', 'Enterprise', 'Pricing', 'Contact'].map((item) => (
                        <div key={item} className="relative">
                            <button
                                className="text-white opacity-60 hover:opacity-100 transition-opacity duration-200 flex items-center space-x-1"
                                onClick={() => handleDropdownToggle(item)}
                                style={{
                                    fontFamily: '"Inter", sans-serif',
                                    fontWeight: 500,
                                    fontSize: '14px',
                                    letterSpacing: '-0.01em',
                                }}
                            >
                                <span>{item}</span>
                                {(item !== 'Pricing' && item !== 'Contact') && (
                                    <ChevronDown size={12} className={`transform transition-transform duration-200 ${activeDropdown === item ? 'rotate-180' : ''}`} />
                                )}
                            </button>
                            {activeDropdown === item && (
                                <div className="absolute top-full left-0 mt-2 w-48 bg-[rgba(17,17,17,0.75)] backdrop-blur-[50px] rounded-lg shadow-lg">
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                <div className="flex items-center space-x-4">
                    <button className="w-8 h-8 bg-white bg-opacity-10 rounded-lg flex items-center justify-center">
                        <User size={20} className="text-white" />
                    </button>
                </div>
            </div>
        </nav>
    )
}