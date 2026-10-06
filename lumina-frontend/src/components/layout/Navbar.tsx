'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { useSocket } from '@/providers/SocketProvider';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  BookOpen,
  LayoutDashboard,
  MessageSquare,
  GraduationCap,
  LogOut,
  User as UserIcon,
  Settings,
  Menu,
  X,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Navbar() {
  const { user, isAuthenticated, logout, switchToInstructor } = useAuth();
  const { totalUnreadCount } = useSocket();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const isInstructor = user?.role === 'instructor' || user?.role === 'admin';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Brand Logo */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5 fill-white/20" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
                  Lumina
                </span>
                <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 -mt-1">
                  Community LMS
                </span>
              </div>
            </Link>

            {/* Desktop Public Nav */}
            <nav className="hidden md:flex items-center gap-1">
              <Link
                href="/courses"
                className={cn(
                  'px-3.5 py-2 text-sm font-medium rounded-lg transition-colors',
                  pathname.startsWith('/courses') && !pathname.includes('/room')
                    ? 'text-indigo-600 bg-indigo-50/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                )}
              >
                Browse Courses
              </Link>
              {isAuthenticated && (
                <>
                  <Link
                    href="/dashboard"
                    className={cn(
                      'px-3.5 py-2 text-sm font-medium rounded-lg transition-colors',
                      pathname === '/dashboard'
                        ? 'text-indigo-600 bg-indigo-50/60'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    )}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/my-learning"
                    className={cn(
                      'px-3.5 py-2 text-sm font-medium rounded-lg transition-colors',
                      pathname.startsWith('/my-learning')
                        ? 'text-indigo-600 bg-indigo-50/60'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    )}
                  >
                    My Learning
                  </Link>
                  <Link
                    href="/messages"
                    className={cn(
                      'px-3.5 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5',
                      pathname.startsWith('/messages')
                        ? 'text-indigo-600 bg-indigo-50/60'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    )}
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Messages</span>
                    {totalUnreadCount > 0 && (
                      <span className="px-1.5 py-0.2 text-[10px] font-bold bg-indigo-600 text-white rounded-full min-w-[18px] text-center leading-4 animate-pulse">
                        {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
                      </span>
                    )}
                  </Link>
                </>
              )}
            </nav>
          </div>

          {/* Right Header Section */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                {isInstructor ? (
                  <Link href="/instructor">
                    <Button
                      variant={pathname.startsWith('/instructor') ? 'primary' : 'outline'}
                      size="sm"
                      leftIcon={<GraduationCap className="w-4 h-4" />}
                    >
                      Instructor Studio
                    </Button>
                  </Link>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => switchToInstructor()}
                    leftIcon={<GraduationCap className="w-4 h-4" />}
                  >
                    Teach on Lumina
                  </Button>
                )}

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
                  >
                    <Avatar name={user?.name} src={user?.avatar_url} size="sm" />
                    <div className="text-left hidden lg:block pr-1">
                      <p className="text-xs font-semibold text-slate-800 leading-tight">
                        {user?.name}
                      </p>
                      <Badge variant="secondary" className="text-[10px] py-0 px-1.5 h-4 mt-0.5">
                        {user?.role}
                      </Badge>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {userDropdownOpen && (
                    <div
                      className="absolute right-0 mt-2 w-56 rounded-2xl bg-white shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2"
                      onMouseLeave={() => setUserDropdownOpen(false)}
                    >
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-sm font-semibold text-slate-900">{user?.name}</p>
                        <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                      </div>

                      <div className="py-1">
                        <Link
                          href="/dashboard"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          Student Dashboard
                        </Link>
                        <Link
                          href="/my-learning"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                        >
                          <BookOpen className="w-4 h-4" />
                          My Enrolled Courses
                        </Link>
                        <Link
                          href="/messages"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center justify-between px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                        >
                          <div className="flex items-center gap-2.5">
                            <MessageSquare className="w-4 h-4" />
                            Chat & Course Rooms
                          </div>
                          {totalUnreadCount > 0 && (
                            <span className="px-1.5 py-0.2 text-[10px] font-bold bg-indigo-600 text-white rounded-full">
                              {totalUnreadCount}
                            </span>
                          )}
                        </Link>
                        {user?.role === 'admin' && (
                          <Link
                            href="/admin"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-sm text-amber-700 hover:bg-amber-50 transition-colors font-medium"
                          >
                            <Sparkles className="w-4 h-4" />
                            Admin Console
                          </Link>
                        )}
                        <Link
                          href="/profile"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                        >
                          <UserIcon className="w-4 h-4" />
                          Profile
                        </Link>
                        <Link
                          href="/settings"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                        >
                          <Settings className="w-4 h-4" />
                          Settings
                        </Link>
                      </div>

                      <div className="border-t border-slate-100 pt-1">
                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            logout();
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Log in
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="primary" size="sm">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-6 space-y-3">
          <Link
            href="/courses"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            Browse Courses
          </Link>
          {isAuthenticated ? (
            <>
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
              >
                Dashboard
              </Link>
              <Link
                href="/my-learning"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
              >
                My Learning
              </Link>
              <Link
                href="/messages"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
              >
                <span>Messages & Rooms</span>
                {totalUnreadCount > 0 && (
                  <span className="px-2 py-0.5 text-xs font-bold bg-indigo-600 text-white rounded-full">
                    {totalUnreadCount}
                  </span>
                )}
              </Link>
              {isInstructor && (
                <Link
                  href="/instructor"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-base font-medium text-indigo-600 bg-indigo-50"
                >
                  Instructor Studio
                </Link>
              )}
              <Link
                href="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
              >
                Profile Settings
              </Link>
              <Link
                href="/settings"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
              >
                Account Settings
              </Link>
              <div className="pt-2 border-t border-slate-100">
                <Button
                  variant="outline"
                  size="md"
                  className="w-full text-rose-600 border-rose-200 hover:bg-rose-50"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  leftIcon={<LogOut className="w-4 h-4" />}
                >
                  Sign Out
                </Button>
              </div>
            </>
          ) : (
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="block w-full">
                <Button variant="outline" size="md" className="w-full">
                  Log In
                </Button>
              </Link>
              <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="block w-full">
                <Button variant="primary" size="md" className="w-full">
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
