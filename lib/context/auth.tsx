// lib/context/auth.tsx
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { useRouter, useSegments } from 'expo-router';

const AuthContext = createContext({});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const segments = useSegments();
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN') {
                checkUsername(session?.user?.id as string);
            } else if (event === 'SIGNED_OUT') {
                router.replace('/auth/login');
            }
            setLoading(false);
        });
    }, []);

    const checkUsername = async (userId: string) => {
        try {
            const { data: profile } = await supabase
                .from('profiles')
                .select('username')
                .eq('id', userId)
                .single();

            if (!profile?.username) {
                router.replace('/auth/username');
            } else {
                router.replace('/(app)');
            }
        } catch (error) {
            console.error('Error checking username:', error);
            router.replace('/auth/username');
        }
    };

    return (
        <AuthContext.Provider value={{ loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);