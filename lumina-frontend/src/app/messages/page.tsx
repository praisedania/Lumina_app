'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/guards/ProtectedRoute';
import DashboardSidebar from '@/components/layout/DashboardSidebar';
import { useConversations } from '@/hooks/useChat';
import { useSocket } from '@/providers/SocketProvider';
import NewDmModal from '@/components/chat/NewDmModal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { Avatar } from '@/components/ui/Avatar';
import {
  MessageSquare,
  Plus,
  BookOpen,
  User,
  Sparkles,
  ArrowRight,
  Search,
  CheckCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function MessagesIndexPage() {
  const { data, isLoading } = useConversations();
  const { unreadCounts } = useSocket();
  const [tab, setTab] = useState<'all' | 'rooms' | 'dms'>('all');
  const [isNewDmOpen, setIsNewDmOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const courseRooms = data?.courseRooms || [];
  const dms = data?.dms || [];

  const filteredRooms = courseRooms.filter((r) =>
    (r.course?.title || 'Course Room').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredDms = dms.filter((d) => {
    const recipientName = d.recipient?.name || '';
    const recipientEmail = d.recipient?.email || '';
    const term = searchTerm.toLowerCase();
    return (
      d.id.toLowerCase().includes(term) ||
      recipientName.toLowerCase().includes(term) ||
      recipientEmail.toLowerCase().includes(term)
    );
  });

  return (
    <ProtectedRoute>
      <div className="flex-1 flex bg-slate-50/60">
        <DashboardSidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl flex flex-col h-[calc(100vh-4rem)]">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200/80 mb-6 gap-3">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Messages</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Join live course discussions or send direct private messages
              </p>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsNewDmOpen(true)}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              New Direct Message
            </Button>
          </div>

          <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
            {/* Conversations List Column */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 flex flex-col h-full shadow-2xs">
              {/* Tab Selector */}
              <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-xl mb-4 text-xs font-semibold">
                <button
                  onClick={() => setTab('all')}
                  className={cn(
                    'py-1.5 rounded-lg transition-all',
                    tab === 'all' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600'
                  )}
                >
                  All ({courseRooms.length + dms.length})
                </button>
                <button
                  onClick={() => setTab('rooms')}
                  className={cn(
                    'py-1.5 rounded-lg transition-all',
                    tab === 'rooms' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600'
                  )}
                >
                  Rooms ({courseRooms.length})
                </button>
                <button
                  onClick={() => setTab('dms')}
                  className={cn(
                    'py-1.5 rounded-lg transition-all',
                    tab === 'dms' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600'
                  )}
                >
                  DMs ({dms.length})
                </button>
              </div>

              {/* Search input */}
              <div className="relative mb-3">
                <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by name, course, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
                {isLoading ? (
                  <div className="space-y-2 p-2">
                    <Skeleton className="h-16 w-full rounded-xl" />
                    <Skeleton className="h-16 w-full rounded-xl" />
                    <Skeleton className="h-16 w-full rounded-xl" />
                  </div>
                ) : ((tab === 'all' && filteredRooms.length === 0 && filteredDms.length === 0) ||
                    (tab === 'rooms' && filteredRooms.length === 0) ||
                    (tab === 'dms' && filteredDms.length === 0)) ? (
                  <div className="text-center py-10 px-2 space-y-3">
                    <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="text-xs text-slate-500">No active conversations found</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsNewDmOpen(true)}
                      leftIcon={<Plus className="w-3.5 h-3.5" />}
                    >
                      Start a Conversation
                    </Button>
                  </div>
                ) : (
                  <>
                    {(tab === 'all' || tab === 'rooms') &&
                      filteredRooms.map((room) => {
                        const unread = unreadCounts[room.id] || 0;
                        return (
                          <Link
                            key={room.id}
                            href={`/messages/${room.id}`}
                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 group relative"
                          >
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                              <BookOpen className="w-5 h-5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between">
                                <h4 className="text-xs font-bold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                                  {room.course?.title || 'Course Room'}
                                </h4>
                                <div className="flex items-center gap-1.5">
                                  {unread > 0 && (
                                    <span className="px-1.5 py-0.2 text-[10px] font-bold bg-indigo-600 text-white rounded-full min-w-[18px] text-center leading-4">
                                      {unread > 99 ? '99+' : unread}
                                    </span>
                                  )}
                                  <Badge variant="default" className="text-[9px] py-0 px-1.5 h-3.5">
                                    Room
                                  </Badge>
                                </div>
                              </div>
                              <p className="text-[11px] text-slate-500 truncate mt-0.5">
                                {room.lastMessage?.text || 'Course community discussion'}
                              </p>
                            </div>
                          </Link>
                        );
                      })}

                    {(tab === 'all' || tab === 'dms') &&
                      filteredDms.map((dm) => {
                        const recipient = dm.recipient;
                        const unread = unreadCounts[dm.id] || 0;
                        const displayName = recipient?.name || 'Direct Message';

                        return (
                          <Link
                            key={dm.id}
                            href={`/messages/${dm.id}`}
                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 group relative"
                          >
                            <Avatar name={displayName} src={recipient?.avatar_url} size="md" />

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between">
                                <h4 className="text-xs font-bold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                                  {displayName}
                                </h4>
                                <div className="flex items-center gap-1.5">
                                  {unread > 0 && (
                                    <span className="px-1.5 py-0.2 text-[10px] font-bold bg-indigo-600 text-white rounded-full min-w-[18px] text-center leading-4 animate-pulse">
                                      {unread > 99 ? '99+' : unread}
                                    </span>
                                  )}
                                  <Badge
                                    variant={recipient?.role === 'instructor' ? 'default' : 'secondary'}
                                    className="text-[9px] py-0 px-1.5 h-3.5 capitalize"
                                  >
                                    {recipient?.role || 'DM'}
                                  </Badge>
                                </div>
                              </div>
                              <p className="text-[11px] text-slate-500 truncate mt-0.5">
                                {dm.lastMessage?.text || recipient?.email || 'Start conversation...'}
                              </p>
                            </div>
                          </Link>
                        );
                      })}
                  </>
                )}
              </div>
            </div>

            {/* Empty State / Select Prompt on Right */}
            <div className="hidden lg:flex lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-8 flex-col items-center justify-center text-center space-y-4 shadow-2xs">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-inner">
                <MessageSquare className="w-8 h-8" />
              </div>
              <div className="max-w-sm space-y-1">
                <h3 className="text-lg font-bold text-slate-900">Select a conversation</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Choose a course room or direct message from the left to start chatting in real time with learners and instructors.
                </p>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsNewDmOpen(true)}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Start Direct Message
              </Button>
            </div>
          </div>
        </main>
      </div>

      <NewDmModal isOpen={isNewDmOpen} onClose={() => setIsNewDmOpen(false)} />
    </ProtectedRoute>
  );
}
