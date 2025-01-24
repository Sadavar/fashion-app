import { Slot } from 'expo-router';
import { useEffect } from 'react';
import { SessionProvider } from '@/context/SessionContext';

import "../global.css";


export default function RootLayout() {
  useEffect(() => {
    console.log('Root layout mounted');
  }, []);

  return (
    <SessionProvider>
      <Slot />
    </SessionProvider>
  );
}
