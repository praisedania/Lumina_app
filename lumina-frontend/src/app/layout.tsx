import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import QueryProvider from '@/providers/QueryProvider';
import { AuthProvider } from '@/providers/AuthProvider';
import { SocketProvider } from '@/providers/SocketProvider';
import ToastProvider from '@/providers/ToastProvider';
import Navbar from '@/components/layout/Navbar';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Lumina LMS — Learn. Connect. Grow.',
  description:
    'A modern, community-driven Learning Management System with flexible order-free learning and real-time chat rooms.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.className} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-slate-50/60 text-slate-900 selection:bg-indigo-500/20 selection:text-indigo-900">
        <QueryProvider>
          <AuthProvider>
            <SocketProvider>
              <ToastProvider />
              <Navbar />
              <div className="flex-1 flex flex-col">{children}</div>
            </SocketProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
