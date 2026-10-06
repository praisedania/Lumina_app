'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/services/auth.service';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { CheckCircle2, AlertCircle, Sparkles, Key, Mail, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialToken = searchParams.get('token') || '';
  const initialEmail = searchParams.get('email') || '';

  const [token, setToken] = useState(initialToken);
  const [email, setEmail] = useState(initialEmail);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Auto verify if token is in query params
  useEffect(() => {
    if (initialToken) {
      handleVerify(initialToken);
    }
  }, [initialToken]);

  const handleVerify = async (tokenToVerify = token) => {
    if (!tokenToVerify.trim()) {
      setError('Please provide a verification token');
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      await authService.verifyEmail(tokenToVerify.trim());
      setSuccess(true);
      toast.success('Email verified successfully! You can now log in.');
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Verification failed. The token may have expired or is invalid.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email.trim()) {
      setError('Please enter your email to resend verification link');
      return;
    }
    setError(null);
    setIsResending(true);
    try {
      await authService.resendVerification(email.trim());
      toast.success('Verification token resent to your email');
    } catch (err: any) {
      setError(err.message || 'Failed to resend verification');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-slate-50/80">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 items-center justify-center text-indigo-600 mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Verify Your Account</h1>
          <p className="text-sm text-slate-500 mt-1">
            Complete email verification to start learning on Lumina
          </p>
        </div>

        <Card className="shadow-lg border-slate-200/80">
          <CardHeader>
            <CardTitle className="text-lg">Email Verification</CardTitle>
            <CardDescription className="text-xs">
              Enter the verification token sent during registration
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {success ? (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <h3 className="font-bold text-sm">Account Verified!</h3>
                <p className="text-xs text-emerald-700">
                  Redirecting to login page in a moment...
                </p>
                <div className="pt-2">
                  <Link href="/login">
                    <Button variant="primary" size="sm">
                      Go to Login Now
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <>
                {error && (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="space-y-3">
                  <Input
                    label="Verification Token"
                    placeholder="Paste 64-character token"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    leftIcon={<Key className="w-4 h-4" />}
                  />

                  <Button
                    variant="primary"
                    size="md"
                    className="w-full"
                    isLoading={isLoading}
                    onClick={() => handleVerify()}
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Verify Email
                  </Button>
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <p className="text-xs text-slate-500 font-medium">Lost or didn&apos;t receive token?</p>
                  <div className="flex gap-2">
                    <Input
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      leftIcon={<Mail className="w-4 h-4" />}
                    />
                    <Button
                      variant="outline"
                      size="md"
                      className="shrink-0"
                      isLoading={isResending}
                      onClick={handleResend}
                    >
                      Resend
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>

          <CardFooter className="pt-2 text-center text-xs text-slate-500 border-t border-slate-100 flex justify-center">
            <Link href="/login" className="font-semibold text-indigo-600 hover:underline">
              Return to Login
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}

