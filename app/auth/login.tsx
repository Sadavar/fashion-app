import { View, TextInput, Button, Alert } from 'react-native';
import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Href, router, useLocalSearchParams } from 'expo-router';

export default function Login() {
    const [phoneNumber, setPhoneNumber] = useState('');

    const handleSendCode = async () => {
        try {
            const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
            const { error } = await supabase.auth.signInWithOtp({
                phone: formattedPhone,
            });

            if (error) throw error;
            router.push({
                pathname: '/auth/verify',
                params: { phoneNumber: formattedPhone }
            });
        } catch (error) {
            Alert.alert('Error', (error as Error).message);
        }
    };

    return (
        <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
            <TextInput
                placeholder="Phone Number (e.g., +1234567890)"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                style={{ padding: 10, borderWidth: 1, marginBottom: 20 }}
            />
            <Button title="Send Code" onPress={handleSendCode} />
        </View>
    );
}

