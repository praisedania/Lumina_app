'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import InstructorRoute from '@/components/guards/InstructorRoute';
import InstructorSidebar from '@/components/layout/InstructorSidebar';
import { useInstructorStats, useSaveBankDetails } from '@/hooks/useInstructor';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Banknote, Building2, CreditCard, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';

const bankSchema = z.object({
  bank_name: z.string().min(2, 'Bank name is required'),
  bank_code: z.string().min(3, 'Bank code is required (e.g. 058 for GTBank, 011 for First Bank)'),
  account_number: z.string().min(10, 'Account number must be 10 digits').max(10, '10 digits required'),
  account_name: z.string().min(2, 'Account holder name is required'),
});

type BankFormData = z.infer<typeof bankSchema>;

export default function InstructorPayoutsPage() {
  const { data: stats, isLoading } = useInstructorStats();
  const saveBankMutation = useSaveBankDetails();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BankFormData>({
    resolver: zodResolver(bankSchema),
  });

  const onSubmit = (data: BankFormData) => {
    saveBankMutation.mutate(data);
  };

  return (
    <InstructorRoute>
      <div className="flex-1 flex bg-slate-50/60">
        <InstructorSidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl">
          <div className="pb-6 border-b border-slate-200/80 mb-8">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Earnings & Payout Setup
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Connect your settlement bank account to receive 80% split payouts via Paystack automatically.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left side: Bank setup form */}
            <div className="lg:col-span-1 space-y-6">
              <Card className="rounded-2xl border-slate-200/80 shadow-xs">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-1">
                    <Building2 className="w-4 h-4 text-indigo-600" />
                    <CardTitle className="text-base">Settlement Account</CardTitle>
                  </div>
                  <CardDescription className="text-xs">
                    Configure your bank details to enable Paystack Subaccount splits.
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <Input
                      label="Bank Name"
                      placeholder="e.g. GTBank, Access Bank, Zenith"
                      error={errors.bank_name?.message}
                      {...register('bank_name')}
                    />

                    <Input
                      label="Bank Code"
                      placeholder="e.g. 058 (GTBank), 057 (Zenith)"
                      error={errors.bank_code?.message}
                      helperText="Official CBN 3-digit bank code."
                      {...register('bank_code')}
                    />

                    <Input
                      label="NUBAN Account Number"
                      placeholder="0123456789"
                      maxLength={10}
                      error={errors.account_number?.message}
                      {...register('account_number')}
                    />

                    <Input
                      label="Account Name"
                      placeholder="John Doe"
                      error={errors.account_name?.message}
                      {...register('account_name')}
                    />

                    <Button
                      type="submit"
                      variant="primary"
                      size="md"
                      className="w-full mt-2"
                      isLoading={isSubmitting || saveBankMutation.isPending}
                    >
                      Save Settlement Bank
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Security info card */}
              <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-2 text-xs text-indigo-900">
                <div className="flex items-center gap-2 font-bold">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  <span>Automated Revenue Split</span>
                </div>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  Instructors automatically receive 80% of course revenue for each student purchase directly into their bank account via Paystack Subaccounts.
                </p>
              </div>
            </div>

            {/* Right side: Earnings breakdown & Recent Sales */}
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card className="p-6 rounded-2xl border-slate-200/80">
                  <p className="text-xs font-semibold text-slate-500 uppercase">Total Net Earnings</p>
                  <p className="text-3xl font-black text-slate-900 mt-2">
                    {isLoading ? <Skeleton className="h-9 w-28" /> : formatCurrency(stats?.totalEarnings || 0)}
                  </p>
                  <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Verified instructor share
                  </p>
                </Card>

                <Card className="p-6 rounded-2xl border-slate-200/80">
                  <p className="text-xs font-semibold text-slate-500 uppercase">Total Courses Sold</p>
                  <p className="text-3xl font-black text-slate-900 mt-2">
                    {isLoading ? <Skeleton className="h-9 w-16" /> : stats?.totalCoursesSold || 0}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">Paid enrollments through checkout</p>
                </Card>
              </div>

              {/* Recent Sales History */}
              <Card className="rounded-2xl border-slate-200/80 p-6 space-y-4">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Transaction & Sales History
                </h3>

                {isLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : !stats?.recentSales || stats.recentSales.length === 0 ? (
                  <div className="text-center py-10 text-xs text-slate-500">
                    No transactions recorded yet. Once students purchase your paid courses, your earnings will appear here.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-600">
                      <thead className="bg-slate-50 text-slate-400 uppercase font-semibold">
                        <tr>
                          <th className="p-3 rounded-l-lg">Course</th>
                          <th className="p-3">Student</th>
                          <th className="p-3">Gross Amount</th>
                          <th className="p-3 rounded-r-lg">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {stats.recentSales.map((sale, i) => (
                          <tr key={i} className="hover:bg-slate-50/50">
                            <td className="p-3 font-semibold text-slate-900">{sale.courseTitle}</td>
                            <td className="p-3">{sale.username}</td>
                            <td className="p-3 font-bold text-emerald-600">
                              {formatCurrency(sale.amount)}
                            </td>
                            <td className="p-3 text-slate-400">{formatDate(sale.date)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </main>
      </div>
    </InstructorRoute>
  );
}
