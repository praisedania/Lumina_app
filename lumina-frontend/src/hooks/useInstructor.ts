import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { instructorService, BankDetailsDto } from '@/services/instructor.service';
import { toast } from 'sonner';

export const INSTRUCTOR_KEYS = {
  stats: ['instructor', 'stats'] as const,
};

export function useInstructorStats() {
  return useQuery({
    queryKey: INSTRUCTOR_KEYS.stats,
    queryFn: async () => {
      const res = await instructorService.getEarningsStats();
      return res.data;
    },
  });
}

export function useSaveBankDetails() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: BankDetailsDto) => instructorService.saveBankDetails(payload),
    onSuccess: () => {
      toast.success('Bank details and payout account saved successfully!');
      queryClient.invalidateQueries({ queryKey: INSTRUCTOR_KEYS.stats });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to save bank details');
    },
  });
}
