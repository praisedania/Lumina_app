import api from '@/lib/api';
import { ApiResponse, ChatHistoryData, Conversation, Message, MyConversationsData, User } from '@/types';

export interface StartConversationDto {
  recipientId?: string;
  recipientUsername?: string;
  recipientEmail?: string;
  email?: string;
  name?: string;
  text?: string;
}

export interface SendMessageDto {
  conversationId: string;
  text: string;
}

export const chatService = {
  async getMyConversations(): Promise<ApiResponse<MyConversationsData>> {
    const response = await api.get<ApiResponse<MyConversationsData>>('/chat/conversations');
    return response.data;
  },

  async searchUsers(query = ''): Promise<ApiResponse<User[]>> {
    const response = await api.get<ApiResponse<User[]>>('/chat/users', {
      params: { query: query.trim() || undefined }
    });
    return response.data;
  },

  async getChatHistory(
    conversationId: string,
    page = 1,
    limit = 50
  ): Promise<ApiResponse<ChatHistoryData>> {
    const response = await api.get<ApiResponse<ChatHistoryData>>(
      `/chat/history/${conversationId}`,
      {
        params: { page, limit },
      }
    );
    return response.data;
  },

  async getCourseConversation(courseId: string): Promise<ApiResponse<Conversation>> {
    const response = await api.get<ApiResponse<Conversation>>(`/chat/course/${courseId}`);
    return response.data;
  },

  async startConversation(
    payload: StartConversationDto
  ): Promise<ApiResponse<{ conversation: Conversation; message?: Message | null }>> {
    const response = await api.post<ApiResponse<{ conversation: Conversation; message?: Message | null }>>(
      '/chat/conversation',
      payload
    );
    return response.data;
  },

  async sendMessage(payload: SendMessageDto): Promise<ApiResponse<Message>> {
    const response = await api.post<ApiResponse<Message>>('/chat/message', payload);
    return response.data;
  },
};

