import { Redirect, router } from 'expo-router';
import { View, Text, Button } from 'react-native';

export default function Index() {
    return (
        <Redirect href="/(tabs)/discover?tab=global" />
    );
}

