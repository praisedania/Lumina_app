'use client';

import React from 'react';
import Link from 'next/link';
import InstructorRoute from '@/components/guards/InstructorRoute';
import InstructorSidebar from '@/components/layout/InstructorSidebar';
import { useAuth } from '@/providers/AuthProvider';
import { useAllCourses } from '@/hooks/useCourses';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatCurrency } from '@/lib/utils';
import {
  BookPlus,
  BookOpen,
  Users,
  Settings,
  Layers,
  MessageSquare,
  ExternalLink,
} from 'lucide-react';

export default function InstructorCoursesPage() {
  const { user } = useAuth();
  const { data: allCourses, isLoading } = useAllCourses();

  const myCourses = (allCourses || []).filter((c) => c.instructor_id === user?.id);

  return (
    <InstructorRoute>
      <div className="flex-1 flex bg-slate-50/60">
        <InstructorSidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200/80 mb-8 gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Manage Courses
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Your courses, curriculum lessons, and live community chat rooms.
              </p>
            </div>

            <Link href="/instructor/courses/create">
              <Button variant="primary" size="sm" leftIcon={<BookPlus className="w-4 h-4" />}>
                Create New Course
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-28 rounded-2xl w-full" />
              <Skeleton className="h-28 rounded-2xl w-full" />
              <Skeleton className="h-28 rounded-2xl w-full" />
            </div>
          ) : myCourses.length === 0 ? (
            <div className="p-12 text-center rounded-2xl border border-dashed border-slate-200 bg-white max-w-md mx-auto my-12 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800">No courses published yet</h3>
              <p className="text-xs text-slate-500">
                You haven&apos;t created any courses yet. Get started and share your knowledge!
              </p>
              <Link href="/instructor/courses/create">
                <Button variant="primary" size="sm" leftIcon={<BookPlus className="w-4 h-4" />}>
                  Create Course
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {myCourses.map((course) => (
                <Card
                  key={course.id}
                  className="p-5 border-slate-200/80 hover:border-slate-300 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-100 flex items-center justify-center">
                      {course.thumbnail_url ? (
                        <img
                          src={course.thumbnail_url}
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <BookOpen className="w-7 h-7 text-indigo-400" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary" className="text-[10px] py-0 px-2 h-4">
                          {course.category || 'General'}
                        </Badge>
                        <span className="text-xs font-bold text-slate-900">
                          {formatCurrency(course.price, course.currency)}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 truncate">{course.title}</h3>
                      <div className="flex items-center gap-4 text-xs text-slate-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          {course.enrollmentCount || 0} students
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0 w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                    <Link href={`/instructor/courses/${course.id}/lessons`}>
                      <Button variant="outline" size="sm" leftIcon={<Layers className="w-4 h-4 text-indigo-600" />}>
                        Lessons
                      </Button>
                    </Link>

                    <Link href={`/instructor/courses/${course.id}/edit`}>
                      <Button variant="outline" size="sm" leftIcon={<Settings className="w-4 h-4" />}>
                        Edit
                      </Button>
                    </Link>

                    <Link href={`/courses/${course.id}/room`}>
                      <Button variant="ghost" size="sm" title="Course Room">
                        <MessageSquare className="w-4 h-4 text-slate-600" />
                      </Button>
                    </Link>

                    <Link href={`/courses/${course.id}`} target="_blank">
                      <Button variant="ghost" size="sm" title="Preview Public Page">
                        <ExternalLink className="w-4 h-4 text-slate-400" />
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </InstructorRoute>
  );
}
