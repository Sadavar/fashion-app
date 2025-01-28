import { View, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function BrandDetail() {
    const { id } = useLocalSearchParams<{ id: string }>();

    return (
        <View>
            <Text>Brand {id}</Text>
        </View>
    );
}