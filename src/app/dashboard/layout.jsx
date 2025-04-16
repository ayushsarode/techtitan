'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Home, 
  BarChart2, 
  Activity, 
  Calendar, 
  Leaf, 
  Award, 
  Settings, 
  LogOut,
  Users,
  Target,
  Menu,
  X
} from 'lucide-react';

export default function DashboardLayout({ children }) {
  const { user, loading, logout, isAdmin } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [path, setPath] = useState('');

  useEffect(() => {
    // Set current path for active state in navigation
    setPath(window.location.pathname);
    
    // Redirect to login if not authenticated
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  const handleLogout = async () => {
    await logout();
  };

  const isActive = (href) => {
    return path === href ? 'bg-green-100 text-green-800' : 'text-green-700 hover:bg-green-50 hover:text-green-900';
  };

  // Navigation items array for reuse
  const navigationItems = [
    { href: '/dashboard', icon: Home, text: 'Dashboard' },
    { href: '/dashboard/activities', icon: Activity, text: 'Activities' },
    { href: '/dashboard/plants', icon: Leaf, text: 'My Plants' },
    { href: '/dashboard/challenges', icon: Target, text: 'Challenges' },
    { href: '/dashboard/achievements', icon: Award, text: 'Achievements' },
    { href: '/dashboard/insights', icon: BarChart2, text: 'Insights' },
    { href: '/dashboard/leaderboard', icon: Users, text: 'Leaderboard' },
    { href: '/dashboard/profile', icon: Settings, text: 'Settings' }
  ];

  return (
    <div className="min-h-screen bg-green-50 bg-[url('/images/subtle-leaves-pattern.png')] bg-fixed bg-opacity-25">
      {/* Navigation Bar */}
      <nav className="bg-white/90 backdrop-blur-sm shadow-sm border-b border-green-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button 
                className="md:hidden p-2 rounded-md text-green-600"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
              <Link href="/dashboard" className="flex-shrink-0 flex items-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-green-100 rounded-full transform scale-125"></div>
                  <Leaf className="h-8 w-8 text-green-600 relative z-10" />
                </div>
                <span className="ml-3 text-xl font-bold text-green-800">Carbon Tracker</span>
              </Link>
            </div>
            <div className="flex items-center">
              {isAdmin && (
                <Link 
                  href="/admin" 
                  className="ml-4 px-3 py-1 rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 shadow-sm"
                >
                  Admin Dashboard
                </Link>
              )}
              <div className="ml-4 flex items-center space-x-3">
                <div className="hidden md:flex items-center space-x-1 px-3 py-1.5 bg-green-100/70 rounded-full">
                  <Leaf className="h-4 w-4 text-green-600" />
                  <span className="text-xs font-medium text-green-800">
                    Level 3
                  </span>
                </div>
                <span className="text-sm font-medium text-green-700 hidden sm:block">
                  {user.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-full text-green-600 hover:text-green-700 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  title="Log out"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-sm border-b border-green-100 shadow-lg">
          <div className="pt-2 pb-3 space-y-1">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-4 py-3 text-base font-medium ${isActive(item.href)}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.text}
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="flex h-screen bg-transparent overflow-hidden pt-16">
        {/* Sidebar */}
        <div className="hidden md:flex md:flex-shrink-0">
          <div className="flex flex-col w-64">
            <div className="flex flex-col h-0 flex-1 border-r border-green-100 bg-white/80 backdrop-blur-sm">
              <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
                {/* User Summary Card */}
                <div className="px-3 mb-6">
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 shadow-sm border border-green-200">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-green-600 flex items-center justify-center text-white font-bold">
                        {user.email && user.email[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-green-900 truncate">
                          {user.email}
                        </p>
                        <div className="flex items-center mt-1">
                          <span className="text-xs text-green-700 bg-green-100 rounded-full px-2 py-0.5 flex items-center">
                            <Leaf className="h-3 w-3 mr-1" />
                            Sprout
                          </span>
                        </div>
                      </div>
                    </div>
                    {/* Mini progress bar */}
                    <div className="mt-3">
                      <div className="text-xs flex justify-between text-green-700 mb-1">
                        <span>Level 3</span>
                        <span>75 / 100 XP</span>
                      </div>
                      <div className="h-1.5 bg-green-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-green-300 to-green-600 rounded-full" style={{ width: "75%" }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                <nav className="mt-2 flex-1 px-2 space-y-1">
                  {navigationItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-150 ease-in-out ${isActive(item.href)}`}
                    >
                      <item.icon className="mr-3 h-5 w-5" />
                      {item.text}
                    </Link>
                  ))}
                </nav>

                {/* Environmental Tip */}
                <div className="px-3 mt-6 mb-4">
                  <div className="rounded-lg bg-green-50 p-3 border border-green-200">
                    <h4 className="text-xs font-semibold text-green-800 uppercase tracking-wide mb-1">Eco Tip</h4>
                    <p className="text-xs text-green-700">Try avoiding single-use plastics today to reduce your daily carbon footprint.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex flex-col w-0 flex-1 overflow-hidden">
          <main className="flex-1 relative overflow-y-auto focus:outline-none">
            <div className="py-6">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                {children}
              </div>
            </div>
          </main>

          {/* Footer */}
          <footer className="bg-white/60 backdrop-blur-sm border-t border-green-100 py-4 px-6">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center text-xs text-green-700">
              <p>© 2025 Carbon Tracker. All rights reserved.</p>
              <div className="flex space-x-4 mt-2 sm:mt-0">
                <Link href="/help" className="hover:text-green-800">Help Center</Link>
                <Link href="/privacy" className="hover:text-green-800">Privacy</Link>
                <Link href="/terms" className="hover:text-green-800">Terms</Link>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}