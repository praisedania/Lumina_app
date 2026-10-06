'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import InstructorRoute from '@/components/guards/InstructorRoute';
import InstructorSidebar from '@/components/layout/InstructorSidebar';
import { useCreateCourse } from '@/hooks/useCourses';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { ArrowLeft, BookPlus, Sparkles } from 'lucide-react';

const courseSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description should be at least 10 characters'),
  category: z.string().min(1, 'Category is required'),
  thumbnail_url: z.string().url('Must be a valid image URL').or(z.literal('')),
  price: z.coerce.number().min(0, 'Price must be 0 or greater'),
  currency: z.string(),
});

type CourseFormData = z.infer<typeof courseSchema>;

export default function CreateCoursePage() {
  const router = useRouter();
  const createMutation = useCreateCourse();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      price: 0,
      currency: 'NGN',
    },
  });

  const onSubmit = (data: CourseFormData) => {
    createMutation.mutate(
      {
        ...data,
        thumbnail_url: data.thumbnail_url || undefined,
      },
      {
        onSuccess: (res) => {
          // Navigate to add lessons to the newly created course
          router.push(`/instructor/courses/${res.data.id}/lessons`);
        },
      }
    );
  };

  return (
    <InstructorRoute>
      <div className="flex-1 flex bg-slate-50/60">
        <InstructorSidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-4xl">
          <Link
            href="/instructor/courses"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Courses
          </Link>

          <Card className="rounded-2xl border-slate-200/80 shadow-md">
            <CardHeader className="space-y-1">
              <div className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                Curriculum Builder
              </div>
              <CardTitle className="text-xl">Create a New Course</CardTitle>
              <CardDescription className="text-xs">
                Set up your course details. A dedicated real-time chat room will automatically be created.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <Input
                  label="Course Title"
                  placeholder="e.g. Node.js & Express RESTful API Mastery"
                  error={errors.title?.message}
                  {...register('title')}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Category"
                    placeholder="e.g. Software Engineering, Design, Business"
                    error={errors.category?.message}
                    {...register('category')}
                  />

                  <Input
                    label="Price (0 for Free)"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    error={errors.price?.message}
                    {...register('price')}
                  />
                </div>

                <Input
                  label="Thumbnail Image URL"
                  placeholder="https://images.unsplash.com/photo-..."
                  error={errors.thumbnail_url?.message}
                  helperText="Provide a direct URL to a high-quality landscape image."
                  {...register('thumbnail_url')}
                />

                <Textarea
                  label="Course Description / Syllabus"
                  placeholder="Outline what students will learn, topics covered, and key outcomes..."
                  rows={5}
                  error={errors.description?.message}
                  {...register('description')}
                />

                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                  <Link href="/instructor/courses">
                    <Button variant="outline" size="md">
                      Cancel
                    </Button>
                  </Link>

                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    isLoading={isSubmitting || createMutation.isPending}
                    leftIcon={<BookPlus className="w-4 h-4" />}
                  >
                    Create Course & Add Lessons
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </main>
      </div>
    </InstructorRoute>
  );
}
