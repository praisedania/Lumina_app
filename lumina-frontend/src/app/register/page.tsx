'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/providers/AuthProvider';
import { authService } from '@/services/auth.service';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import {
  Sparkles,
  Mail,
  Lock,
  User,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Send,
  Inbox
} from 'lucide-react';
import { toast } from 'sonner';

const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    role: z.enum(['student', 'instructor']),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  // Verification modal state after successful registration
  const [showEmailSentModal, setShowEmailSentModal] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState<string>('');
  const [isResending, setIsResending] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'student',
    },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data: RegisterFormData) => {
    setServerError(null);
    try {
      await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
      });

      setRegisteredEmail(data.email);
      setShowEmailSentModal(true);
      toast.success('Account created! A verification email has been sent to your inbox.');
    } catch (err: any) {
      setServerError(err.message || 'Registration failed');
    }
  };

  const handleResendEmail = async () => {
    if (!registeredEmail) return;
    setIsResending(true);
    try {
      await authService.resendVerification(registeredEmail);
      toast.success('Verification email resent! Please check your inbox.');
    } catch (err: any) {
      toast.error(err.message || 'Failed to resend verification email');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-slate-50/80 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 items-center justify-center text-white shadow-lg shadow-indigo-500/25 mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Create your account</h1>
          <p className="text-sm text-slate-500 mt-1">
            Join Lumina for flexible, non-sequential community learning
          </p>
        </div>

        <Card className="shadow-lg border-slate-200/80">
          <CardHeader className="space-y-1">
            <CardTitle className="text-lg">Get started with Lumina</CardTitle>
            <CardDescription className="text-xs">
              Fill in your details to create an account
            </CardDescription>
          </CardHeader>

          <CardContent>
            {serverError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2 mb-5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{serverError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Role Selector Tabs */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  I want to join as a
                </label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setValue('role', 'student')}
                    className={`py-2 text-xs font-bold rounded-lg transition-all ${
                      selectedRole === 'student'
                        ? 'bg-white text-indigo-700 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Student / Learner
                  </button>
                  <button
                    type="button"
                    onClick={() => setValue('role', 'instructor')}
                    className={`py-2 text-xs font-bold rounded-lg transition-all ${
                      selectedRole === 'instructor'
                        ? 'bg-white text-indigo-700 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Instructor / Teacher
                  </button>
                </div>
              </div>

              <Input
                label="Full Name"
                placeholder="Jane Doe"
                autoComplete="name"
                leftIcon={<User className="w-4 h-4" />}
                error={errors.name?.message}
                {...register('name')}
              />

              <Input
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                leftIcon={<Mail className="w-4 h-4" />}
                error={errors.email?.message}
                {...register('email')}
              />

              <Input
                label="Password"
                type="password"
                placeholder="At least 8 characters"
                autoComplete="new-password"
                leftIcon={<Lock className="w-4 h-4" />}
                error={errors.password?.message}
                {...register('password')}
              />

              <Input
                label="Confirm Password"
                type="password"
                placeholder="Repeat password"
                autoComplete="new-password"
                leftIcon={<Lock className="w-4 h-4" />}
                error={errors.confirmPassword?.message}
                {...register('confirmPassword')}
              />

              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full mt-2"
                isLoading={isSubmitting}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Create Account
              </Button>
            </form>
          </CardContent>

          <CardFooter className="pt-2 text-center text-xs text-slate-500 border-t border-slate-100 flex justify-center">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-indigo-600 hover:underline ml-1">
              Sign in
            </Link>
          </CardFooter>
        </Card>
      </div>

      {/* Verification Email Sent Modal */}
      <Modal
        isOpen={showEmailSentModal}
        onClose={() => router.push(`/verify-email?email=${encodeURIComponent(registeredEmail)}`)}
        title="Check Your Inbox"
        description="We've sent a verification link and code to your email."
        maxWidth="md"
      >
        <div className="space-y-5 text-center py-2">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto shadow-inner">
            <Inbox className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-bold text-slate-900">Verification Email Sent</h3>
            <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
              We sent a verification email to{' '}
              <span className="font-bold text-slate-900">{registeredEmail}</span>. Please click the link in your email or enter the verification code to activate your account.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 text-left space-y-1">
            <p className="font-semibold text-slate-700">Didn&apos;t receive the email?</p>
            <p className="text-[11px]">
              • Check your spam or junk folder.<br />
              • Make sure your email address was entered correctly.
            </p>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <Button
              variant="primary"
              size="md"
              className="w-full"
              onClick={() => router.push(`/verify-email?email=${encodeURIComponent(registeredEmail)}`)}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Enter Verification Code
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="w-full text-slate-600"
              isLoading={isResending}
              onClick={handleResendEmail}
              leftIcon={<Send className="w-3.5 h-3.5" />}
            >
              Resend Verification Email
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
