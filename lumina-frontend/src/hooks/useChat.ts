import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatService, StartConversationDto, SendMessageDto } from '@/services/chat.service';
import { toast } from 'sonner';

export const CHAT_KEYS = {
  conversations: ['chat', 'conversations'] as const,
  history: (conversationId: string, page?: number) => ['chat', 'history', conversationId, page] as const,
  courseRoom: (courseId: string) => ['chat', 'courseRoom', courseId] as const,
};

export function useConversations() {
  return useQuery({
    queryKey: CHAT_KEYS.conversations,
    queryFn: async () => {
      const res = await chatService.getMyConversations();
      return res.data;
    },
  });
}

export function useChatHistory(conversationId: string | undefined, page = 1) {
  return useQuery({
    queryKey: CHAT_KEYS.history(conversationId || '', page),
    queryFn: async () => {
      if (!conversationId) throw new Error('conversationId is required');
      const res = await chatService.getChatHistory(conversationId, page);
      return res.data;
    },
    enabled: !!conversationId,
  });
}

export function useCourseRoom(courseId: string | undefined) {
  return useQuery({
    queryKey: CHAT_KEYS.courseRoom(courseId || ''),
    queryFn: async () => {
      if (!courseId) throw new Error('courseId is required');
      const res = await chatService.getCourseConversation(courseId);
      return res.data;
    },
    enabled: !!courseId,
  });
}

export function useStartConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: StartConversationDto) => chatService.startConversation(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CHAT_KEYS.conversations });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to start conversation');
    },
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SendMessageDto) => chatService.sendMessage(payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: CHAT_KEYS.history(variables.conversationId) });
      queryClient.invalidateQueries({ queryKey: CHAT_KEYS.conversations });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to send message');
    },
  });
}
