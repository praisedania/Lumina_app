import api from '@/lib/api';
import { ApiResponse, BankDetailsData, InstructorStatsData } from '@/types';

export interface BankDetailsDto {
  bank_name: string;
  bank_code: string;
  account_number: string;
  account_name: string;
}

export const instructorService = {
  async getEarningsStats(): Promise<ApiResponse<InstructorStatsData>> {
    const response = await api.get<ApiResponse<InstructorStatsData>>('/instructor/dashboard/stats');
    return response.data;
  },

  async saveBankDetails(payload: BankDetailsDto): Promise<ApiResponse<BankDetailsData>> {
    const response = await api.post<ApiResponse<BankDetailsData>>(
      '/instructor/profile/bank-details',
      payload
    );
    return response.data;
  },
};
