"use client";

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const NavLink = ({ href, children, isActive }: { href: string; children: React.ReactNode; isActive?: boolean }) => {
  return (
    <Link
      to={href}
      className={cn(
        "px-4 py-2 text-sm font-medium transition-colors rounded-lg",
        isActive
          ? "text-navy-india bg-navy-india/5 font-semibold"
          : "text-gray-600 hover:text-navy-india hover:bg-gray-50"
      )}
    >
      {children}
    </Link>
  );
};

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const navLinksData = [
    { label: 'Home', href: '/' },
    { label: 'Assistant', href: '/chat' },
    { label: 'Draft', href: '/draft' },
    { label: 'Compare', href: '/compare' },
    { label: 'Summarizer', href: '/summarize' },
    { label: 'Find Lawyer', href: '/tools/lawyer-finder' },
    { label: 'AI Tools', href: '/features' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg overflow-hidden border border-gray-200 group-hover:border-saffron/50 transition-colors">
            <img src="/logo.jpg" alt="LegalAi" className="w-full h-full object-cover" />
          </div>
          <span className="font-serif font-bold text-navy-india text-xl tracking-tight group-hover:text-saffron transition-colors">
            LegalAi
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinksData.map((link) => (
            <NavLink key={link.href} href={link.href} isActive={location.pathname === link.href}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Mobile Menu Toggle */}
        <button
          className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-md"
          onClick={toggleMenu}
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Tricolor Line Separator */}
      <div className="h-1 bg-gradient-to-r from-saffron via-white to-green-india w-full" />

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden border-t border-gray-100 bg-white absolute w-full left-0 top-[68px] shadow-xl animate-in slide-in-from-top-2">
          <nav className="flex flex-col p-4 space-y-2">
            {navLinksData.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  "px-4 py-3 text-sm font-medium rounded-lg transition-colors flex items-center justify-between",
                  location.pathname === link.href
                    ? "text-navy-india bg-navy-india/5"
                    : "text-gray-600 hover:bg-gray-50"
                )}
                onClick={() => setIsOpen(false)}
              >
                {link.label}
                {location.pathname === link.href && <div className="w-1.5 h-1.5 rounded-full bg-navy-india" />}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
