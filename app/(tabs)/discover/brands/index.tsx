import { supabase } from "@/lib/supabase";
import { useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { View, Text, StyleSheet } from "react-native";

export default function BrandsScreen() {
    return (
        <View>
            <Text>Brands</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        padding: 20,
    },
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    brandName: {
        fontSize: 24,
        fontWeight: 'bold',
    }
});