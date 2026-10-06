'use client';

import React from 'react';
import Link from 'next/link';
import { Course } from '@/types';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils';
import { BookOpen, Users, User, ArrowRight, CheckCircle2 } from 'lucide-react';

export interface CourseCardProps {
  course: Course;
  isEnrolled?: boolean;
}

export default function CourseCard({ course, isEnrolled }: CourseCardProps) {
  const isFree = parseFloat(String(course.price || 0)) === 0;

  return (
    <Card className="group overflow-hidden rounded-2xl border border-slate-200/80 bg-white hover:border-slate-300 hover:shadow-md transition-all duration-200 flex flex-col justify-between">
      <div>
        {/* Course Thumbnail */}
        <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
          {course.thumbnail_url ? (
            <img
              src={course.thumbnail_url}
              alt={course.title}
              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-tr from-slate-100 to-indigo-50/50 text-indigo-400">
              <BookOpen className="h-12 w-12 stroke-[1.5]" />
            </div>
          )}

          {/* Category Badge */}
          {course.category && (
            <div className="absolute top-3 left-3">
              <Badge variant="secondary" className="bg-white/90 backdrop-blur-xs shadow-2xs font-medium text-xs">
                {course.category}
              </Badge>
            </div>
          )}

          {/* Price / Enrolled Badge */}
          <div className="absolute top-3 right-3">
            {isEnrolled ? (
              <Badge variant="success" className="shadow-2xs font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Enrolled
              </Badge>
            ) : isFree ? (
              <Badge variant="default" className="bg-emerald-600 text-white border-0 shadow-2xs font-bold">
                FREE
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-slate-900/80 text-white border-0 shadow-2xs font-bold">
                {formatCurrency(course.price, course.currency)}
              </Badge>
            )}
          </div>
        </div>

        {/* Content */}
        <CardContent className="p-5">
          <h3 className="font-bold text-base text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1 mb-1.5">
            {course.title}
          </h3>
          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
            {course.description || 'Explore this flexible course and connect with learners in the community room.'}
          </p>

          {/* Meta Info */}
          <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
            <div className="flex items-center gap-1.5 truncate mr-2">
              <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{course.Instructor?.name || 'Instructor'}</span>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {course.enrollmentCount !== undefined && (
                <div className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span>{course.enrollmentCount}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </div>

      {/* Action Footer */}
      <div className="p-5 pt-0">
        {isEnrolled ? (
          <Link href={`/my-learning/${course.id}`} className="block w-full">
            <Button variant="primary" size="sm" className="w-full" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              Continue Learning
            </Button>
          </Link>
        ) : (
          <Link href={`/courses/${course.id}`} className="block w-full">
            <Button variant="outline" size="sm" className="w-full group-hover:border-indigo-200 group-hover:text-indigo-600" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              View Course
            </Button>
          </Link>
        )}
      </div>
    </Card>
  );
}
