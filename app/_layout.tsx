import { Slot } from 'expo-router';
import { useEffect } from 'react';
import { SessionProvider } from '@/context/SessionContext';

import "../global.css";
import { NavigationContainer } from '@react-navigation/native';


export default function RootLayout() {
  useEffect(() => {
    console.log('Root layout mounted');
  }, []);

  return (
    <SessionProvider>
      <NavigationContainer>
        <Slot />
      </NavigationContainer >
    </SessionProvider>
  );
}
