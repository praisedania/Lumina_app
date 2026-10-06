import api from '@/lib/api';
import { ApiResponse, Enrollment } from '@/types';

export interface ToggleProgressResponseData {
  completed_lesson_ids: string[];
  progress: number;
}

export interface CheckoutResponseData {
  enrollmentId?: string;
  free?: boolean;
  authorizationUrl?: string;
  reference?: string;
}

export const enrollmentService = {
  async enrollInCourse(courseId: string): Promise<ApiResponse<Enrollment>> {
    const response = await api.post<ApiResponse<Enrollment>>(`/enroll/${courseId}`);
    return response.data;
  },

  async toggleLessonProgress(lessonId: string): Promise<ApiResponse<ToggleProgressResponseData>> {
    const response = await api.patch<ApiResponse<ToggleProgressResponseData>>(
      `/enroll/progress/${lessonId}`
    );
    return response.data;
  },

  async getMyEnrollments(): Promise<ApiResponse<Enrollment[]>> {
    const response = await api.get<ApiResponse<Enrollment[]>>('/enroll/my');
    return response.data;
  },

  async initializeCheckout(courseId: string): Promise<ApiResponse<CheckoutResponseData>> {
    const response = await api.post<ApiResponse<CheckoutResponseData>>('/payments/checkout', {
      courseId,
    });
    return response.data;
  },
};
