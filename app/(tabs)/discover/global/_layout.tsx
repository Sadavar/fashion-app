// app/(tabs)/home/_layout.tsx
import { Stack } from 'expo-router';

export default function DiscoverLayout() {
    return (
        <Stack>
            <Stack.Screen
                name="index"
                options={{
                    title: 'global index',
                    headerShown: false
                }}
            />
        </Stack>
    );
}
