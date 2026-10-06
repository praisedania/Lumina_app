import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { coursesService, CourseFilterParams, CreateCourseDto, UpdateCourseDto } from '@/services/courses.service';
import { toast } from 'sonner';

export const COURSES_KEYS = {
  all: ['courses'] as const,
  public: (params?: CourseFilterParams) => ['courses', 'public', params] as const,
  detail: (id: string) => ['courses', 'detail', id] as const,
};

export function usePublicCourses(params?: CourseFilterParams) {
  return useQuery({
    queryKey: COURSES_KEYS.public(params),
    queryFn: async () => {
      const res = await coursesService.getPublicCourses(params);
      return res.data;
    },
  });
}

export function useCourse(id: string | undefined) {
  return useQuery({
    queryKey: COURSES_KEYS.detail(id || ''),
    queryFn: async () => {
      if (!id) throw new Error('Course ID is required');
      const res = await coursesService.getCourseById(id);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useAllCourses() {
  return useQuery({
    queryKey: COURSES_KEYS.all,
    queryFn: async () => {
      const res = await coursesService.getAllCourses();
      return res.data;
    },
  });
}

export function useCreateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateCourseDto) => coursesService.createCourse(payload),
    onSuccess: (data) => {
      toast.success('Course created successfully!');
      queryClient.invalidateQueries({ queryKey: COURSES_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ['courses', 'public'] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to create course');
    },
  });
}

export function useUpdateCourse(courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateCourseDto) => coursesService.updateCourse(courseId, payload),
    onSuccess: (data) => {
      toast.success('Course updated successfully!');
      queryClient.invalidateQueries({ queryKey: COURSES_KEYS.detail(courseId) });
      queryClient.invalidateQueries({ queryKey: COURSES_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ['courses', 'public'] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to update course');
    },
  });
}
