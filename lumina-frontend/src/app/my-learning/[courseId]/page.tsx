'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ProtectedRoute from '@/components/guards/ProtectedRoute';
import { useCourse } from '@/hooks/useCourses';
import { useLessons } from '@/hooks/useLessons';
import { useMyEnrollments, useToggleProgress } from '@/hooks/useEnrollments';
import VideoPlayer from '@/components/learning/VideoPlayer';
import MarkdownRenderer from '@/components/learning/MarkdownRenderer';
import { Progress } from '@/components/ui/Progress';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  CheckCircle2,
  Circle,
  PlayCircle,
  ArrowLeft,
  MessageSquare,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function CourseLearningPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params?.courseId as string;

  const { data: course, isLoading: courseLoading } = useCourse(courseId);
  const { data: lessons, isLoading: lessonsLoading } = useLessons(courseId);
  const { data: enrollments, isLoading: enrollmentsLoading } = useMyEnrollments();
  const toggleMutation = useToggleProgress();

  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Find user's enrollment for this course
  const currentEnrollment = enrollments?.find((e) => e.course_id === courseId);
  const completedIds = currentEnrollment?.completed_lesson_ids || [];

  // Default to first lesson on load
  useEffect(() => {
    if (lessons && lessons.length > 0 && !activeLessonId) {
      setActiveLessonId(lessons[0].id);
    }
  }, [lessons, activeLessonId]);

  const activeLesson = lessons?.find((l) => l.id === activeLessonId) || lessons?.[0];
  const activeIndex = lessons && activeLesson ? lessons.findIndex((l) => l.id === activeLesson.id) : 0;
  const isLessonCompleted = activeLesson ? completedIds.includes(activeLesson.id) : false;

  const totalLessons = lessons?.length || 0;
  const completedCount = completedIds.length;
  const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  const handleToggleComplete = () => {
    if (!activeLesson) return;
    toggleMutation.mutate(activeLesson.id);
  };

  const handleSelectLesson = (lessonId: string) => {
    setActiveLessonId(lessonId);
    setMobileSidebarOpen(false);
  };

  if (courseLoading || lessonsLoading || enrollmentsLoading) {
    return (
      <div className="flex-1 flex flex-col p-6 max-w-6xl mx-auto w-full space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <Skeleton className="h-96 rounded-2xl lg:col-span-1" />
          <Skeleton className="h-96 rounded-2xl lg:col-span-3" />
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="p-12 text-center max-w-md mx-auto space-y-4">
        <h2 className="text-xl font-bold">Course not found</h2>
        <Link href="/my-learning">
          <Button variant="outline" size="sm">
            Back to My Learning
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="flex-1 flex flex-col min-h-[calc(100vh-4rem)] bg-slate-50">
        {/* Top Sticky Header */}
        <header className="sticky top-16 z-30 bg-white border-b border-slate-200/80 px-4 sm:px-6 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <Link
                href="/my-learning"
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                title="Back to My Learning"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <div className="min-w-0">
                <h1 className="text-sm font-bold text-slate-900 truncate">{course.title}</h1>
                <p className="text-[11px] text-slate-500 truncate hidden sm:block">
                  Lesson {activeIndex + 1} of {totalLessons}: {activeLesson?.title}
                </p>
              </div>
            </div>

            {/* Progress & Actions */}
            <div className="flex items-center gap-4 shrink-0">
              <div className="hidden sm:flex items-center gap-3">
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-800">{progressPercent}%</p>
                  <p className="text-[10px] text-slate-500">
                    {completedCount} of {totalLessons} done
                  </p>
                </div>
                <div className="w-24">
                  <Progress value={completedCount} max={totalLessons || 1} size="sm" />
                </div>
              </div>

              <Link href={`/courses/${courseId}/room`}>
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<MessageSquare className="w-3.5 h-3.5 text-indigo-600" />}
                  className="border-indigo-200 hover:bg-indigo-50 text-indigo-700"
                >
                  <span className="hidden sm:inline">Course Room</span>
                </Button>
              </Link>

              {/* Mobile sidebar toggle button */}
              <button
                onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
                className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 border border-slate-200"
              >
                {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </header>

        {/* Main Learning Workspace */}
        <div className="flex-1 flex max-w-7xl mx-auto w-full">
          {/* Lessons Navigation Sidebar */}
          <aside
            className={cn(
              'fixed inset-y-0 left-0 z-40 w-80 bg-white border-r border-slate-200/80 p-4 transition-transform lg:static lg:translate-x-0 lg:z-0 flex flex-col justify-between shrink-0 top-16',
              mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
            )}
          >
            <div className="space-y-4 flex-1 overflow-y-auto pr-1">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Course Lessons
                  </span>
                </div>
                <Badge variant="default" className="text-[10px] py-0 px-2 h-4 font-bold">
                  Order-Free
                </Badge>
              </div>

              <div className="space-y-1">
                {lessons?.map((lesson, idx) => {
                  const isCurrent = lesson.id === activeLesson?.id;
                  const isDone = completedIds.includes(lesson.id);

                  return (
                    <button
                      key={lesson.id}
                      onClick={() => handleSelectLesson(lesson.id)}
                      className={cn(
                        'w-full text-left p-3 rounded-xl transition-all flex items-start gap-3 group',
                        isCurrent
                          ? 'bg-indigo-50/80 border border-indigo-200/80 text-indigo-950 font-semibold'
                          : 'hover:bg-slate-50 text-slate-700'
                      )}
                    >
                      <div className="mt-0.5 shrink-0">
                        {isDone ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-100" />
                        ) : (
                          <Circle
                            className={cn(
                              'w-4 h-4 transition-colors',
                              isCurrent ? 'text-indigo-600' : 'text-slate-300 group-hover:text-slate-400'
                            )}
                          />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-0.5">
                          <span>Lesson {idx + 1}</span>
                          {isDone && <span className="text-emerald-600 font-semibold">Done</span>}
                        </div>
                        <p className="text-xs leading-snug truncate">{lesson.title}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sidebar Footer info */}
            <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
              <span>{totalLessons} lessons total</span>
              <span className="font-semibold text-indigo-600">{progressPercent}% complete</span>
            </div>
          </aside>

          {/* Main Lesson Content Area */}
          <main className="flex-1 p-4 sm:p-8 max-w-4xl mx-auto w-full space-y-6">
            {!activeLesson ? (
              <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
                <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <h3 className="font-bold text-slate-800">No lessons available in this course yet</h3>
              </div>
            ) : (
              <>
                {/* Lesson Header Card */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="inline-flex items-center gap-1.5 text-xs text-indigo-600 font-semibold mb-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        Lesson {activeIndex + 1} of {totalLessons}
                      </div>
                      <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                        {activeLesson.title}
                      </h2>
                    </div>

                    <Button
                      variant={isLessonCompleted ? 'outline' : 'primary'}
                      size="md"
                      isLoading={toggleMutation.isPending}
                      onClick={handleToggleComplete}
                      leftIcon={
                        isLessonCompleted ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : undefined
                      }
                      className={
                        isLessonCompleted
                          ? 'border-emerald-300 text-emerald-700 bg-emerald-50/50 hover:bg-emerald-100'
                          : ''
                      }
                    >
                      {isLessonCompleted ? '✓ Completed' : 'Mark as Complete'}
                    </Button>
                  </div>
                </div>

                {/* Video Player if available */}
                {activeLesson.video_url && (
                  <div className="space-y-2">
                    <VideoPlayer url={activeLesson.video_url} />
                  </div>
                )}

                {/* Lesson Content Body */}
                <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-2xs">
                  <MarkdownRenderer content={activeLesson.content} />
                </div>

                {/* Navigation between lessons */}
                <div className="flex items-center justify-between pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={activeIndex <= 0}
                    onClick={() => lessons && handleSelectLesson(lessons[activeIndex - 1].id)}
                    leftIcon={<ChevronLeft className="w-4 h-4" />}
                  >
                    Previous Lesson
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!lessons || activeIndex >= lessons.length - 1}
                    onClick={() => lessons && handleSelectLesson(lessons[activeIndex + 1].id)}
                    rightIcon={<ChevronRight className="w-4 h-4" />}
                  >
                    Next Lesson
                  </Button>
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
