import api from '@/lib/api';
import { ApiResponse, Course, User } from '@/types';

export interface SystemStats {
  totalUsers: number;
  totalCourses: number;
  totalEnrollments: number;
  totalTransactions?: number;
}

export const adminService = {
  async getSystemStats(): Promise<ApiResponse<SystemStats>> {
    const response = await api.get<ApiResponse<SystemStats>>('/admin/stats');
    return response.data;
  },

  async getAllUsers(): Promise<ApiResponse<User[]>> {
    const response = await api.get<ApiResponse<User[]>>('/admin/users');
    return response.data;
  },

  async deleteUser(userId: string): Promise<ApiResponse<{ message: string }>> {
    const response = await api.delete<ApiResponse<{ message: string }>>(`/admin/users/${userId}`);
    return response.data;
  },

  async getAllCourses(): Promise<ApiResponse<Course[]>> {
    const response = await api.get<ApiResponse<Course[]>>('/admin/courses');
    return response.data;
  },

  async deleteCourse(courseId: string): Promise<ApiResponse<{ message: string }>> {
    const response = await api.delete<ApiResponse<{ message: string }>>(`/admin/courses/${courseId}`);
    return response.data;
  },

  async makeAdmin(userId: string): Promise<ApiResponse<User>> {
    const response = await api.patch<ApiResponse<User>>(`/admin/make-admin/${userId}`);
    return response.data;
  },
};
