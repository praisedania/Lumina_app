'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/guards/ProtectedRoute';
import DashboardSidebar from '@/components/layout/DashboardSidebar';
import { useMyEnrollments } from '@/hooks/useEnrollments';
import { Card, CardContent } from '@/components/ui/Card';
import { Progress } from '@/components/ui/Progress';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import { BookOpen, PlayCircle, MessageSquare, Compass, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function MyLearningPage() {
  const { data: enrollments, isLoading } = useMyEnrollments();
  const [filter, setFilter] = useState<'all' | 'in_progress' | 'completed'>('all');

  const filteredEnrollments = (enrollments || []).filter((enrollment) => {
    const completedCount = enrollment.completed_lesson_ids?.length || 0;
    if (filter === 'completed') return completedCount > 0; // or 100%
    if (filter === 'in_progress') return completedCount >= 0;
    return true;
  });

  return (
    <ProtectedRoute>
      <div className="flex-1 flex bg-slate-50/60">
        <DashboardSidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200/80 mb-6 gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">My Learning</h1>
              <p className="text-xs text-slate-500 mt-1">
                Your enrolled courses. Click any course to study lessons in your desired order.
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-white border border-slate-200 rounded-xl shadow-2xs">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  filter === 'all'
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Courses ({enrollments?.length || 0})
              </button>
              <button
                onClick={() => setFilter('in_progress')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  filter === 'in_progress'
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                In Progress
              </button>
              <button
                onClick={() => setFilter('completed')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  filter === 'completed'
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Completed
              </button>
            </div>
          </div>

          {/* Enrollments list */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-5 rounded-2xl bg-white border border-slate-200 space-y-4">
                  <Skeleton className="aspect-video w-full rounded-xl" />
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-2 w-full" />
                </div>
              ))}
            </div>
          ) : filteredEnrollments.length === 0 ? (
            <div className="p-12 text-center rounded-2xl border border-dashed border-slate-200 bg-white max-w-md mx-auto my-12 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800">No courses in this filter</h3>
              <p className="text-xs text-slate-500">
                You haven&apos;t enrolled in any courses yet or none match this filter.
              </p>
              <Link href="/courses">
                <Button variant="primary" size="sm" rightIcon={<Compass className="w-4 h-4" />}>
                  Explore Courses
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEnrollments.map((enrollment) => {
                const course = enrollment.course;
                const completedCount = enrollment.completed_lesson_ids?.length || 0;

                return (
                  <Card
                    key={enrollment.id}
                    className="overflow-hidden rounded-2xl border-slate-200/80 hover:border-slate-300 hover:shadow-xs transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Thumbnail */}
                      <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
                        {course?.thumbnail_url ? (
                          <img
                            src={course.thumbnail_url}
                            alt={course.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gradient-to-tr from-slate-100 to-indigo-50 text-indigo-400">
                            <BookOpen className="h-10 w-10 stroke-[1.5]" />
                          </div>
                        )}
                        <div className="absolute top-3 right-3">
                          <Badge variant="secondary" className="bg-white/95 backdrop-blur-xs text-slate-800 font-semibold text-xs shadow-2xs">
                            {completedCount} Completed
                          </Badge>
                        </div>
                      </div>

                      {/* Info */}
                      <CardContent className="p-5 space-y-3">
                        <h3 className="text-base font-bold text-slate-900 line-clamp-1">
                          {course?.title || 'Course'}
                        </h3>
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                          {course?.description || 'Active enrolled course on Lumina.'}
                        </p>

                        <div className="space-y-1.5 pt-2">
                          <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
                            <span>Completed Lessons</span>
                            <span className="font-bold text-indigo-600">{completedCount}</span>
                          </div>
                          <Progress value={completedCount} max={Math.max(completedCount, 1)} size="sm" />
                        </div>
                      </CardContent>
                    </div>

                    <div className="p-5 pt-0 flex items-center gap-2">
                      <Link href={`/my-learning/${enrollment.course_id}`} className="flex-1">
                        <Button
                          variant="primary"
                          size="sm"
                          className="w-full"
                          rightIcon={<PlayCircle className="w-3.5 h-3.5" />}
                        >
                          Start / Continue
                        </Button>
                      </Link>

                      <Link href={`/courses/${enrollment.course_id}/room`}>
                        <Button
                          variant="outline"
                          size="sm"
                          title="Course Chat Room"
                          className="border-indigo-100 text-indigo-600 hover:bg-indigo-50"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
