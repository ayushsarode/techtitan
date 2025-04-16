// Nav.jsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../providers';
import { supabase } from '@/lib/supabase';
import { useState } from 'react';
import { Menu, X, Leaf } from 'lucide-react';

export default function Nav() {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const navItems = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Activities', href: '/activities' },
    { name: 'Insights', href: '/insights' },
    { name: 'Leaderboard', href: '/leaderboard' },
    { name: 'Garden', href: '/garden' }
  ];

  return (
    <nav className="bg-green-400 shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-white font-bold text-xl flex items-center">
                <Leaf className="mr-2" size={24} />
                <span>EcoQuest</span>
              </Link>
            </div>
            {user && !loading && (
              <div className="hidden md:ml-6 md:flex md:space-x-8">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`${
                      pathname === item.href
                        ? 'border-white text-white'
                        : 'border-transparent text-green-100 hover:border-green-200 hover:text-white'
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
          
          <div className="hidden md:ml-6 md:flex md:items-center space-x-4">
            {user && !loading ? (
              <>
                <div className="text-white mr-4 px-3 py-1 bg-green-700 rounded-full text-sm">
                  {user.email}
                </div>
                <button
                  onClick={handleSignOut}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-green-700 hover:bg-green-800 transition-colors duration-200"
                >
                  Sign out
                </button>
              </>
            ) : (
              !loading && (
                <div className="space-x-3">
                  <Link
                    href="/auth/signin"
                    className="px-4 py-2 rounded-lg text-sm font-medium text-green-700 bg-white hover:bg-green-50 transition-colors duration-200"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/register"
                    className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-green-700 hover:bg-green-800 transition-colors duration-200"
                  >
                    Register
                  </Link>
                </div>
              )
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white hover:text-green-200 focus:outline-none"
            >
              {isMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-green-600 pb-4 px-4">
          {user && !loading && (
            <div className="space-y-1 pt-2 pb-3">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`${
                    pathname === item.href
                      ? 'bg-green-700 text-white'
                      : 'text-green-100 hover:bg-green-700 hover:text-white'
                  } block px-3 py-2 rounded-md text-base font-medium`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          )}
          
          <div className="pt-4 pb-3 border-t border-green-500">
            {user && !loading ? (
              <>
                <div className="text-green-100 px-4 py-2 text-sm">
                  {user.email}
                </div>
                <button
                  onClick={handleSignOut}
                  className="mt-2 block w-full text-left px-4 py-2 rounded-md text-base font-medium text-green-100 hover:bg-green-700 hover:text-white"
                >
                  Sign out
                </button>
              </>
            ) : (
              !loading && (
                <div className="space-y-2">
                  <Link
                    href="/auth/signin"
                    className="block w-full text-center px-4 py-2 rounded-md text-base font-medium text-green-700 bg-white hover:bg-green-50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/register"
                    className="block w-full text-center px-4 py-2 rounded-md text-base font-medium text-white bg-green-700 hover:bg-green-800"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Register
                  </Link>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </nav>
  );
}