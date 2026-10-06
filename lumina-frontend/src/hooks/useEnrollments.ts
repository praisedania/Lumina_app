import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { enrollmentService } from '@/services/enrollment.service';
import { COURSES_KEYS } from './useCourses';
import { toast } from 'sonner';

export const ENROLLMENTS_KEYS = {
  my: ['enrollments', 'my'] as const,
};

export function useMyEnrollments() {
  return useQuery({
    queryKey: ENROLLMENTS_KEYS.my,
    queryFn: async () => {
      const res = await enrollmentService.getMyEnrollments();
      return res.data;
    },
  });
}

export function useEnrollCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ courseId, isPaid }: { courseId: string; isPaid?: boolean }) => {
      if (isPaid) {
        const checkoutRes = await enrollmentService.initializeCheckout(courseId);
        return checkoutRes;
      } else {
        const res = await enrollmentService.enrollInCourse(courseId);
        return res;
      }
    },
    onSuccess: (data: any, variables) => {
      // If paid checkout returned authorization URL
      if (data?.data?.authorizationUrl) {
        window.location.href = data.data.authorizationUrl;
        return;
      }
      toast.success('Successfully enrolled in course!');
      queryClient.invalidateQueries({ queryKey: ENROLLMENTS_KEYS.my });
      queryClient.invalidateQueries({ queryKey: COURSES_KEYS.detail(variables.courseId) });
      queryClient.invalidateQueries({ queryKey: ['courses', 'public'] });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to enroll in course');
    },
  });
}

export function useToggleProgress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (lessonId: string) => enrollmentService.toggleLessonProgress(lessonId),
    onSuccess: (res) => {
      toast.success(res.message || 'Progress updated');
      queryClient.invalidateQueries({ queryKey: ENROLLMENTS_KEYS.my });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to update progress');
    },
  });
}
