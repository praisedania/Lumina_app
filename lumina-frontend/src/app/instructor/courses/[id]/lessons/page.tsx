'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import InstructorRoute from '@/components/guards/InstructorRoute';
import InstructorSidebar from '@/components/layout/InstructorSidebar';
import { useCourse } from '@/hooks/useCourses';
import { useLessons, useCreateLesson, useUpdateLesson } from '@/hooks/useLessons';
import { Lesson } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Modal } from '@/components/ui/Modal';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  ArrowLeft,
  Plus,
  Edit2,
  PlayCircle,
  FileText,
  BookOpen,
  Sparkles,
} from 'lucide-react';

const lessonSchema = z.object({
  title: z.string().min(2, 'Lesson title is required'),
  content: z.string().optional(),
  video_url: z.string().url('Must be a valid video URL').or(z.literal('')).optional(),
  order_index: z.coerce.number(),
});

type LessonFormData = z.infer<typeof lessonSchema>;

export default function CourseLessonsManagerPage() {
  const params = useParams();
  const courseId = params?.id as string;

  const { data: course, isLoading: courseLoading } = useCourse(courseId);
  const { data: lessons, isLoading: lessonsLoading } = useLessons(courseId);

  const createMutation = useCreateLesson(courseId);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);

  const updateMutation = useUpdateLesson(editingLesson?.id || '', courseId);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LessonFormData>({
    resolver: zodResolver(lessonSchema),
  });

  const openCreateModal = () => {
    setEditingLesson(null);
    reset({
      title: '',
      content: '',
      video_url: '',
      order_index: (lessons?.length || 0) + 1,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (lesson: Lesson) => {
    setEditingLesson(lesson);
    reset({
      title: lesson.title,
      content: lesson.content || '',
      video_url: lesson.video_url || '',
      order_index: lesson.order_index,
    });
    setIsModalOpen(true);
  };

  const onSubmit = (data: LessonFormData) => {
    if (editingLesson) {
      updateMutation.mutate(
        {
          title: data.title,
          content: data.content || undefined,
          video_url: data.video_url || undefined,
          order_index: data.order_index,
        },
        {
          onSuccess: () => {
            setIsModalOpen(false);
          },
        }
      );
    } else {
      createMutation.mutate(
        {
          course_id: courseId,
          title: data.title,
          content: data.content || undefined,
          video_url: data.video_url || undefined,
          order_index: data.order_index,
        },
        {
          onSuccess: () => {
            setIsModalOpen(false);
          },
        }
      );
    }
  };

  return (
    <InstructorRoute>
      <div className="flex-1 flex bg-slate-50/60">
        <InstructorSidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-5xl">
          <Link
            href="/instructor/courses"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Courses
          </Link>

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200/80 mb-8 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="default">Non-linear Curriculum</Badge>
                {course && <span className="text-xs text-slate-500 truncate">{course.title}</span>}
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Manage Course Lessons
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Students can study these lessons in any order without forced progression.
              </p>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={openCreateModal}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Add Lesson
            </Button>
          </div>

          {/* Lessons List */}
          {lessonsLoading || courseLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-16 rounded-xl w-full" />
              <Skeleton className="h-16 rounded-xl w-full" />
              <Skeleton className="h-16 rounded-xl w-full" />
            </div>
          ) : !lessons || lessons.length === 0 ? (
            <div className="p-12 text-center rounded-2xl border border-dashed border-slate-200 bg-white max-w-md mx-auto my-8 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">No lessons created yet</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Add video lectures or Markdown guides to this course.
                </p>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={openCreateModal}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Add First Lesson
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {lessons.map((lesson, idx) => (
                <Card
                  key={lesson.id}
                  className="p-4 border-slate-200/80 hover:border-slate-300 transition-all flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                      {String(idx + 1).padStart(2, '0')}
                    </div>

                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-slate-900 truncate">{lesson.title}</h4>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5">
                        {lesson.video_url && (
                          <span className="flex items-center gap-1 text-indigo-600">
                            <PlayCircle className="w-3 h-3" />
                            Video included
                          </span>
                        )}
                        {lesson.content && (
                          <span className="flex items-center gap-1 text-slate-500">
                            <FileText className="w-3 h-3" />
                            Reading guide
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditModal(lesson)}
                      leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                    >
                      Edit
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Lesson Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingLesson ? 'Edit Lesson' : 'Add New Lesson'}
        description="Provide lesson details, video embed URL, and markdown notes."
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Lesson Title"
            placeholder="e.g. Setting up Express and Routing Architecture"
            error={errors.title?.message}
            {...register('title')}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Order Index (Sorting hint)"
              type="number"
              placeholder="1"
              error={errors.order_index?.message}
              {...register('order_index')}
            />

            <Input
              label="Video URL (YouTube, Vimeo, MP4)"
              placeholder="https://www.youtube.com/watch?v=..."
              error={errors.video_url?.message}
              {...register('video_url')}
            />
          </div>

          <Textarea
            label="Lesson Content (Markdown Supported)"
            placeholder="Write your lesson notes, code samples, or step-by-step guides here..."
            rows={8}
            error={errors.content?.message}
            {...register('content')}
          />

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSubmitting || createMutation.isPending || updateMutation.isPending}
            >
              {editingLesson ? 'Save Lesson' : 'Create Lesson'}
            </Button>
          </div>
        </form>
      </Modal>
    </InstructorRoute>
  );
}
