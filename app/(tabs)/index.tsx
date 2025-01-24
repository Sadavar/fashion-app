import { useEffect } from "react";
import { View, Text } from "react-native";

export default function Discover() {
    useEffect(() => {
        console.log('discover layout mounted');
    }, []);
    return (
        <View>
            <Text className="">Discover</Text>
        </View>
    );
}