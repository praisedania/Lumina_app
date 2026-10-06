'use client';

import React from 'react';
import Link from 'next/link';
import { usePublicCourses } from '@/hooks/useCourses';
import { useAuth } from '@/providers/AuthProvider';
import CourseGrid from '@/components/courses/CourseGrid';
import { Button } from '@/components/ui/Button';
import Footer from '@/components/layout/Footer';
import {
  Compass,
  ArrowRight,
  Shuffle,
  Users,
  Trophy,
  Zap,
  Sparkles,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react';

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const { data, isLoading } = usePublicCourses({ limit: 6 });

  const courses = data?.courses || [];
  const enrolledCourseIds = data?.enrolledCourseIds || [];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50/50 via-white to-slate-50/60 pt-16 pb-20 md:pt-24 md:pb-28">
        <div className="absolute inset-0 -z-10 pointer-events-none opacity-40">
          <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-indigo-300/30 to-violet-300/30 blur-3xl rounded-full" />
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-6 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5" />
            Flexible, Non-linear Community Learning
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15] mb-6">
            Learn at your own pace.{' '}
            <span className="block bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-800 bg-clip-text text-transparent">
              Connect. Learn. Grow.
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-600 leading-relaxed mb-10">
            Access lessons in any order you choose. Connect directly with instructors and fellow learners
            through real-time course rooms and direct messaging.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/courses">
              <Button
                variant="primary"
                size="lg"
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="w-full sm:w-auto px-8"
              >
                Explore Courses
              </Button>
            </Link>
            {!isAuthenticated ? (
              <Link href="/register">
                <Button variant="outline" size="lg" className="w-full sm:w-auto px-8">
                  Get Started Free
                </Button>
              </Link>
            ) : (
              <Link href="/dashboard">
                <Button variant="outline" size="lg" className="w-full sm:w-auto px-8">
                  Go to Dashboard
                </Button>
              </Link>
            )}
          </div>

          {/* Social Proof Bar */}
          <div className="mt-14 pt-10 border-t border-slate-200/60 max-w-3xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-2xl font-bold text-slate-900">100%</p>
              <p className="text-xs text-slate-500 font-medium">Order-Free Flow</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-indigo-600">Real-Time</p>
              <p className="text-xs text-slate-500 font-medium">Socket Chat Rooms</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">Direct</p>
              <p className="text-xs text-slate-500 font-medium">Instructor Support</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-indigo-600">Live</p>
              <p className="text-xs text-slate-500 font-medium">Typing Indicators</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Lumina? Feature Pillars */}
      <section className="py-16 md:py-24 bg-white border-y border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-2">
              Why Lumina?
            </h2>
            <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              A community learning experience unlike any other
            </h3>
            <p className="text-slate-600 text-sm mt-3">
              Traditional LMS platforms trap learners in rigid rails. Lumina gives you total freedom plus a live community.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-6 hover:shadow-xs transition-all">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-5">
                <Shuffle className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-2">Flexible Learning</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Learn lessons in any order. Jump to APIs before database setup if that fits your project needs.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-6 hover:shadow-xs transition-all">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-5">
                <Users className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-2">Real-Time Community</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Connect with peers and instructors in live course chat rooms powered by authenticated WebSockets.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-6 hover:shadow-xs transition-all">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mb-5">
                <Trophy className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-2">Track Your Progress</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Easily mark completed lessons in any order and monitor your completion percentage in real time.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-6 hover:shadow-xs transition-all">
              <div className="w-12 h-12 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center mb-5">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-2">Direct Messaging</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Ask targeted questions directly to instructors or study partners with instant delivery and typing indicators.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-1">
              Top Curriculum
            </h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Featured Courses</h3>
            <p className="text-slate-500 text-sm mt-1">
              Hand-picked courses from experienced instructors ready for immediate exploration.
            </p>
          </div>

          <Link href="/courses">
            <Button variant="outline" size="sm" rightIcon={<Compass className="w-4 h-4" />}>
              View All Courses
            </Button>
          </Link>
        </div>

        <CourseGrid
          courses={courses}
          enrolledCourseIds={enrolledCourseIds}
          isLoading={isLoading}
          emptyTitle="No courses published yet"
          emptyDescription="Instructors will publish courses shortly. Check back soon or register to start teaching!"
        />
      </section>

      {/* Call to action */}
      <section className="bg-gradient-to-tr from-indigo-900 via-indigo-800 to-slate-900 text-white py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to experience learning without borders?
          </h2>
          <p className="text-indigo-200 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Join Lumina today to access high quality courses, connect with peers in live rooms, and learn at your own pace.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/courses">
              <Button
                variant="primary"
                size="lg"
                className="bg-white text-indigo-900 hover:bg-indigo-50 active:bg-indigo-100 shadow-md"
              >
                Browse All Courses
              </Button>
            </Link>
            {!isAuthenticated && (
              <Link href="/register">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-indigo-400/40 text-white bg-white/10 hover:bg-white/20"
                >
                  Create Free Account
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
