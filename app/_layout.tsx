import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter, useSegments } from 'expo-router';

export default function RootLayout() {
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        // Check if username exists
        const checkUsername = async () => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', session?.user?.id)
            .single();

          if (!profile?.username) {
            router.replace('/auth/username');
          } else {
            router.replace('/(app)');
          }
        };
        checkUsername();
      } else if (event === 'SIGNED_OUT') {
        router.replace('/auth/login');
      }
    });
  }, []);

  return (
    <Stack>
      <Stack.Screen name="(app)" options={{ headerShown: false }} />
      <Stack.Screen name="auth" options={{ headerShown: false }} />
    </Stack>
  );
}