'use client';

import React from 'react';
import CourseCard from './CourseCard';
import { Course } from '@/types';
import { Skeleton } from '@/components/ui/Skeleton';
import { BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export interface CourseGridProps {
  courses: Course[];
  enrolledCourseIds?: string[];
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  onResetFilters?: () => void;
}

export default function CourseGrid({
  courses,
  enrolledCourseIds = [],
  isLoading = false,
  emptyTitle = 'No courses found',
  emptyDescription = 'Try adjusting your search query or filters to find what you are looking for.',
  onResetFilters,
}: CourseGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-slate-200/80 bg-white p-4 space-y-3">
            <Skeleton className="aspect-video w-full rounded-xl" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-9 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-2xl border border-dashed border-slate-200 bg-white">
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500 mb-4">
          <BookOpen className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-1">{emptyTitle}</h3>
        <p className="text-sm text-slate-500 max-w-md mb-6">{emptyDescription}</p>
        {onResetFilters && (
          <Button variant="outline" size="sm" onClick={onResetFilters}>
            Clear All Filters
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course) => (
        <CourseCard
          key={course.id}
          course={course}
          isEnrolled={enrolledCourseIds.includes(course.id)}
        />
      ))}
    </div>
  );
}
