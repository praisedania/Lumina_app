import api from '@/lib/api';
import { ApiResponse, Course, PublicCoursesData } from '@/types';

export interface CourseFilterParams {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'createdAt' | 'price' | 'title' | 'category';
  sortOrder?: 'ASC' | 'DESC';
  page?: number;
  limit?: number;
}

export interface CreateCourseDto {
  title: string;
  description?: string;
  category?: string;
  thumbnail_url?: string;
  price?: number;
  currency?: string;
}

export interface UpdateCourseDto extends Partial<CreateCourseDto> {}

export const coursesService = {
  async getPublicCourses(params?: CourseFilterParams): Promise<ApiResponse<PublicCoursesData>> {
    const response = await api.get<ApiResponse<PublicCoursesData>>('/courses/home', {
      params,
    });
    return response.data;
  },

  async getAllCourses(): Promise<ApiResponse<Course[]>> {
    const response = await api.get<ApiResponse<Course[]>>('/courses');
    return response.data;
  },

  async getCourseById(id: string): Promise<ApiResponse<Course>> {
    const response = await api.get<ApiResponse<Course>>(`/courses/${id}`);
    return response.data;
  },

  async createCourse(payload: CreateCourseDto): Promise<ApiResponse<Course>> {
    const response = await api.post<ApiResponse<Course>>('/courses', payload);
    return response.data;
  },

  async updateCourse(id: string, payload: UpdateCourseDto): Promise<ApiResponse<Course>> {
    const response = await api.patch<ApiResponse<Course>>(`/courses/${id}`, payload);
    return response.data;
  },
};
