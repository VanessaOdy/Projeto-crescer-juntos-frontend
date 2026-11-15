//app/_layout.tsx
import { FeedProvider, useFeed } from '@/context/FeedContext';
import { Slot, useRootNavigationState, useRouter, useSegments } from 'expo-router';
import React, { useEffect, useRef } from 'react';

function AuthGateInner() {
  const router = useRouter();
  const segments = useSegments();
  const navState = useRootNavigationState();
  const ready = navState?.key != null;

  const { currentUser } = useFeed();
  const isAuthed = !!currentUser?.email; // critério simples: tem email salvo
  const navigating = useRef(false);

  useEffect(() => {
    if (!ready) return;

    const group = segments[0]; // '(panel)', '(auth)', 'index', etc.

    if (!isAuthed) {
      // Se não autenticado → permitir '/' e '(auth)'; bloquear '(panel)'
      if (group === '(panel)') {
        if (!navigating.current) {
          navigating.current = true;
          router.replace('/');
          setTimeout(() => (navigating.current = false), 100);
        }
      }
      return;
    }

    // Se autenticado → evitar ficar em '/' (index) ou '(auth)'
    if (group === 'index' || group === '(auth)' || group === undefined) {
      if (!navigating.current) {
        navigating.current = true;
        router.replace('/(panel)/home/page');
        setTimeout(() => (navigating.current = false), 100);
      }
    }
  }, [ready, segments, isAuthed]);

  return <Slot />;
}

export default function RootLayout() {
  return (
    <FeedProvider>
      <AuthGateInner />
    </FeedProvider>
  );
}
