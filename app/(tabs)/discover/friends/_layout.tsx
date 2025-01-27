// app/(tabs)/home/_layout.tsx
import { Stack } from 'expo-router';

export default function FriendsLayout() {
    return (
        <Stack>
            <Stack.Screen
                name="index"
                options={{
                    title: 'friends index',
                    headerShown: false
                }}
            />
        </Stack>
    );
}
