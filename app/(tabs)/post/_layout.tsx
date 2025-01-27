// app/(tabs)/home/_layout.tsx
import { Stack } from 'expo-router';

export default function PostLayout() {
    return (
        <Stack>
            <Stack.Screen
                name="index"
                options={{
                    title: 'post index',
                    headerShown: false
                }}
            />
        </Stack>
    );
}
