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

    useEffect(() => {
        const loadSession = async () => {
            const { data, error } = await supabase.auth.getSession();
            if (error) {
                console.error('Error getting session:', error);
                return;
            }
            setSession(data.session);
            setUser(data.session?.user || null);
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
        <SessionContext.Provider value={{ session, user, signInWithPhone, verifyOtp, signOut }}>
            {children}
        </SessionContext.Provider>
    );
};