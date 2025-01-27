// app/(tabs)/home/_layout.tsx
import { Stack } from 'expo-router';

export default function BrandsLayout() {
    return (
        <Stack>
            <Stack.Screen
                name="index"
                options={{
                    title: 'brands index',
                    headerShown: false
                }}
            />
        </Stack>
    );
}
