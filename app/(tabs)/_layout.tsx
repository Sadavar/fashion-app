import { ExternalPathString, Tabs, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { useSession } from '@/context/SessionContext';
import { supabase } from '@/lib/supabase';
import { ActivityIndicator, View } from 'react-native';

export default function TabLayout() {
    const [loading, setLoading] = useState(true);
    const [initialRoute, setInitialRoute] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        console.log('Tab layout mounted');
        checkUser();
    }, []);

    const checkUser = async () => {
        try {
            // Get current user
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                console.log('no user');
                setInitialRoute('/login');
            } else {
                console.log('user exists');
                // Check if user has set username
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('username')
                    .eq('id', user.id)
                    .single();

                if (!profile?.username) {
                    console.log('needs username');
                    setInitialRoute('/username');
                } else {
                    console.log('has username, going to tabs');
                    setInitialRoute('/(tabs)');
                }
            }
        } catch (error) {
            console.error('Error checking user:', error);
            setInitialRoute('/login');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Only navigate when `initialRoute` is set and not loading
        if (!loading && initialRoute) {
            router.replace({ pathname: initialRoute as ExternalPathString });
        }
    }, [loading, initialRoute, router]); // Ensure this effect runs after `initialRoute` is set

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    return (
        <Tabs>
            <Tabs.Screen
                name="index"
                options={{
                    tabBarIcon: ({ color }) => (
                        <MaterialIcons name="explore" size={30} color={color} />
                    ),
                    tabBarLabel: () => null,
                    headerTitle: 'Discover',
                }}
            />
            <Tabs.Screen
                name="post"
                options={{
                    tabBarIcon: ({ color }) => (
                        <MaterialIcons name="add-box" size={30} color={color} />
                    ),
                    tabBarLabel: () => null,
                    headerTitle: 'Post',
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    tabBarIcon: ({ color }) => (
                        <MaterialIcons name="person" size={30} color={color} />
                    ),
                    tabBarLabel: () => null,
                    headerTitle: 'Profile',
                }}
            />
        </Tabs>
    );
}
