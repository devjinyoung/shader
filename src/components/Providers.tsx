'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { PlaybackProvider } from '@/context/PlaybackContext';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <PlaybackProvider>
        {children}
      </PlaybackProvider>
    </AuthProvider>
  );
}
