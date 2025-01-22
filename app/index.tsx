// app/index.tsx
import { useEffect, useState } from 'react';
import { ExternalPathString, Href, Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { supabase } from '../lib/supabase';

export default function Index() {
    // Show a loading spinner while checking auth state
    const [loading, setLoading] = useState(true);
    const [initialRoute, setInitialRoute] = useState<string | null>(null);

    useEffect(() => {
        checkUser();
    }, []);

    const checkUser = async () => {
        try {
            // Get current user
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                setInitialRoute('/auth/login');
            } else {
                // Check if user has set username
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('username')
                    .eq('id', user.id)
                    .single();

                if (!profile?.username) {
                    setInitialRoute('/auth/username');
                } else {
                    setInitialRoute('/(app)');
                }
            }
        } catch (error) {
            console.error('Error checking user:', error);
            setInitialRoute('/auth/login');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    if (initialRoute) {
        return <Redirect href={initialRoute as ExternalPathString} />;
    }

    return null;
}