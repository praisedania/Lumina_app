'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import InstructorRoute from '@/components/guards/InstructorRoute';
import InstructorSidebar from '@/components/layout/InstructorSidebar';
import { useCourse, useUpdateCourse } from '@/hooks/useCourses';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { ArrowLeft, Save } from 'lucide-react';

const editCourseSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description should be at least 10 characters'),
  category: z.string().min(1, 'Category is required'),
  thumbnail_url: z.string().url('Must be a valid image URL').or(z.literal('')),
  price: z.coerce.number().min(0, 'Price must be 0 or greater'),
  currency: z.string(),
});

type EditCourseFormData = z.infer<typeof editCourseSchema>;

export default function EditCoursePage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params?.id as string;

  const { data: course, isLoading } = useCourse(courseId);
  const updateMutation = useUpdateCourse(courseId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EditCourseFormData>({
    resolver: zodResolver(editCourseSchema),
  });

  useEffect(() => {
    if (course) {
      reset({
        title: course.title,
        description: course.description || '',
        category: course.category || '',
        thumbnail_url: course.thumbnail_url || '',
        price: parseFloat(String(course.price || 0)),
        currency: course.currency || 'NGN',
      });
    }
  }, [course, reset]);

  const onSubmit = (data: EditCourseFormData) => {
    updateMutation.mutate(
      {
        ...data,
        thumbnail_url: data.thumbnail_url || undefined,
      },
      {
        onSuccess: () => {
          router.push('/instructor/courses');
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

          {isLoading ? (
            <Skeleton className="h-96 rounded-2xl w-full" />
          ) : !course ? (
            <div className="p-8 text-center bg-white rounded-2xl">Course not found</div>
          ) : (
            <Card className="rounded-2xl border-slate-200/80 shadow-md">
              <CardHeader className="space-y-1">
                <CardTitle className="text-xl">Edit Course Details</CardTitle>
                <CardDescription className="text-xs">
                  Update course metadata, pricing, or syllabus description.
                </CardDescription>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  <Input
                    label="Course Title"
                    error={errors.title?.message}
                    {...register('title')}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Category"
                      error={errors.category?.message}
                      {...register('category')}
                    />

                    <Input
                      label="Price (0 for Free)"
                      type="number"
                      step="0.01"
                      error={errors.price?.message}
                      {...register('price')}
                    />
                  </div>

                  <Input
                    label="Thumbnail Image URL"
                    error={errors.thumbnail_url?.message}
                    {...register('thumbnail_url')}
                  />

                  <Textarea
                    label="Course Description / Syllabus"
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
                      isLoading={isSubmitting || updateMutation.isPending}
                      leftIcon={<Save className="w-4 h-4" />}
                    >
                      Save Changes
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </InstructorRoute>
  );
}
