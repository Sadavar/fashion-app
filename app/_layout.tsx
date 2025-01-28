import { Slot } from 'expo-router';
import { useEffect } from 'react';
import { SessionProvider } from '@/context/SessionContext';

import "../global.css";
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export default function RootLayout() {
  useEffect(() => {
    console.log('Root layout mounted');
  }, []);

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <NavigationContainer>
          <Slot />
        </NavigationContainer >
      </QueryClientProvider>
    </SessionProvider>
  );
}
