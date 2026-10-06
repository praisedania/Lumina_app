'use client';

import React from 'react';
import Link from 'next/link';
import InstructorRoute from '@/components/guards/InstructorRoute';
import InstructorSidebar from '@/components/layout/InstructorSidebar';
import { useAuth } from '@/providers/AuthProvider';
import { useAllCourses } from '@/hooks/useCourses';
import { useInstructorStats } from '@/hooks/useInstructor';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  BookPlus,
  BookOpen,
  Users,
  Banknote,
  ArrowRight,
  Sparkles,
  Layers,
  Settings,
} from 'lucide-react';

export default function InstructorDashboardPage() {
  const { user } = useAuth();
  const { data: allCourses, isLoading: coursesLoading } = useAllCourses();
  const { data: stats, isLoading: statsLoading } = useInstructorStats();

  // Filter courses owned by this instructor
  const myCourses = (allCourses || []).filter((c) => c.instructor_id === user?.id);

  // Calculate total students enrolled across all my courses
  const totalStudents = myCourses.reduce(
    (acc, curr) => acc + (curr.enrollmentCount || 0),
    0
  );

  return (
    <InstructorRoute>
      <div className="flex-1 flex bg-slate-50/60">
        <InstructorSidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200/80 mb-8 gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                Teaching Studio
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Instructor Dashboard
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Manage your courses, view student enrollment metrics, and track Paystack payouts.
              </p>
            </div>

            <Link href="/instructor/courses/create">
              <Button variant="primary" size="md" leftIcon={<BookPlus className="w-4 h-4" />}>
                Create New Course
              </Button>
            </Link>
          </div>

          {/* Metric Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="rounded-2xl p-5 border-slate-200/80">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-500 uppercase">My Courses</p>
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                  <BookOpen className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900 mt-2">
                {coursesLoading ? <Skeleton className="h-8 w-12" /> : myCourses.length}
              </p>
            </Card>

            <Card className="rounded-2xl p-5 border-slate-200/80">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-500 uppercase">Total Students</p>
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900 mt-2">
                {coursesLoading ? <Skeleton className="h-8 w-12" /> : totalStudents}
              </p>
            </Card>

            <Card className="rounded-2xl p-5 border-slate-200/80">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-500 uppercase">Courses Sold</p>
                <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                  <Layers className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900 mt-2">
                {statsLoading ? <Skeleton className="h-8 w-12" /> : stats?.totalCoursesSold || 0}
              </p>
            </Card>

            <Card className="rounded-2xl p-5 border-slate-200/80">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-500 uppercase">Net Earnings</p>
                <div className="p-2 rounded-xl bg-violet-50 text-violet-600">
                  <Banknote className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900 mt-2">
                {statsLoading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  formatCurrency(stats?.totalEarnings || 0)
                )}
              </p>
            </Card>
          </div>

          {/* Your Courses Section */}
          <div className="space-y-4 mb-10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Your Published Courses</h2>
                <p className="text-xs text-slate-500">Edit curriculum, add lessons, or view rooms</p>
              </div>
              <Link href="/instructor/courses">
                <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                  View All ({myCourses.length})
                </Button>
              </Link>
            </div>

            {coursesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Skeleton className="h-44 rounded-2xl w-full" />
                <Skeleton className="h-44 rounded-2xl w-full" />
              </div>
            ) : myCourses.length === 0 ? (
              <div className="p-10 rounded-2xl border border-dashed border-slate-200 bg-white text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                  <BookPlus className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">You haven&apos;t created any courses yet</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                    Start publishing courses with order-free lessons and automatic live community rooms.
                  </p>
                </div>
                <Link href="/instructor/courses/create">
                  <Button variant="primary" size="sm">
                    Create Your First Course
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {myCourses.slice(0, 4).map((c) => (
                  <Card key={c.id} className="p-5 border-slate-200/80 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <Badge variant="secondary">{c.category || 'General'}</Badge>
                        <span className="text-xs font-bold text-slate-900">
                          {formatCurrency(c.price, c.currency)}
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-slate-900 truncate mb-1">{c.title}</h4>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
                        {c.description || 'No description provided.'}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      <span className="text-xs text-slate-500 font-medium">
                        {c.enrollmentCount || 0} students enrolled
                      </span>
                      <div className="flex items-center gap-2">
                        <Link href={`/instructor/courses/${c.id}/lessons`}>
                          <Button variant="outline" size="sm">
                            Manage Lessons
                          </Button>
                        </Link>
                        <Link href={`/instructor/courses/${c.id}/edit`}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Settings className="w-4 h-4 text-slate-600" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Recent Sales Table */}
          {stats?.recentSales && stats.recentSales.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Recent Course Sales
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-slate-400 uppercase font-semibold">
                    <tr>
                      <th className="p-3 rounded-l-lg">Course</th>
                      <th className="p-3">Student</th>
                      <th className="p-3">Amount</th>
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
            </div>
          )}
        </main>
      </div>
    </InstructorRoute>
  );
}
