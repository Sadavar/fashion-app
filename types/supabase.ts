// types/supabase.ts
import { User, Session } from '@supabase/supabase-js';

export interface SupabaseSession {
    user: User;
    session: Session;
}