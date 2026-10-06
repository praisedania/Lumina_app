'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BookPlus,
  Layers,
  Banknote,
  MessageSquare,
  Settings,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { useSocket } from '@/providers/SocketProvider';
import { cn } from '@/lib/utils';
import { Avatar } from '@/components/ui/Avatar';

export default function InstructorSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { totalUnreadCount } = useSocket();

  const navItems = [
    { label: 'Studio Overview', href: '/instructor', icon: LayoutDashboard, exact: true },
    { label: 'Create New Course', href: '/instructor/courses/create', icon: BookPlus },
    { label: 'Manage Courses', href: '/instructor/courses', icon: Layers },
    { label: 'Earnings & Payouts', href: '/instructor/payouts', icon: Banknote },
    {
      label: 'Student Messages',
      href: '/instructor/messages',
      icon: MessageSquare,
      badge: totalUnreadCount > 0 ? (totalUnreadCount > 99 ? '99+' : String(totalUnreadCount)) : undefined,
    },
    { label: 'Account Settings', href: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 shrink-0 hidden md:flex flex-col justify-between border-r border-slate-200/80 bg-white p-4 min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        {/* Instructor Badge */}
        <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-center gap-3">
          <Avatar name={user?.name} src={user?.avatar_url} size="md" />
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-semibold text-slate-900 truncate">{user?.name}</h4>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-indigo-700">
              <Sparkles className="w-3 h-3" />
              Instructor Studio
            </div>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all',
                  isActive
                    ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={cn(
                      'w-4 h-4 transition-colors',
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'
                    )}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={cn(
                      'px-1.5 py-0.2 text-[10px] font-bold rounded-full min-w-[18px] text-center leading-4',
                      isActive ? 'bg-white text-indigo-600' : 'bg-indigo-600 text-white'
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Return to student dashboard */}
      <div className="pt-4 border-t border-slate-100">
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-indigo-600 hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Switch to Student View
        </Link>
      </div>
    </aside>
  );
}
