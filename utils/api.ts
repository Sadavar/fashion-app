// utils/api.ts
import { supabase } from '@/utils/supabase';

export const fetchUsername = async (userId: string): Promise<string | null> => {
    const { data, error } = await supabase.from('profiles').select('username').eq('id', userId).single();
    if (error) {
        console.log('Error fetching username:', error);
        return null;
    }
    return data.username;
};