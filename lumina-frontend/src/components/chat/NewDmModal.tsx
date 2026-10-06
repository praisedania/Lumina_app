'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { useStartConversation } from '@/hooks/useChat';
import { chatService } from '@/services/chat.service';
import { User as UserType } from '@/types';
import {
  User as UserIcon,
  Search,
  Send,
  CheckCircle2,
  GraduationCap,
  Sparkles,
  Users,
  X
} from 'lucide-react';
import { toast } from 'sonner';

export interface NewDmModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NewDmModal({ isOpen, onClose }: NewDmModalProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [users, setUsers] = useState<UserType[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [initialMessage, setInitialMessage] = useState('');
  const startMutation = useStartConversation();

  // Fetch users when modal opens or when searchQuery changes
  useEffect(() => {
    if (!isOpen) {
      setSelectedUser(null);
      setSearchQuery('');
      setInitialMessage('');
      return;
    }

    let isMounted = true;
    const fetchUsers = async () => {
      setIsLoadingUsers(true);
      try {
        const res = await chatService.searchUsers(searchQuery);
        if (isMounted) {
          setUsers(res.data || []);
        }
      } catch (err) {
        console.error('Failed to load users for DM:', err);
      } finally {
        if (isMounted) {
          setIsLoadingUsers(false);
        }
      }
    };

    const timer = setTimeout(() => {
      fetchUsers();
    }, 200);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [isOpen, searchQuery]);

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedUser && !searchQuery.trim()) {
      toast.error('Please select a recipient or type an email address');
      return;
    }

    const payload = selectedUser
      ? { recipientId: selectedUser.id, text: initialMessage.trim() || undefined }
      : { recipientEmail: searchQuery.trim(), text: initialMessage.trim() || undefined };

    startMutation.mutate(payload, {
      onSuccess: (res) => {
        toast.success(`Chat started with ${selectedUser ? selectedUser.name : searchQuery}!`);
        onClose();
        router.push(`/messages/${res.data.conversation.id}`);
      },
      onError: (err: any) => {
        toast.error(err.message || 'Failed to start conversation. Recipient not found.');
      }
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Start a Direct Message"
      description="Select an instructor or fellow student to start a direct private conversation."
      maxWidth="md"
    >
      <form onSubmit={handleStart} className="space-y-4">
        {/* Recipient Selection Section */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Select Recipient
          </label>

          {selectedUser ? (
            <div className="p-3 rounded-xl bg-indigo-50/80 border border-indigo-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar name={selectedUser.name} src={selectedUser.avatar_url} size="md" />
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-bold text-slate-900">{selectedUser.name}</p>
                    <Badge variant={selectedUser.role === 'instructor' ? 'default' : 'secondary'} className="text-[10px] py-0 px-1.5 h-4 capitalize">
                      {selectedUser.role}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500">{selectedUser.email}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="p-1 rounded-lg hover:bg-indigo-100 text-slate-500 hover:text-slate-800 transition-colors"
                title="Change Recipient"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <Input
                placeholder="Search by name or email (e.g. Jane or jane@example.com)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="w-4 h-4 text-slate-400" />}
                autoFocus
              />

              {/* User Results Dropdown / List */}
              <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-200 divide-y divide-slate-100 bg-white">
                {isLoadingUsers ? (
                  <div className="p-3 space-y-2">
                    <Skeleton className="h-10 w-full rounded-lg" />
                    <Skeleton className="h-10 w-full rounded-lg" />
                  </div>
                ) : users.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500">
                    {searchQuery.trim() ? (
                      <p>
                        No registered users found matching &quot;{searchQuery}&quot;. You can still try sending to this email.
                      </p>
                    ) : (
                      <p className="flex items-center justify-center gap-1.5">
                        <Users className="w-4 h-4 text-slate-400" />
                        Type a name or email to search users
                      </p>
                    )}
                  </div>
                ) : (
                  users.map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => setSelectedUser(u)}
                      className="w-full p-2.5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Avatar name={u.name} src={u.avatar_url} size="sm" />
                        <div className="truncate">
                          <p className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                            {u.name}
                          </p>
                          <p className="text-[11px] text-slate-500 truncate">{u.email}</p>
                        </div>
                      </div>

                      <Badge
                        variant={u.role === 'instructor' ? 'default' : 'secondary'}
                        className="text-[10px] py-0 px-1.5 h-4 capitalize shrink-0"
                      >
                        {u.role === 'instructor' && <GraduationCap className="w-3 h-3 mr-0.5" />}
                        {u.role}
                      </Badge>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Message Input */}
        <Textarea
          label="Initial Message (Optional)"
          placeholder="Hi! I wanted to reach out regarding the course discussion..."
          value={initialMessage}
          onChange={(e) => setInitialMessage(e.target.value)}
          rows={3}
        />

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <Button variant="outline" size="sm" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            type="submit"
            disabled={!selectedUser && !searchQuery.trim()}
            isLoading={startMutation.isPending}
            rightIcon={<Send className="w-3.5 h-3.5" />}
          >
            Start Chat
          </Button>
        </div>
      </form>
    </Modal>
  );
}
