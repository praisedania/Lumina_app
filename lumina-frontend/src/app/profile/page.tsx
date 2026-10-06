'use client';

import React from 'react';
import ProtectedRoute from '@/components/guards/ProtectedRoute';
import DashboardSidebar from '@/components/layout/DashboardSidebar';
import { useAuth } from '@/providers/AuthProvider';
import { useMyEnrollments } from '@/hooks/useEnrollments';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { User, Mail, GraduationCap, Shield, LogOut, CheckCircle2 } from 'lucide-react';

export default function ProfilePage() {
  const { user, logout, switchToInstructor } = useAuth();
  const { data: enrollments } = useMyEnrollments();

  return (
    <ProtectedRoute>
      <div className="flex-1 flex bg-slate-50/60">
        <DashboardSidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-4xl">
          <div className="pb-6 border-b border-slate-200/80 mb-8">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Account Profile</h1>
            <p className="text-xs text-slate-500 mt-1">Manage your identity and permissions on Lumina.</p>
          </div>

          <div className="space-y-6">
            {/* Identity Card */}
            <Card className="rounded-2xl border-slate-200/80 p-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                <Avatar name={user?.name} src={user?.avatar_url} size="xl" />

                <div className="space-y-3 text-center sm:text-left flex-1">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">{user?.name}</h2>
                    <p className="text-xs text-slate-500 flex items-center justify-center sm:justify-start gap-1 mt-0.5">
                      <Mail className="w-3.5 h-3.5" />
                      {user?.email}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                    <Badge variant="default" className="capitalize text-xs font-semibold">
                      {user?.role} Role
                    </Badge>
                    <Badge variant="success" className="text-xs font-medium">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Email Verified
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>

            {/* Role & Teaching Privileges */}
            <Card className="rounded-2xl border-slate-200/80 p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Instructor Privileges
              </h3>

              {user?.role === 'instructor' || user?.role === 'admin' ? (
                <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">Instructor Account Active</p>
                      <p className="text-xs text-slate-500">
                        You can create courses, upload lessons, and receive sales revenue.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-5 rounded-2xl bg-white border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Become an Instructor on Lumina</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Share your skills with our community and earn revenue on courses.
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => switchToInstructor()}
                    leftIcon={<GraduationCap className="w-4 h-4" />}
                  >
                    Switch to Instructor
                  </Button>
                </div>
              )}
            </Card>

            {/* Activity Summary */}
            <Card className="rounded-2xl border-slate-200/80 p-6 space-y-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Learning Activity
              </h3>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-xs text-slate-500">Courses Enrolled</p>
                  <p className="text-2xl font-black text-slate-900 mt-1">
                    {enrollments?.length || 0}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-xs text-slate-500">Platform Status</p>
                  <p className="text-sm font-bold text-emerald-600 mt-2 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Active Learner
                  </p>
                </div>
              </div>
            </Card>

            {/* Logout button */}
            <div className="pt-4 flex justify-end">
              <Button
                variant="outline"
                size="md"
                onClick={logout}
                className="text-rose-600 border-rose-200 hover:bg-rose-50"
                leftIcon={<LogOut className="w-4 h-4" />}
              >
                Sign Out of Account
              </Button>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
