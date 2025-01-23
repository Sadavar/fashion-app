// app/auth/verify.tsx
import { View, TextInput, Button, Alert } from 'react-native';
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { ExternalPathString, router, useLocalSearchParams } from 'expo-router';

export default function Verify() {
    const [code, setCode] = useState('');
    const { phoneNumber } = useLocalSearchParams();

    const handleVerify = async () => {
        try {
            const { error } = await supabase.auth.verifyOtp({
                phone: phoneNumber as string, // You'll need to pass this from the previous screen
                token: code,
                type: 'sms'
            });

            if (error) throw error;
            else {
                console.log('verify successful')
                router.replace({ pathname: '/(tabs)' });
            }


            // The auth state change listener in _layout will handle navigation
        } catch (error) {
            Alert.alert('Error', (error as Error).message);
        }
    };

    return (
        <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
            <TextInput
                placeholder="Enter verification code"
                value={code}
                onChangeText={setCode}
                keyboardType="number-pad"
                style={{ padding: 10, borderWidth: 1, marginBottom: 20 }}
            />
            <Button title="Verify Code" onPress={handleVerify} />
        </View>
    );
}