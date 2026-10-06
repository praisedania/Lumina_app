import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '@/services/admin.service';
import { toast } from 'sonner';

export const ADMIN_KEYS = {
  stats: ['admin', 'stats'] as const,
  users: ['admin', 'users'] as const,
  courses: ['admin', 'courses'] as const,
};

export function useAdminStats() {
  return useQuery({
    queryKey: ADMIN_KEYS.stats,
    queryFn: async () => {
      const res = await adminService.getSystemStats();
      return res.data;
    },
  });
}

export function useAdminUsers() {
  return useQuery({
    queryKey: ADMIN_KEYS.users,
    queryFn: async () => {
      const res = await adminService.getAllUsers();
      return res.data;
    },
  });
}

export function useAdminCourses() {
  return useQuery({
    queryKey: ADMIN_KEYS.courses,
    queryFn: async () => {
      const res = await adminService.getAllCourses();
      return res.data;
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => adminService.deleteUser(userId),
    onSuccess: () => {
      toast.success('User deleted successfully');
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.users });
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.stats });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to delete user');
    },
  });
}

export function useDeleteCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (courseId: string) => adminService.deleteCourse(courseId),
    onSuccess: () => {
      toast.success('Course deleted successfully');
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.courses });
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.stats });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to delete course');
    },
  });
}

export function useMakeAdmin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => adminService.makeAdmin(userId),
    onSuccess: () => {
      toast.success('User granted Admin privileges');
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.users });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to make admin');
    },
  });
}
