'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpen,
  Compass,
  MessageSquare,
  User as UserIcon,
  Settings,
  LogOut,
  GraduationCap,
} from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { useSocket } from '@/providers/SocketProvider';
import { cn } from '@/lib/utils';
import { Avatar } from '@/components/ui/Avatar';

export default function DashboardSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { totalUnreadCount } = useSocket();

  const navItems = [
    { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { label: 'My Learning', href: '/my-learning', icon: BookOpen },
    { label: 'Explore Courses', href: '/courses', icon: Compass },
    {
      label: 'Messages & Rooms',
      href: '/messages',
      icon: MessageSquare,
      badge: totalUnreadCount > 0 ? (totalUnreadCount > 99 ? '99+' : String(totalUnreadCount)) : undefined,
    },
    { label: 'Profile', href: '/profile', icon: UserIcon },
    { label: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 shrink-0 hidden md:flex flex-col justify-between border-r border-slate-200/80 bg-white p-4 min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        {/* User Card */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
          <Avatar name={user?.name} src={user?.avatar_url} size="md" />
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-semibold text-slate-900 truncate">{user?.name}</h4>
            <p className="text-xs text-slate-500 capitalize">{user?.role || 'Student'}</p>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === '/dashboard'
                ? pathname === '/dashboard'
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all',
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={cn(
                      'w-4 h-4 transition-colors',
                      isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'
                    )}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span className="px-1.5 py-0.2 text-[10px] font-bold bg-indigo-600 text-white rounded-full min-w-[18px] text-center leading-4">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="pt-4 border-t border-slate-100 space-y-2">
        {user?.role === 'instructor' ? (
          <Link
            href="/instructor"
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors"
          >
            <GraduationCap className="w-4 h-4" />
            Go to Instructor Studio
          </Link>
        ) : null}

        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
