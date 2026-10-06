'use client';

import React from 'react';
import InstructorRoute from '@/components/guards/InstructorRoute';
import InstructorSidebar from '@/components/layout/InstructorSidebar';
import MessagesIndexPage from '@/app/messages/page';

export default function InstructorMessagesPage() {
  return (
    <InstructorRoute>
      <div className="flex-1 flex bg-slate-50/60">
        <InstructorSidebar />
        <div className="flex-1">
          <MessagesIndexPage />
        </div>
      </div>
    </InstructorRoute>
  );
}
