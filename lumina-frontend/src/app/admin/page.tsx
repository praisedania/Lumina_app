'use client';

import React, { useState } from 'react';
import AdminRoute from '@/components/guards/AdminRoute';
import {
  useAdminStats,
  useAdminUsers,
  useAdminCourses,
  useDeleteUser,
  useDeleteCourse,
  useMakeAdmin,
} from '@/hooks/useAdmin';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatDate } from '@/lib/utils';
import { Shield, Users, BookOpen, Trash2, Crown, Sparkles } from 'lucide-react';

export default function AdminPage() {
  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const { data: users, isLoading: usersLoading } = useAdminUsers();
  const { data: courses, isLoading: coursesLoading } = useAdminCourses();

  const deleteUserMutation = useDeleteUser();
  const deleteCourseMutation = useDeleteCourse();
  const makeAdminMutation = useMakeAdmin();

  const [activeTab, setActiveTab] = useState<'users' | 'courses'>('users');

  return (
    <AdminRoute>
      <div className="flex-1 bg-slate-50/60 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="pb-6 border-b border-slate-200/80 mb-8 flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 mb-1">
              <Shield className="w-3.5 h-3.5" />
              Administrative Control
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Admin Console
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              System-wide oversight of Lumina LMS users and curriculum content.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card className="p-5 rounded-2xl border-slate-200/80">
            <p className="text-xs font-semibold text-slate-500 uppercase">Total Registered Users</p>
            <p className="text-2xl font-black text-slate-900 mt-2">
              {statsLoading ? <Skeleton className="h-8 w-12" /> : stats?.totalUsers || 0}
            </p>
          </Card>

          <Card className="p-5 rounded-2xl border-slate-200/80">
            <p className="text-xs font-semibold text-slate-500 uppercase">Total Courses</p>
            <p className="text-2xl font-black text-slate-900 mt-2">
              {statsLoading ? <Skeleton className="h-8 w-12" /> : stats?.totalCourses || 0}
            </p>
          </Card>

          <Card className="p-5 rounded-2xl border-slate-200/80">
            <p className="text-xs font-semibold text-slate-500 uppercase">Total Enrollments</p>
            <p className="text-2xl font-black text-slate-900 mt-2">
              {statsLoading ? <Skeleton className="h-8 w-12" /> : stats?.totalEnrollments || 0}
            </p>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'users'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            User Management ({users?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('courses')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'courses'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Course Management ({courses?.length || 0})
          </button>
        </div>

        {/* Content Table */}
        <Card className="rounded-2xl border-slate-200/80 overflow-hidden shadow-2xs">
          {activeTab === 'users' ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-400 uppercase font-semibold">
                  <tr>
                    <th className="p-3.5">Name</th>
                    <th className="p-3.5">Email</th>
                    <th className="p-3.5">Role</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {usersLoading ? (
                    <tr>
                      <td colSpan={4} className="p-6 text-center text-slate-400">
                        Loading users...
                      </td>
                    </tr>
                  ) : users?.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/50">
                      <td className="p-3.5 font-bold text-slate-900">{u.name}</td>
                      <td className="p-3.5">{u.email}</td>
                      <td className="p-3.5">
                        <Badge
                          variant={u.role === 'admin' ? 'warning' : u.role === 'instructor' ? 'default' : 'secondary'}
                        >
                          {u.role}
                        </Badge>
                      </td>
                      <td className="p-3.5 text-right space-x-2">
                        {u.role !== 'admin' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => makeAdminMutation.mutate(u.id)}
                            leftIcon={<Crown className="w-3.5 h-3.5 text-amber-600" />}
                          >
                            Make Admin
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete ${u.name}?`)) {
                              deleteUserMutation.mutate(u.id);
                            }
                          }}
                          className="text-rose-600 hover:bg-rose-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-400 uppercase font-semibold">
                  <tr>
                    <th className="p-3.5">Title</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Instructor</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {coursesLoading ? (
                    <tr>
                      <td colSpan={4} className="p-6 text-center text-slate-400">
                        Loading courses...
                      </td>
                    </tr>
                  ) : courses?.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/50">
                      <td className="p-3.5 font-bold text-slate-900">{c.title}</td>
                      <td className="p-3.5">{c.category || 'General'}</td>
                      <td className="p-3.5">{c.Instructor?.name || 'Instructor'}</td>
                      <td className="p-3.5 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete "${c.title}"?`)) {
                              deleteCourseMutation.mutate(c.id);
                            }
                          }}
                          className="text-rose-600 hover:bg-rose-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </AdminRoute>
  );
}
