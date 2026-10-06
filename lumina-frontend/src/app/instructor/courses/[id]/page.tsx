'use client';

import React from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import InstructorRoute from '@/components/guards/InstructorRoute';
import InstructorSidebar from '@/components/layout/InstructorSidebar';
import { useCourse } from '@/hooks/useCourses';
import { useAuth } from '@/providers/AuthProvider';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatCurrency } from '@/lib/utils';
import {
  BookOpen,
  Layers,
  Settings,
  MessageSquare,
  ExternalLink,
  Users,
  Clock,
  ArrowLeft,
  Sparkles,
  PlusCircle,
  PlayCircle
} from 'lucide-react';

export default function InstructorCourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const courseId = params.id as string;

  const { data: course, isLoading, error } = useCourse(courseId);

  if (isLoading) {
    return (
      <InstructorRoute>
        <div className="flex-1 flex bg-slate-50/60">
          <InstructorSidebar />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-5xl space-y-6">
            <Skeleton className="h-10 w-48 rounded-xl" />
            <Skeleton className="h-64 w-full rounded-2xl" />
            <Skeleton className="h-48 w-full rounded-2xl" />
          </main>
        </div>
      </InstructorRoute>
    );
  }

  if (error || !course) {
    return (
      <InstructorRoute>
        <div className="flex-1 flex bg-slate-50/60">
          <InstructorSidebar />
          <main className="flex-1 p-8 text-center max-w-md mx-auto my-12 space-y-4">
            <h2 className="text-xl font-bold text-slate-800">Course not found</h2>
            <p className="text-xs text-slate-500">
              The course you are trying to view does not exist or you do not have permission to view it.
            </p>
            <Link href="/instructor/courses">
              <Button variant="primary" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                Back to Courses
              </Button>
            </Link>
          </main>
        </div>
      </InstructorRoute>
    );
  }

  const lessons = course.lessons || [];

  return (
    <InstructorRoute>
      <div className="flex-1 flex bg-slate-50/60">
        <InstructorSidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl">
          {/* Top navigation */}
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-6">
            <Link href="/instructor/courses" className="hover:text-indigo-600 flex items-center gap-1 font-medium">
              <ArrowLeft className="w-3.5 h-3.5" />
              Manage Courses
            </Link>
            <span>/</span>
            <span className="text-slate-800 font-semibold truncate">{course.title}</span>
          </div>

          {/* Header Banner */}
          <Card className="rounded-2xl border-slate-200/80 p-6 mb-8 overflow-hidden relative">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-start sm:items-center gap-5">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200 flex items-center justify-center shadow-sm">
                  {course.thumbnail_url ? (
                    <img
                      src={course.thumbnail_url}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <BookOpen className="w-10 h-10 text-indigo-400" />
                  )}
                </div>

                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary" className="text-xs font-semibold">
                      {course.category || 'General'}
                    </Badge>
                    <span className="text-sm font-extrabold text-indigo-600">
                      {formatCurrency(course.price, course.currency)}
                    </span>
                  </div>

                  <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                    {course.title}
                  </h1>

                  <p className="text-xs text-slate-500 line-clamp-2 max-w-xl">
                    {course.description}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
                <Link href={`/instructor/courses/${course.id}/lessons`}>
                  <Button variant="primary" size="sm" leftIcon={<Layers className="w-4 h-4" />}>
                    Manage Lessons
                  </Button>
                </Link>

                <Link href={`/instructor/courses/${course.id}/edit`}>
                  <Button variant="outline" size="sm" leftIcon={<Settings className="w-4 h-4" />}>
                    Edit Details
                  </Button>
                </Link>

                <Link href={`/courses/${course.id}/room`}>
                  <Button variant="outline" size="sm" leftIcon={<MessageSquare className="w-4 h-4" />}>
                    Chat Room
                  </Button>
                </Link>

                <Link href={`/courses/${course.id}`} target="_blank">
                  <Button variant="ghost" size="sm" leftIcon={<ExternalLink className="w-4 h-4 text-slate-400" />}>
                    Public Preview
                  </Button>
                </Link>
              </div>
            </div>
          </Card>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <Card className="p-4 rounded-xl border-slate-200/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">Curriculum Size</p>
                  <p className="text-lg font-extrabold text-slate-900">{lessons.length} Lessons</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 rounded-xl border-slate-200/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">Enrolled Students</p>
                  <p className="text-lg font-extrabold text-slate-900">{course.enrollmentCount || 0} Learners</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 rounded-xl border-slate-200/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">Course Pricing</p>
                  <p className="text-lg font-extrabold text-slate-900">{formatCurrency(course.price, course.currency)}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Lessons Curriculum Section */}
          <Card className="rounded-2xl border-slate-200/80">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-900">Curriculum Overview</CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  {lessons.length} lessons published in this course. Learners can take them in any order.
                </CardDescription>
              </div>

              <Link href={`/instructor/courses/${course.id}/lessons`}>
                <Button variant="outline" size="sm" leftIcon={<PlusCircle className="w-3.5 h-3.5 text-indigo-600" />}>
                  Add / Edit Lessons
                </Button>
              </Link>
            </CardHeader>

            <CardContent>
              {lessons.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                  <Layers className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-700">No lessons added yet</p>
                  <p className="text-xs text-slate-400 mt-0.5 mb-4">
                    Upload video, markdown, or text modules for your learners.
                  </p>
                  <Link href={`/instructor/courses/${course.id}/lessons`}>
                    <Button variant="primary" size="sm">
                      Create First Lesson
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {lessons.map((lesson, idx) => (
                    <div
                      key={lesson.id}
                      className="py-3.5 flex items-center justify-between gap-4 hover:bg-slate-50/50 px-2 rounded-lg transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-7 h-7 rounded-lg bg-slate-100 text-slate-500 text-xs font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-900 truncate">
                            {lesson.title}
                          </p>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                            <span>{lesson.video_url ? 'Video Lesson' : 'Reading / Notes'}</span>
                            <span>•</span>
                            <span>Lesson #{idx + 1}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Link href={`/instructor/courses/${course.id}/lessons`}>
                          <Button variant="ghost" size="sm" className="text-xs text-indigo-600 hover:text-indigo-700">
                            Edit
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </InstructorRoute>
  );
}
