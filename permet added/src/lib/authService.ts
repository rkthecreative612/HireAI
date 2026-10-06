import { getSupabaseClient, isSupabaseConfigured } from './supabase';

export interface RecruiterUser {
  id: string;
  email: string;
  role: 'admin' | 'recruiter';
  provider: 'supabase' | 'local';
}

const STORAGE_KEY_RECRUITER_USER = 'hireai_recruiter_session';

// Default built-in credentials for zero-config onboarding / local testing
export const DEFAULT_ADMIN_EMAIL = 'admin@hireai.com';
export const DEFAULT_ADMIN_PASS = 'hireai2026';

/**
 * Get current recruiter user session
 */
export async function getCurrentRecruiterUser(): Promise<RecruiterUser | null> {
  const client = getSupabaseClient();
  
  if (client) {
    try {
      const { data: { session } } = await client.auth.getSession();
      if (session?.user) {
        return {
          id: session.user.id,
          email: session.user.email || 'recruiter@hireai.com',
          role: 'recruiter',
          provider: 'supabase'
        };
      }
    } catch (err) {
      console.warn('Error reading Supabase session:', err);
    }
  }

  // Fallback to local session storage
  try {
    const raw = localStorage.getItem(STORAGE_KEY_RECRUITER_USER);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('Error reading local session:', err);
  }

  return null;
}

/**
 * Sign in recruiter using Supabase Auth, with safe local fallback
 */
export async function loginRecruiter(
  emailInput: string,
  passwordInput: string
): Promise<{ success: boolean; user?: RecruiterUser; error?: string }> {
  const email = emailInput.trim().toLowerCase();
  const password = passwordInput.trim();

  if (!email || !password) {
    return { success: false, error: 'Please provide both email/username and password.' };
  }

  const client = getSupabaseClient();

  // 1. Try Supabase Auth if client is configured
  if (client && isSupabaseConfigured) {
    try {
      const { data, error } = await client.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        // If credentials failed on Supabase, check if they used default emergency admin credentials
        if (
          (email === DEFAULT_ADMIN_EMAIL.toLowerCase() || email === 'admin') &&
          password === DEFAULT_ADMIN_PASS
        ) {
          const localUser: RecruiterUser = {
            id: 'local-admin-root',
            email: DEFAULT_ADMIN_EMAIL,
            role: 'admin',
            provider: 'local'
          };
          localStorage.setItem(STORAGE_KEY_RECRUITER_USER, JSON.stringify(localUser));
          return { success: true, user: localUser };
        }

        return { success: false, error: error.message };
      }

      if (data.user) {
        const recruiterUser: RecruiterUser = {
          id: data.user.id,
          email: data.user.email || email,
          role: 'recruiter',
          provider: 'supabase'
        };
        localStorage.setItem(STORAGE_KEY_RECRUITER_USER, JSON.stringify(recruiterUser));
        return { success: true, user: recruiterUser };
      }
    } catch (err: any) {
      console.warn('Supabase sign-in exception:', err);
    }
  }

  // 2. Fallback when Supabase is not yet configured on environment
  if (
    (email === DEFAULT_ADMIN_EMAIL.toLowerCase() || email === 'admin') &&
    password === DEFAULT_ADMIN_PASS
  ) {
    const localUser: RecruiterUser = {
      id: 'local-admin-root',
      email: DEFAULT_ADMIN_EMAIL,
      role: 'admin',
      provider: 'local'
    };
    localStorage.setItem(STORAGE_KEY_RECRUITER_USER, JSON.stringify(localUser));
    return { success: true, user: localUser };
  }

  // Allow custom local recruiter login if Supabase is not connected
  if (!isSupabaseConfigured && password.length >= 6) {
    const localUser: RecruiterUser = {
      id: `recruiter-${Date.now()}`,
      email,
      role: 'recruiter',
      provider: 'local'
    };
    localStorage.setItem(STORAGE_KEY_RECRUITER_USER, JSON.stringify(localUser));
    return { success: true, user: localUser };
  }

  return {
    success: false,
    error: isSupabaseConfigured
      ? 'Invalid credentials. Please check your email and password.'
      : `Invalid credentials. For local testing, use: ${DEFAULT_ADMIN_EMAIL} / ${DEFAULT_ADMIN_PASS}`
  };
}

/**
 * Sign up a new recruiter in Supabase Auth
 */
export async function signUpRecruiter(
  emailInput: string,
  passwordInput: string
): Promise<{ success: boolean; user?: RecruiterUser; message?: string; error?: string }> {
  const email = emailInput.trim().toLowerCase();
  const password = passwordInput.trim();

  if (!email || !password) {
    return { success: false, error: 'Please provide both email and password.' };
  }

  if (password.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters long.' };
  }

  const client = getSupabaseClient();

  if (client && isSupabaseConfigured) {
    try {
      const { data, error } = await client.auth.signUp({
        email,
        password
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        const recruiterUser: RecruiterUser = {
          id: data.user.id,
          email: data.user.email || email,
          role: 'recruiter',
          provider: 'supabase'
        };
        localStorage.setItem(STORAGE_KEY_RECRUITER_USER, JSON.stringify(recruiterUser));
        return {
          success: true,
          user: recruiterUser,
          message: data.session
            ? 'Account created and logged in successfully!'
            : 'Account registered! Please check your email inbox to confirm your account (if email verification is enabled in Supabase).'
        };
      }
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to sign up with Supabase' };
    }
  }

  // Local fallback registration
  const localUser: RecruiterUser = {
    id: `recruiter-${Date.now()}`,
    email,
    role: 'recruiter',
    provider: 'local'
  };
  localStorage.setItem(STORAGE_KEY_RECRUITER_USER, JSON.stringify(localUser));
  return {
    success: true,
    user: localUser,
    message: 'Recruiter profile created successfully!'
  };
}

/**
 * Log out recruiter
 */
export async function logoutRecruiter(): Promise<void> {
  const client = getSupabaseClient();
  if (client) {
    try {
      await client.auth.signOut();
    } catch (err) {
      console.warn('Error during Supabase sign out:', err);
    }
  }
  localStorage.removeItem(STORAGE_KEY_RECRUITER_USER);
}
