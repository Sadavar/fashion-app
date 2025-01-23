import { Slot, Stack } from 'expo-router';
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { SessionProvider } from '@/context/SessionContext';

export default function RootLayout() {
  const router = useRouter();

  useEffect(() => {
    console.log('Root layout mounted');
  }, []);

  return (
    <SessionProvider>
      <Slot />
    </SessionProvider>
  );
}
