import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { lessonsService, CreateLessonDto, UpdateLessonDto } from '@/services/lessons.service';
import { COURSES_KEYS } from './useCourses';
import { toast } from 'sonner';

export const LESSONS_KEYS = {
  byCourse: (courseId: string) => ['lessons', 'course', courseId] as const,
};

export function useLessons(courseId: string | undefined) {
  return useQuery({
    queryKey: LESSONS_KEYS.byCourse(courseId || ''),
    queryFn: async () => {
      if (!courseId) throw new Error('courseId is required');
      const res = await lessonsService.getCourseLessons(courseId);
      return res.data;
    },
    enabled: !!courseId,
  });
}

export function useCreateLesson(courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateLessonDto) => lessonsService.createLesson(payload),
    onSuccess: () => {
      toast.success('Lesson created successfully!');
      queryClient.invalidateQueries({ queryKey: LESSONS_KEYS.byCourse(courseId) });
      queryClient.invalidateQueries({ queryKey: COURSES_KEYS.detail(courseId) });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to create lesson');
    },
  });
}

export function useUpdateLesson(lessonId: string, courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateLessonDto) => lessonsService.updateLesson(lessonId, payload),
    onSuccess: () => {
      toast.success('Lesson updated successfully!');
      queryClient.invalidateQueries({ queryKey: LESSONS_KEYS.byCourse(courseId) });
      queryClient.invalidateQueries({ queryKey: COURSES_KEYS.detail(courseId) });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to update lesson');
    },
  });
}
