'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import ProtectedRoute from '@/components/guards/ProtectedRoute';
import DashboardSidebar from '@/components/layout/DashboardSidebar';
import ChatBox from '@/components/chat/ChatBox';
import { useConversations } from '@/hooks/useChat';
import { useSocket } from '@/providers/SocketProvider';
import NewDmModal from '@/components/chat/NewDmModal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { ArrowLeft, BookOpen, User, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ConversationDetailPage() {
  const params = useParams();
  const conversationId = params?.conversationId as string;

  const { data } = useConversations();
  const { unreadCounts, markAsRead } = useSocket();
  const [isNewDmOpen, setIsNewDmOpen] = useState(false);

  // Clear unread badge for this conversation when viewing
  useEffect(() => {
    if (conversationId) {
      markAsRead(conversationId);
    }
  }, [conversationId, markAsRead]);

  const courseRooms = data?.courseRooms || [];
  const dms = data?.dms || [];

  // Determine current conversation info
  const currentRoom = courseRooms.find((r) => r.id === conversationId);
  const currentDm = dms.find((d) => d.id === conversationId);

  const title = currentRoom
    ? `${currentRoom.course?.title || 'Course'} Room`
    : currentDm
    ? currentDm.recipient?.name || 'Direct Message'
    : 'Conversation';

  const type = currentRoom ? 'room' : 'dm';

  return (
    <ProtectedRoute>
      <div className="flex-1 flex bg-slate-50/60">
        <DashboardSidebar />

        <main className="flex-1 p-3 sm:p-6 lg:p-8 max-w-7xl flex flex-col h-[calc(100vh-4rem)]">
          {/* Back button on small screen */}
          <div className="lg:hidden mb-2">
            <Link href="/messages">
              <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                All Conversations
              </Button>
            </Link>
          </div>

          <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
            {/* Conversations list sidebar on desktop */}
            <div className="hidden lg:flex flex-col bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs h-full">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Conversations
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsNewDmOpen(true)}
                  className="h-7 w-7 p-0"
                  title="New Message"
                >
                  <Plus className="w-4 h-4 text-indigo-600" />
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
                {courseRooms.map((room) => {
                  const isCurrent = room.id === conversationId;
                  const unread = unreadCounts[room.id] || 0;

                  return (
                    <Link
                      key={room.id}
                      href={`/messages/${room.id}`}
                      className={cn(
                        'flex items-center gap-3 p-2.5 rounded-xl transition-all border relative',
                        isCurrent
                          ? 'bg-indigo-50/90 border-indigo-200/90 text-indigo-950 font-semibold'
                          : 'border-transparent hover:bg-slate-50 text-slate-700'
                      )}
                    >
                      <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-xs truncate">{room.course?.title || 'Course Room'}</p>
                          {unread > 0 && !isCurrent && (
                            <span className="px-1.5 py-0.2 text-[9px] font-bold bg-indigo-600 text-white rounded-full min-w-[16px] text-center leading-3.5">
                              {unread}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400">Course Community</span>
                      </div>
                    </Link>
                  );
                })}

                {dms.map((dm) => {
                  const isCurrent = dm.id === conversationId;
                  const recipient = dm.recipient;
                  const unread = unreadCounts[dm.id] || 0;
                  const displayName = recipient?.name || 'Direct Message';

                  return (
                    <Link
                      key={dm.id}
                      href={`/messages/${dm.id}`}
                      className={cn(
                        'flex items-center gap-3 p-2.5 rounded-xl transition-all border relative',
                        isCurrent
                          ? 'bg-indigo-50/90 border-indigo-200/90 text-indigo-950 font-semibold'
                          : 'border-transparent hover:bg-slate-50 text-slate-700'
                      )}
                    >
                      <Avatar name={displayName} src={recipient?.avatar_url} size="sm" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-xs truncate">{displayName}</p>
                          {unread > 0 && !isCurrent && (
                            <span className="px-1.5 py-0.2 text-[9px] font-bold bg-indigo-600 text-white rounded-full min-w-[16px] text-center leading-3.5 animate-pulse">
                              {unread}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 capitalize">
                          {recipient?.role || 'Direct Message'}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Chat Box */}
            <div className="lg:col-span-2 h-full">
              <ChatBox
                conversationId={conversationId}
                title={title}
                subtitle={
                  type === 'room'
                    ? 'Course room discussion'
                    : currentDm?.recipient?.email || 'Direct message'
                }
                type={type}
              />
            </div>
          </div>
        </main>
      </div>

      <NewDmModal isOpen={isNewDmOpen} onClose={() => setIsNewDmOpen(false)} />
    </ProtectedRoute>
  );
}
