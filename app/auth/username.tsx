import { View, TextInput, Button, Alert } from 'react-native';
import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { ExternalPathString, Href, Redirect, router } from 'expo-router';

export default function Username() {
    const [username, setUsername] = useState('');

    const handleSetUsername = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            // Check if username is unique
            const { data: existingUser } = await supabase
                .from('profiles')
                .select('username')
                .eq('username', username)
                .single();

            if (existingUser) {
                Alert.alert('Error', 'Username already taken');
                return;
            }

            // Set username in profiles table
            const { error } = await supabase
                .from('profiles')
                .upsert({
                    id: user?.id,
                    username,
                    updated_at: new Date()
                });

            if (error) throw error;
            <Redirect href={'/(app' as ExternalPathString} />
        } catch (error) {
            Alert.alert('Error', (error as Error).message);
        }
    };

    return (
        <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
            <TextInput
                placeholder="Choose a username"
                value={username}
                onChangeText={setUsername}
                style={{ padding: 10, borderWidth: 1, marginBottom: 20 }}
            />
            <Button title="Set Username" onPress={handleSetUsername} />
        </View>
    );
}
