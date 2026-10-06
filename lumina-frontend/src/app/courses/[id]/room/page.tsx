'use client';

import React, { useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import ProtectedRoute from '@/components/guards/ProtectedRoute';
import { useCourse } from '@/hooks/useCourses';
import { useCourseRoom } from '@/hooks/useChat';
import { useSocket } from '@/providers/SocketProvider';
import ChatBox from '@/components/chat/ChatBox';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { ArrowLeft, BookOpen, AlertCircle } from 'lucide-react';

export default function CourseRoomPage() {
  const params = useParams();
  const courseId = (params?.id || params?.courseId) as string;

  const { data: course, isLoading: courseLoading } = useCourse(courseId);
  const { data: conversation, isLoading: roomLoading, error: roomError } = useCourseRoom(courseId);
  const { markAsRead } = useSocket();

  useEffect(() => {
    if (conversation?.id) {
      markAsRead(conversation.id);
    }
  }, [conversation?.id, markAsRead]);

  return (
    <ProtectedRoute>
      <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] bg-slate-100 p-3 sm:p-6">
        <div className="max-w-6xl mx-auto w-full flex-1 flex flex-col space-y-3">
          {/* Header Bar */}
          <div className="flex items-center justify-between bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
            <div className="flex items-center gap-3">
              <Link href={`/my-learning/${courseId}`}>
                <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                  Back to Course
                </Button>
              </Link>
              <div className="border-l border-slate-200 pl-3">
                <h1 className="text-sm font-bold text-slate-900 truncate">
                  {course?.title ? `${course.title} — Community Room` : 'Course Community Room'}
                </h1>
                <p className="text-[11px] text-slate-500">Live discussion with learners and instructor</p>
              </div>
            </div>

            <Link href={`/my-learning/${courseId}`}>
              <Button variant="outline" size="sm" leftIcon={<BookOpen className="w-3.5 h-3.5 text-indigo-600" />}>
                Course Lessons
              </Button>
            </Link>
          </div>

          {/* Chat Container */}
          <div className="flex-1 min-h-0">
            {roomLoading || courseLoading ? (
              <div className="h-full bg-white rounded-2xl p-6 flex items-center justify-center">
                <Skeleton className="h-full w-full rounded-xl" />
              </div>
            ) : roomError || !conversation ? (
              <div className="h-full bg-white rounded-2xl p-8 flex flex-col items-center justify-center text-center space-y-3">
                <AlertCircle className="w-10 h-10 text-rose-500" />
                <h2 className="text-base font-bold text-slate-900">Access Restricted</h2>
                <p className="text-xs text-slate-500 max-w-sm">
                  You must be enrolled in this course or be its instructor to participate in this room.
                </p>
                <Link href={`/courses/${courseId}`}>
                  <Button variant="primary" size="sm">
                    View Course Details & Enroll
                  </Button>
                </Link>
              </div>
            ) : (
              <ChatBox
                conversationId={conversation.id}
                title={`${course?.title || 'Course'} Room`}
                subtitle="Live course community"
                type="room"
              />
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
