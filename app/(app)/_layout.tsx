import { supabase } from '@/lib/supabase';
import { Stack } from 'expo-router';
import { Button } from 'react-native/Libraries/Components/Button';

export default function AppLayout() {
    return (
        <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
    );
}

