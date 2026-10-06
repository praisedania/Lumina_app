'use client';

import React from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/guards/ProtectedRoute';
import DashboardSidebar from '@/components/layout/DashboardSidebar';
import { useAuth } from '@/providers/AuthProvider';
import { useMyEnrollments } from '@/hooks/useEnrollments';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Progress } from '@/components/ui/Progress';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import {
  BookOpen,
  CheckCircle2,
  Trophy,
  ArrowRight,
  Compass,
  MessageSquare,
  Sparkles,
  PlayCircle,
  TrendingUp,
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: enrollments, isLoading } = useMyEnrollments();

  // Compute summary stats
  const totalEnrolled = enrollments?.length || 0;
  let totalLessonsCompleted = 0;
  let completedCoursesCount = 0;
  let totalProgressSum = 0;

  if (enrollments && enrollments.length > 0) {
    enrollments.forEach((e) => {
      const completedCount = e.completed_lesson_ids?.length || 0;
      totalLessonsCompleted += completedCount;
      // We can check if all completed if course lessons available, or if completedCount > 0
      totalProgressSum += completedCount;
    });
  }

  return (
    <ProtectedRoute>
      <div className="flex-1 flex bg-slate-50/60">
        <DashboardSidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl">
          {/* Welcome Banner */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-700 text-white shadow-md shadow-indigo-500/10 mb-8 relative overflow-hidden">
            <div className="relative z-10 max-w-2xl space-y-2">
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-xs font-semibold">
                Student Dashboard
              </Badge>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Welcome back, {user?.name}!
              </h1>
              <p className="text-indigo-100 text-xs sm:text-sm leading-relaxed">
                Continue your learning journey without restrictions. Jump into any lesson or connect with peers in course rooms.
              </p>
            </div>
            <div className="absolute right-0 bottom-0 translate-x-8 translate-y-8 opacity-10 pointer-events-none">
              <Sparkles className="w-64 h-64 text-white" />
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="rounded-2xl border-slate-200/80 p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Enrolled Courses
                </p>
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                  <BookOpen className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900 mt-2">
                {isLoading ? <Skeleton className="h-8 w-12" /> : totalEnrolled}
              </p>
            </Card>

            <Card className="rounded-2xl border-slate-200/80 p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Lessons Completed
                </p>
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900 mt-2">
                {isLoading ? <Skeleton className="h-8 w-12" /> : totalLessonsCompleted}
              </p>
            </Card>

            <Card className="rounded-2xl border-slate-200/80 p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Course Rooms
                </p>
                <div className="p-2 rounded-xl bg-violet-50 text-violet-600">
                  <MessageSquare className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900 mt-2">
                {isLoading ? <Skeleton className="h-8 w-12" /> : totalEnrolled}
              </p>
            </Card>

            <Card className="rounded-2xl border-slate-200/80 p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Learning Mode
                </p>
                <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <p className="text-base font-bold text-slate-900 mt-3 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
                Order-Free
              </p>
            </Card>
          </div>

          {/* Continue Learning Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Continue Learning</h2>
                <p className="text-xs text-slate-500">Pick up right where you left off</p>
              </div>
              <Link href="/my-learning">
                <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                  View All Enrollments
                </Button>
              </Link>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Skeleton className="h-40 rounded-2xl w-full" />
                <Skeleton className="h-40 rounded-2xl w-full" />
              </div>
            ) : !enrollments || enrollments.length === 0 ? (
              <div className="p-10 rounded-2xl border border-dashed border-slate-200 bg-white text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                  <Compass className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">No active enrollments yet</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    You haven&apos;t enrolled in any courses yet. Browse our catalog to start learning.
                  </p>
                </div>
                <Link href="/courses">
                  <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                    Browse Courses
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {enrollments.slice(0, 4).map((enrollment) => {
                  const course = enrollment.course;
                  const completedCount = enrollment.completed_lesson_ids?.length || 0;

                  return (
                    <Card
                      key={enrollment.id}
                      className="p-5 border-slate-200/80 hover:border-slate-300 hover:shadow-xs transition-all flex flex-col justify-between"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-xl bg-slate-100 shrink-0 overflow-hidden border border-slate-100 flex items-center justify-center">
                          {course?.thumbnail_url ? (
                            <img
                              src={course.thumbnail_url}
                              alt={course.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <BookOpen className="w-6 h-6 text-indigo-400" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm font-bold text-slate-900 truncate">
                            {course?.title || 'Course'}
                          </h4>
                          <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                            {course?.description || 'Active course'}
                          </p>

                          <div className="mt-3 space-y-1.5">
                            <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
                              <span>{completedCount} lessons completed</span>
                            </div>
                            <Progress value={completedCount} max={Math.max(completedCount, 1)} size="sm" />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-5 pt-3 border-t border-slate-100">
                        <Link href={`/my-learning/${enrollment.course_id}`} className="flex-1">
                          <Button variant="primary" size="sm" className="w-full" rightIcon={<PlayCircle className="w-3.5 h-3.5" />}>
                            Resume
                          </Button>
                        </Link>
                        <Link href={`/courses/${enrollment.course_id}/room`}>
                          <Button variant="outline" size="sm" title="Course Room">
                            <MessageSquare className="w-4 h-4 text-slate-600" />
                          </Button>
                        </Link>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
