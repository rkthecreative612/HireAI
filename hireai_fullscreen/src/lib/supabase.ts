import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const supabaseAnonKey = (
  import.meta.env.VITE_SUPABASE_ANON_KEY || 
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 
  ''
).trim();

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

let clientInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured) {
    return null;
  }
  if (!clientInstance) {
    try {
      clientInstance = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
    } catch (err) {
      console.warn('Failed to initialize Supabase client:', err);
      return null;
    }
  }
  return clientInstance;
}

export const supabase = getSupabaseClient();

/**
 * Verifies if the Supabase project endpoint is reachable and responsive
 * without needing any existing database tables.
 */
export async function verifySupabaseConnection(): Promise<{
  success: boolean;
  message: string;
  url?: string;
  error?: any;
}> {
  if (!isSupabaseConfigured) {
    return {
      success: false,
      message: 'Supabase environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY) are not set.',
    };
  }

  const client = getSupabaseClient();
  if (!client) {
    return {
      success: false,
      message: 'Supabase client could not be initialized.',
    };
  }

  try {
    // Check connection via auth endpoint (does not require any custom database tables)
    const { error } = await client.auth.getSession();
    if (error) {
      return {
        success: false,
        message: `Supabase returned an authentication/API error: ${error.message}`,
        url: supabaseUrl,
        error,
      };
    }

    return {
      success: true,
      message: 'Successfully connected to Supabase project.',
      url: supabaseUrl,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Connection to Supabase failed: ${err?.message || 'Unknown network error'}`,
      url: supabaseUrl,
      error: err,
    };
  }
}
