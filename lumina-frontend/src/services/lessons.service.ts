import api from '@/lib/api';
import { ApiResponse, Lesson } from '@/types';

export interface CreateLessonDto {
  course_id: string;
  title: string;
  content?: string;
  video_url?: string;
  order_index?: number;
}

export interface UpdateLessonDto {
  title?: string;
  content?: string;
  video_url?: string;
  order_index?: number;
}

export const lessonsService = {
  async getCourseLessons(courseId: string): Promise<ApiResponse<Lesson[]>> {
    const response = await api.get<ApiResponse<Lesson[]>>(`/lessons/course/${courseId}`);
    return response.data;
  },

  async createLesson(payload: CreateLessonDto): Promise<ApiResponse<Lesson>> {
    const response = await api.post<ApiResponse<Lesson>>('/lessons', payload);
    return response.data;
  },

  async updateLesson(id: string, payload: UpdateLessonDto): Promise<ApiResponse<Lesson>> {
    const response = await api.patch<ApiResponse<Lesson>>(`/lessons/${id}`, payload);
    return response.data;
  },
};
