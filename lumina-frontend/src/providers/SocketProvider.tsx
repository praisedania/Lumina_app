'use client';

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthProvider';
import { Message } from '@/types';
import { toast } from 'sonner';

interface TypingData {
  userId: string;
  userName: string;
  isTyping: boolean;
}

interface NewMessageNotificationData {
  conversationId: string;
  conversationType: 'room' | 'dm';
  message: Message;
  senderName: string;
  senderAvatar?: string | null;
}

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  activeConversationId: string | null;
  joinRoom: (conversationId: string) => void;
  leaveRoom: (conversationId: string) => void;
  sendMessage: (conversationId: string, text: string) => void;
  sendDm: (recipient: { recipientId?: string; recipientUsername?: string; recipientEmail?: string }, text: string) => void;
  emitTyping: (conversationId: string, isTyping: boolean) => void;
  typingUsers: Record<string, string[]>; // conversationId -> userNames typing
  unreadCounts: Record<string, number>; // conversationId -> unread count
  totalUnreadCount: number;
  markAsRead: (conversationId: string) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000';

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, token, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const activeConversationIdRef = useRef<string | null>(null);
  const [typingUsers, setTypingUsers] = useState<Record<string, string[]>>({});
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const typingTimersRef = useRef<Record<string, NodeJS.Timeout>>({});

  // Keep ref in sync for event callbacks
  useEffect(() => {
    activeConversationIdRef.current = activeConversationId;
  }, [activeConversationId]);

  // Load persisted unread counts from localStorage on mount
  useEffect(() => {
    try {
      const storedUnread = localStorage.getItem('lumina_unread_counts');
      if (storedUnread) {
        setUnreadCounts(JSON.parse(storedUnread));
      }
    } catch (e) {
      console.error('Failed to parse unread counts from localStorage:', e);
    }
  }, []);

  // Save unread counts to localStorage
  const updateUnreadCounts = useCallback((updater: (prev: Record<string, number>) => Record<string, number>) => {
    setUnreadCounts((prev) => {
      const next = updater(prev);
      try {
        localStorage.setItem('lumina_unread_counts', JSON.stringify(next));
      } catch (e) {
        console.error('Failed to persist unread counts:', e);
      }
      return next;
    });
  }, []);

  const markAsRead = useCallback((conversationId: string) => {
    if (!conversationId) return;
    updateUnreadCounts((prev) => {
      if (!prev[conversationId]) return prev;
      const next = { ...prev };
      delete next[conversationId];
      return next;
    });
  }, [updateUnreadCounts]);

  // Calculate total unread messages across all conversations
  const totalUnreadCount = Object.values(unreadCounts).reduce((sum, count) => sum + (count || 0), 0);

  // Initialize single authenticated socket when logged in
  useEffect(() => {
    if (!isAuthenticated || !token) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    const socketInstance = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });

    socketInstance.on('connect', () => {
      console.log('Socket.io connected:', socketInstance.id);
      setIsConnected(true);
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('Socket.io disconnected:', reason);
      setIsConnected(false);
    });

    socketInstance.on('connect_error', (err) => {
      console.warn('Socket connect error:', err.message);
      setIsConnected(false);
    });

    socketInstance.on('error', (err: { message: string }) => {
      console.error('Socket server error:', err.message);
    });

    // Listen for personal notification broadcasts
    socketInstance.on('new_message_notification', (data: NewMessageNotificationData) => {
      const convId = data.conversationId;
      const currentActive = activeConversationIdRef.current;

      // If the user does not currently have this conversation open, increment counter and alert
      if (currentActive !== convId) {
        updateUnreadCounts((prev) => ({
          ...prev,
          [convId]: (prev[convId] || 0) + 1,
        }));

        const textPreview = data.message?.text
          ? data.message.text.length > 60
            ? `${data.message.text.slice(0, 60)}...`
            : data.message.text
          : 'Sent a message';

        toast.info(`New message from ${data.senderName}`, {
          description: textPreview,
          action: {
            label: 'View',
            onClick: () => {
              markAsRead(convId);
              router.push(`/messages/${convId}`);
            },
          },
        });
      }
    });

    // Also handle generic receive_message if incoming from another active room
    socketInstance.on('receive_message', (msg: Message) => {
      const convId = msg.conversation_id;
      const currentActive = activeConversationIdRef.current;
      const currentUserId = user?.id;

      if (currentActive !== convId && msg.sender_id !== currentUserId) {
        updateUnreadCounts((prev) => ({
          ...prev,
          [convId]: (prev[convId] || 0) + 1,
        }));
      }
    });

    // Listen for typing events across conversations
    socketInstance.on('user_typing', (data: TypingData) => {
      const convId = activeConversationIdRef.current;
      if (!convId) return;

      setTypingUsers((prev) => {
        const currentList = prev[convId] || [];
        if (data.isTyping) {
          if (!currentList.includes(data.userName)) {
            return { ...prev, [convId]: [...currentList, data.userName] };
          }
          return prev;
        } else {
          return {
            ...prev,
            [convId]: currentList.filter((name) => name !== data.userName),
          };
        }
      });

      // Clear typing indicator automatically after 4 seconds as safety fallback
      if (data.isTyping) {
        const timerKey = `${convId}_${data.userId}`;
        if (typingTimersRef.current[timerKey]) {
          clearTimeout(typingTimersRef.current[timerKey]);
        }
        typingTimersRef.current[timerKey] = setTimeout(() => {
          setTypingUsers((prev) => ({
            ...prev,
            [convId]: (prev[convId] || []).filter((name) => name !== data.userName),
          }));
        }, 4000);
      }
    });

    setSocket(socketInstance);

    return () => {
      Object.values(typingTimersRef.current).forEach((t) => clearTimeout(t));
      typingTimersRef.current = {};
      socketInstance.disconnect();
      setSocket(null);
      setIsConnected(false);
    };
  }, [token, isAuthenticated, user?.id, updateUnreadCounts, markAsRead, router]);

  const joinRoom = useCallback(
    (conversationId: string) => {
      if (!socket || !conversationId) return;
      setActiveConversationId(conversationId);
      markAsRead(conversationId);
      socket.emit('join_room', conversationId);
    },
    [socket, markAsRead]
  );

  const leaveRoom = useCallback(
    (conversationId: string) => {
      if (!socket || !conversationId) return;
      if (activeConversationId === conversationId) {
        setActiveConversationId(null);
      }
    },
    [socket, activeConversationId]
  );

  const sendMessage = useCallback(
    (conversationId: string, text: string) => {
      if (!socket || !text.trim()) return;
      socket.emit('send_message', { conversationId, text: text.trim() });
    },
    [socket]
  );

  const sendDm = useCallback(
    (recipient: { recipientId?: string; recipientUsername?: string; recipientEmail?: string }, text: string) => {
      if (!socket || !text.trim()) return;
      socket.emit('send_dm', {
        ...recipient,
        text: text.trim(),
      });
    },
    [socket]
  );

  const emitTyping = useCallback(
    (conversationId: string, isTyping: boolean) => {
      if (!socket || !conversationId) return;
      socket.emit('typing', { conversationId, isTyping });
    },
    [socket]
  );

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        activeConversationId,
        joinRoom,
        leaveRoom,
        sendMessage,
        sendDm,
        emitTyping,
        typingUsers,
        unreadCounts,
        totalUnreadCount,
        markAsRead,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}
