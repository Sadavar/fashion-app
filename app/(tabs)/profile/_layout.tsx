// app/(tabs)/home/_layout.tsx
import { Stack } from 'expo-router';

export default function HomeLayout() {
    return (
        <Stack>
            <Stack.Screen
                name="index"
                options={{
                    title: 'profile index',
                    headerShown: false
                }}
            />
            <Stack.Screen
                name="test"
                options={{
                    title: 'test',
                    headerShown: false
                }}
            />
        </Stack>
    );
}
