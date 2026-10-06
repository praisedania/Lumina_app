'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCourse } from '@/hooks/useCourses';
import { useMyEnrollments, useEnrollCourse } from '@/hooks/useEnrollments';
import { useAuth } from '@/providers/AuthProvider';
import { chatService } from '@/services/chat.service';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import Footer from '@/components/layout/Footer';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';
import {
  BookOpen,
  Users,
  User,
  ArrowRight,
  CheckCircle2,
  MessageSquare,
  Sparkles,
  PlayCircle,
  Clock,
  ArrowLeft,
  Mail,
} from 'lucide-react';

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params?.id as string;

  const { isAuthenticated, user } = useAuth();
  const { data: course, isLoading: courseLoading, error: courseError } = useCourse(courseId);
  const { data: enrollments, isLoading: enrollmentsLoading } = useMyEnrollments();
  const enrollMutation = useEnrollCourse();
  const [startingChat, setStartingChat] = useState(false);

  const isEnrolled = !!enrollments?.some((e) => e.course_id === courseId);
  const isFree = parseFloat(String(course?.price || 0)) === 0;

  const handleEnrollClick = async () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/courses/${courseId}`);
      return;
    }
    enrollMutation.mutate({ courseId, isPaid: !isFree });
  };

  const handleMessageInstructor = async () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/courses/${courseId}`);
      return;
    }
    if (!course?.instructor_id) return;
    setStartingChat(true);
    try {
      const res = await chatService.startConversation({ recipientId: course.instructor_id });
      const convId = res.data?.conversation?.id;
      if (convId) {
        router.push(`/messages/${convId}`);
      } else {
        router.push('/messages');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to open message conversation');
    } finally {
      setStartingChat(false);
    }
  };

  if (courseLoading || enrollmentsLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 space-y-6">
        <Skeleton className="h-6 w-32" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="aspect-video w-full rounded-2xl" />
            <Skeleton className="h-32 w-full" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (courseError || !course) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-800">Course not found</h2>
        <p className="text-sm text-slate-500">
          The course you requested may have been removed or does not exist.
        </p>
        <Link href="/courses">
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to Courses
          </Button>
        </Link>
      </div>
    );
  }

  const lessons = course.lessons || [];

  return (
    <div className="flex flex-col min-h-screen">
      <div className="bg-slate-900 text-white py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <Link
            href="/courses"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Catalog
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Left Header Info */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-2">
                {course.category && (
                  <Badge variant="secondary" className="bg-indigo-500/20 text-indigo-300 border-indigo-400/30">
                    {course.category}
                  </Badge>
                )}
                {isFree ? (
                  <Badge variant="success" className="bg-emerald-500/20 text-emerald-300 border-emerald-400/30">
                    Free Course
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-slate-300 border-slate-600">
                    {formatCurrency(course.price, course.currency)}
                  </Badge>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                {course.title}
              </h1>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
                {course.description || 'Explore this flexible course designed for modern learners.'}
              </p>

              {/* Meta information */}
              <div className="flex flex-wrap items-center gap-6 text-xs text-slate-300 pt-2">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-indigo-400" />
                  <span>
                    Taught by <strong className="text-white">{course.Instructor?.name || 'Instructor'}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-indigo-400" />
                  <span>{course.enrollmentCount || 0} students enrolled</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-indigo-400" />
                  <span>{lessons.length} lessons (Any order)</span>
                </div>
              </div>
            </div>

            {/* Right Card / Enrollment Box */}
            <div className="lg:col-span-1 rounded-2xl bg-white text-slate-900 p-6 shadow-xl border border-slate-100 space-y-5">
              {course.thumbnail_url && (
                <div className="aspect-video w-full rounded-xl overflow-hidden bg-slate-100">
                  <img
                    src={course.thumbnail_url}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="flex items-baseline justify-between">
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Tuition</p>
                  <p className="text-2xl font-black text-slate-900">
                    {isFree ? 'Free' : formatCurrency(course.price, course.currency)}
                  </p>
                </div>
                {isEnrolled && (
                  <Badge variant="success" className="h-6">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                    Enrolled
                  </Badge>
                )}
              </div>

              {isEnrolled ? (
                <div className="space-y-2">
                  <Link href={`/my-learning/${course.id}`} className="block w-full">
                    <Button variant="primary" size="lg" className="w-full" rightIcon={<ArrowRight className="w-4 h-4" />}>
                      Continue Learning
                    </Button>
                  </Link>
                  <Link href={`/courses/${course.id}/room`} className="block w-full">
                    <Button
                      variant="outline"
                      size="md"
                      className="w-full text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                      leftIcon={<MessageSquare className="w-4 h-4" />}
                    >
                      Enter Course Room
                    </Button>
                  </Link>
                </div>
              ) : (
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
                  isLoading={enrollMutation.isPending}
                  onClick={handleEnrollClick}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  {isFree ? 'Enroll Now (Free)' : `Enroll for ${formatCurrency(course.price, course.currency)}`}
                </Button>
              )}

              <div className="text-xs text-slate-500 space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>Learn in any order — no rigid locks</span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>Real-time community room access</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Curriculum & Lessons */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Description details */}
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900">About This Course</h2>
              <div className="prose prose-slate max-w-none text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {course.description || 'No detailed syllabus provided yet.'}
              </div>
            </section>

            {/* Lesson syllabus */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Course Lessons</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Order-free learning: You can study any of these topics in whichever sequence you prefer.
                  </p>
                </div>
                <Badge variant="secondary">{lessons.length} Lessons</Badge>
              </div>

              {lessons.length === 0 ? (
                <div className="p-8 text-center rounded-2xl border border-dashed border-slate-200 bg-slate-50">
                  <BookOpen className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-700">No lessons created yet</p>
                  <p className="text-xs text-slate-500 mt-1">
                    The instructor is currently preparing curriculum material.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-2xs">
                  {lessons.map((lesson, idx) => (
                    <div
                      key={lesson.id}
                      className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 font-bold text-xs flex items-center justify-center shrink-0">
                          {String(idx + 1).padStart(2, '0')}
                        </div>
                        <div className="truncate">
                          <p className="text-sm font-semibold text-slate-900 truncate">
                            {lesson.title}
                          </p>
                          <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <PlayCircle className="w-3 h-3 text-slate-400" />
                            Non-linear lesson
                          </span>
                        </div>
                      </div>

                      {isEnrolled ? (
                        <Link href={`/my-learning/${course.id}/lesson/${lesson.id}`}>
                          <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                            Study
                          </Button>
                        </Link>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium px-2 py-1 rounded bg-slate-100">
                          Enroll to open
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Instructor sidebar profile */}
          <div className="lg:col-span-1 space-y-6">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                Instructor
              </h3>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-base">
                  {course.Instructor?.name?.[0]?.toUpperCase() || 'I'}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{course.Instructor?.name}</h4>
                  <p className="text-xs text-slate-500">{course.Instructor?.email}</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Dedicated educator at Lumina LMS, providing student support and community discussions.
              </p>

              {user?.id !== course.instructor_id && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-2"
                  isLoading={startingChat}
                  onClick={handleMessageInstructor}
                  leftIcon={<MessageSquare className="w-4 h-4 text-indigo-600" />}
                >
                  Message Instructor
                </Button>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
