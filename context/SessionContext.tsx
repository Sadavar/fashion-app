// contexts/SessionContext.tsx
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';
import { User, Session } from '@supabase/supabase-js';
import { SupabaseSession } from '@/types/supabase';
import { router } from 'expo-router';

interface SessionContextType {
    session: Session | null;
    user: User | null;
    username: string | null;
    signInWithPhone: (phone: string) => Promise<void>;
    verifyOtp: (phone: string, token: string) => Promise<SupabaseSession>;
    signOut: () => Promise<void>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const useSession = () => {
    const context = useContext(SessionContext);
    if (context === undefined) {
        throw new Error('useSession must be used within a SessionProvider');
    }
    return context;
};

export const SessionProvider = ({ children }: { children: ReactNode }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [username, setUsername] = useState<string | null>(null);

    const fetchUsername = async (userId: string) => {
        const { data, error } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', userId)
            .single();

        if (!error && data) {
            setUsername(data.username);
        }
    };

    useEffect(() => {
        const loadSession = async () => {
            const { data, error } = await supabase.auth.getSession();
            if (error) {
                console.error('Error getting session:', error);
                return;
            }
            if (data.session?.user) {
                setSession(data.session);
                setUser(data.session.user);
                await fetchUsername(data.session.user.id);
            }
        };
        loadSession();
    }, []);

    useEffect(() => {
        if (session) {
            AsyncStorage.setItem('supabase.auth.token', JSON.stringify(session));
        } else {
            AsyncStorage.removeItem('supabase.auth.token');
        }
    }, [session]);

    const signInWithPhone = async (phone: string) => {
        const { error } = await supabase.auth.signInWithOtp({ phone });
        if (error) throw error;
    };

    const verifyOtp = async (phone: string, token: string): Promise<SupabaseSession> => {
        const { data, error } = await supabase.auth.verifyOtp({ phone, token, type: 'sms' });
        if (error) throw error;
        if (!data) throw new Error('No data returned from verifyOtp');
        if (!data.session) throw new Error('No session returned from verifyOtp');
        setSession(data.session);
        setUser(data.session.user);
        await fetchUsername(data.session.user.id);
        if (!data.user) throw new Error('No user returned from verifyOtp');
        return { user: data.user, session: data.session };
    };

    const signOut = async () => {
        console.log("signing out");
        await supabase.auth.signOut();
        setSession(null);
        setUser(null);
        router.replace({ pathname: '/login' });
    };

    return (
        <SessionContext.Provider value={{ session, user, username, signInWithPhone, verifyOtp, signOut }}>
            {children}
        </SessionContext.Provider>
    );
};
