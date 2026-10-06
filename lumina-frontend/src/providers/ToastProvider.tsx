'use client';

import React from 'react';
import { Toaster } from 'sonner';

export default function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      richColors
      closeButton
      toastOptions={{
        duration: 4000,
        className: 'rounded-xl shadow-lg border text-sm font-medium',
      }}
    />
  );
}
