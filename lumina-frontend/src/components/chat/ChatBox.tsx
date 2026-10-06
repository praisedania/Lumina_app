'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSocket } from '@/providers/SocketProvider';
import { useAuth } from '@/providers/AuthProvider';
import { useChatHistory, useSendMessage } from '@/hooks/useChat';
import { Message } from '@/types';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatTime } from '@/lib/utils';
import { Send, Sparkles, Wifi, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ChatBoxProps {
  conversationId: string;
  title?: string;
  subtitle?: string;
  type?: 'room' | 'dm';
}

export default function ChatBox({ conversationId, title, subtitle, type = 'room' }: ChatBoxProps) {
  const { user } = useAuth();
  const { socket, isConnected, joinRoom, leaveRoom, emitTyping, typingUsers } = useSocket();

  const { data: historyData, isLoading } = useChatHistory(conversationId);
  const restSendMessage = useSendMessage();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sync initial history
  useEffect(() => {
    if (historyData?.messages) {
      setMessages(historyData.messages);
    }
  }, [historyData]);

  // Join room and listen for real-time messages
  useEffect(() => {
    if (!conversationId) return;

    joinRoom(conversationId);

    if (socket) {
      const handleNewMessage = (newMsg: Message) => {
        if (newMsg.conversation_id === conversationId) {
          setMessages((prev) => {
            // Prevent duplicate message IDs
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        }
      };

      socket.on('receive_message', handleNewMessage);

      return () => {
        socket.off('receive_message', handleNewMessage);
        leaveRoom(conversationId);
      };
    }

    return () => {
      leaveRoom(conversationId);
    };
  }, [conversationId, socket, joinRoom, leaveRoom]);

  // Auto-scroll to bottom on messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle typing debounce
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);

    emitTyping(conversationId, true);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      emitTyping(conversationId, false);
    }, 1200);
  };

  // Send message
  const handleSend = () => {
    const trimmed = inputText.trim();
    if (!trimmed) return;

    // Clear typing indicator immediately
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    emitTyping(conversationId, false);
    setInputText('');

    if (socket && isConnected) {
      socket.emit('send_message', {
        conversationId,
        text: trimmed,
      });
    } else {
      // REST fallback
      restSendMessage.mutate({
        conversationId,
        text: trimmed,
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const activeTypers = (typingUsers[conversationId] || []).filter(
    (name) => name !== user?.name
  );

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900 text-sm">{title || 'Course Room'}</h3>
            <Badge variant="secondary" className="text-[10px] py-0 px-2 h-4 font-semibold">
              {type === 'room' ? 'Room' : 'Direct Message'}
            </Badge>
          </div>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>

        {/* Real-time status badge */}
        <div className="flex items-center gap-1.5">
          {isConnected ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60">
              <WifiOff className="w-3 h-3" />
              Connecting
            </span>
          )}
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 bg-slate-50/30">
        {isLoading ? (
          <div className="text-center py-12 text-xs text-slate-400">Loading conversation history...</div>
        ) : messages.length === 0 ? (
          <div className="text-center py-16 px-4 space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
              <Sparkles className="w-5 h-5" />
            </div>
            <p className="text-sm font-bold text-slate-800">No messages yet</p>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Start the conversation! Say hello to everyone in this community room.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender_id === user?.id;

            return (
              <div
                key={msg.id}
                className={cn('flex items-end gap-2.5 max-w-[80%]', isMe ? 'ml-auto flex-row-reverse' : 'mr-auto')}
              >
                {!isMe && (
                  <Avatar
                    name={msg.sender?.name}
                    src={msg.sender?.avatar_url}
                    size="sm"
                    className="mb-1"
                  />
                )}

                <div className="space-y-1">
                  {!isMe && (
                    <p className="text-[11px] font-semibold text-slate-600 px-1">
                      {msg.sender?.name || 'User'}
                    </p>
                  )}
                  <div
                    className={cn(
                      'p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-2xs break-words',
                      isMe
                        ? 'bg-indigo-600 text-white rounded-br-xs'
                        : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs'
                    )}
                  >
                    {msg.text}
                  </div>
                  <p
                    className={cn(
                      'text-[10px] text-slate-400 px-1',
                      isMe ? 'text-right' : 'text-left'
                    )}
                  >
                    {formatTime(msg.createdAt)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Typing indicator bar */}
      {activeTypers.length > 0 && (
        <div className="px-5 py-1 text-[11px] text-indigo-600 font-medium italic bg-indigo-50/50 flex items-center gap-1.5 animate-pulse">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
          {activeTypers.join(', ')} {activeTypers.length === 1 ? 'is' : 'are'} typing...
        </div>
      )}

      {/* Message Input Footer */}
      <div className="p-3 sm:p-4 border-t border-slate-100 bg-white">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Type your message... (Enter to send)"
            value={inputText}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-inner"
          />

          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={!inputText.trim()}
            className="px-4 shrink-0 rounded-xl"
            rightIcon={<Send className="w-4 h-4" />}
          >
            Send
          </Button>
        </form>
      </div>
    </div>
  );
}
