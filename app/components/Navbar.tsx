"use client";
import Image from "next/image";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import DonateButton from "./donateButton";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [aboutDropdownOpen, setAboutDropdownOpen] = useState(false);
  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false);
  const [mobileAboutOpen, setMobileAboutOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { name: "Home", path: "/" },
    { 
      name: "About", 
      path: "/about",
      hasDropdown: true,
      dropdownItems: [
        { name: "About Us", path: "/about" },
        { name: "Why We Exist", path: "/exist" }
      ]
    },
    { name: "Projects", 
      path: "/projects",
      hasDropdown: true,
      dropdownItems: [
        { name: "Projects", path: "/projects" },
        { name: "Completed Projects", path: "/completed-projects" },
        { name: "Ledger", path: "/ledger" },
      ]
     },
    { name: "Our Team", path: "/our-team" },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <nav className="bg-[#fafffa] backdrop-blur-sm border-b border-gray-100 px-6 md:px-12 py-6 w-full mx-auto fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image
            src="/Ad.png"
            width={140}
            height={70}
            alt="Logo"
            className="h-10 w-auto"
          />
        </Link>

        {/* Mobile Menu Button */}
        <button
          className="text-gray-600 md:hidden p-2 hover:bg-gray-50 rounded-full transition-colors duration-200"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle mobile menu"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>

        {/* Desktop Links */}
        <ul className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <li key={link.path} className="relative">
              {link.hasDropdown ? (
                <div
                  className="relative z-50"
                  onMouseEnter={() => link.name === "About" ? setAboutDropdownOpen(true) : setProjectDropdownOpen(true)}
                  onMouseLeave={() => link.name === "About" ? setAboutDropdownOpen(false) : setProjectDropdownOpen(false)}
                >
                  <button
                    className={`flex items-center gap-1 font-light transition-colors duration-200 ${
                      pathname === link.path || pathname === "/exist"
                        ? "text-green-600"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {link.name}
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${(link.name === "About" ? aboutDropdownOpen : projectDropdownOpen) ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  <div
                    className={`absolute top-full left-0 mt-2 w-48 bg-white border border-gray-100 rounded-2xl shadow-lg overflow-hidden transition-all duration-200 z-50 ${
                      (link.name === "About" ? aboutDropdownOpen : projectDropdownOpen)
                        ? "opacity-100 visible translate-y-0"
                        : "opacity-0 invisible -translate-y-2"
                    }`}
                  >
                    {link.dropdownItems?.map((item) => (
                      <Link
                        key={item.path}
                        href={item.path}
                        className={`block px-6 py-3 font-light transition-colors duration-200 ${
                          pathname === item.path
                            ? "bg-green-50 text-green-600"
                            : "text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <Link
                  href={link.path}
                  className={`font-light transition-colors duration-200 ${
                    pathname === link.path
                      ? "text-green-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {link.name}
                </Link>
              )}
            </li>
          ))}
        </ul>

        {/* Donate Button (Desktop) */}
        <div className="hidden md:block">
          <DonateButton />
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden md:hidden ${
          isOpen ? "max-h-[500px] mt-4" : "max-h-0"
        }`}
      >
        <ul className="py-2 border-t border-gray-100 bg-white">
          {navLinks.map((link) => (
            <li key={link.path}>
              {link.hasDropdown ? (
                <div>
                  <button
                    onClick={() => setMobileAboutOpen(!mobileAboutOpen)}
                    className={`w-full flex items-center justify-between px-4 py-3 font-light transition-colors duration-200 ${
                      pathname === link.path || pathname === "/exist"
                        ? "bg-green-50 text-green-600"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <span>{link.name}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${mobileAboutOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {/* Mobile Dropdown Items */}
                  <div
                    className={`overflow-hidden transition-all duration-200 ${
                      mobileAboutOpen ? "max-h-40" : "max-h-0"
                    }`}
                  >
                    {link.dropdownItems?.map((item) => (
                      <Link
                        key={item.path}
                        href={item.path}
                        onClick={() => {
                          setIsOpen(false);
                          setMobileAboutOpen(false);
                        }}
                        className={`block pl-8 pr-4 py-3 font-light transition-colors duration-200 ${
                          pathname === item.path
                            ? "bg-green-50 text-green-600"
                            : "text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <Link
                  href={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`block px-4 py-3 font-light transition-colors duration-200 ${
                    pathname === link.path
                      ? "bg-green-50 text-green-600"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {link.name}
                </Link>
              )}
            </li>
          ))}
          <li className="border-t border-gray-100 px-4 py-4">
            <DonateButton />
          </li>
        </ul>
      </div>
    </nav>
  );
}