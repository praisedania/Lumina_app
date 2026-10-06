'use client';

import React, { useState } from 'react';
import ProtectedRoute from '@/components/guards/ProtectedRoute';
import DashboardSidebar from '@/components/layout/DashboardSidebar';
import { useAuth } from '@/providers/AuthProvider';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import {
  User,
  Mail,
  Lock,
  GraduationCap,
  Shield,
  Bell,
  Palette,
  CheckCircle2,
  Save,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { user, switchToInstructor } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [chatSounds, setChatSounds] = useState(true);
  const [isSwitching, setIsSwitching] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Preferences updated successfully');
  };

  const handleSwitchInstructor = async () => {
    setIsSwitching(true);
    try {
      await switchToInstructor();
      toast.success('You are now an instructor! Access the instructor dashboard from the sidebar.');
    } catch (err: any) {
      toast.error(err.message || 'Failed to switch role');
    } finally {
      setIsSwitching(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="flex-1 flex bg-slate-50/60">
        <DashboardSidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-4xl">
          <div className="pb-6 border-b border-slate-200/80 mb-8">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Settings</h1>
            <p className="text-xs text-slate-500 mt-1">
              Manage your account preferences, notifications, and permissions.
            </p>
          </div>

          <div className="space-y-6">
            {/* Profile Overview */}
            <Card className="rounded-2xl border-slate-200/80 p-6">
              <CardHeader className="p-0 pb-5">
                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <User className="w-4 h-4 text-indigo-600" />
                  Account Profile
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Your public profile and contact information
                </CardDescription>
              </CardHeader>

              <CardContent className="p-0">
                <form onSubmit={handleSaveProfile} className="space-y-5">
                  <div className="flex items-center gap-4">
                    <Avatar name={user?.name} size="lg" />
                    <div>
                      <p className="text-sm font-bold text-slate-900">{user?.name}</p>
                      <p className="text-xs text-slate-500">{user?.email}</p>
                      <Badge variant="secondary" className="text-[10px] mt-1 capitalize">
                        {user?.role} Account
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <Input
                      label="Full Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      leftIcon={<User className="w-4 h-4" />}
                    />

                    <Input
                      label="Email Address"
                      value={user?.email || ''}
                      disabled
                      placeholder="Your email"
                      leftIcon={<Mail className="w-4 h-4" />}
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button variant="primary" size="sm" type="submit" leftIcon={<Save className="w-3.5 h-3.5" />}>
                      Save Changes
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Role & Privileges */}
            <Card className="rounded-2xl border-slate-200/80 p-6">
              <CardHeader className="p-0 pb-4">
                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-indigo-600" />
                  Instructor Role
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Teach on Lumina and earn revenue on created courses
                </CardDescription>
              </CardHeader>

              <CardContent className="p-0 pt-2">
                {user?.role === 'instructor' || user?.role === 'admin' ? (
                  <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">Instructor Privileges Active</p>
                      <p className="text-[11px] text-slate-500">
                        You have access to create courses, manage lessons, and view payout analytics.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold text-slate-900">Want to create and sell courses?</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Switch your account to Instructor status instantly. No separate account required.
                      </p>
                    </div>

                    <Button
                      variant="primary"
                      size="sm"
                      isLoading={isSwitching}
                      onClick={handleSwitchInstructor}
                      leftIcon={<GraduationCap className="w-4 h-4" />}
                    >
                      Become an Instructor
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Notification Preferences */}
            <Card className="rounded-2xl border-slate-200/80 p-6">
              <CardHeader className="p-0 pb-4">
                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Bell className="w-4 h-4 text-indigo-600" />
                  Notifications & Real-Time Alerts
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Control how you receive alerts from course discussions and messages
                </CardDescription>
              </CardHeader>

              <CardContent className="p-0 pt-2 space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <div>
                    <p className="text-xs font-semibold text-slate-900">Direct Message Alerts</p>
                    <p className="text-[11px] text-slate-500">
                      Receive real-time sound and visual badges when you receive a DM.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={chatSounds}
                    onChange={(e) => setChatSounds(e.target.checked)}
                    className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-xs font-semibold text-slate-900">Course Room Activity</p>
                    <p className="text-[11px] text-slate-500">
                      Show active message counters for enrolled course discussion channels.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailNotifications}
                    onChange={(e) => setEmailNotifications(e.target.checked)}
                    className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
