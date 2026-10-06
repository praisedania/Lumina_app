import React from 'react';
import Link from 'next/link';
import { Sparkles, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200/80 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold tracking-tight text-slate-900">Lumina LMS</span>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">
              A community-driven learning management system built for flexible, order-free learning and real-time collaboration.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 mb-3">Explore</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <Link href="/courses" className="hover:text-indigo-600 transition-colors">
                  All Courses
                </Link>
              </li>
              <li>
                <Link href="/courses?category=Technology" className="hover:text-indigo-600 transition-colors">
                  Technology
                </Link>
              </li>
              <li>
                <Link href="/courses?category=Design" className="hover:text-indigo-600 transition-colors">
                  Design
                </Link>
              </li>
              <li>
                <Link href="/courses?category=Business" className="hover:text-indigo-600 transition-colors">
                  Business
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 mb-3">Community</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <Link href="/messages" className="hover:text-indigo-600 transition-colors">
                  Course Rooms
                </Link>
              </li>
              <li>
                <Link href="/instructor" className="hover:text-indigo-600 transition-colors">
                  Teach on Lumina
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-indigo-600 transition-colors">
                  Student Dashboard
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 mb-3">Platform</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <span className="text-slate-400">Order-Free Progress</span>
              </li>
              <li>
                <span className="text-slate-400">Real-time WebSockets</span>
              </li>
              <li>
                <span className="text-slate-400">Direct Messaging</span>
              </li>
              <li>
                <span className="text-slate-400">Paystack Integration</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Lumina LMS. Built with modern web standards.</p>
          <p className="flex items-center gap-1">
            Empowering curious learners everywhere <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          </p>
        </div>
      </div>
    </footer>
  );
}
