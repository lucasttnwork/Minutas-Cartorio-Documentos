/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
  type ReactNode,
} from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase, type Profile } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Use ref to track if initial auth check is done to prevent race conditions
  const initCompleteRef = useRef(false);
  // Track if we're currently processing auth to avoid duplicate profile fetches
  const processingAuthRef = useRef(false);

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      console.log('[Auth] Fetching profile for user:', userId);

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('[Auth] Error fetching profile:', error.message, error.code);
        // Se o profile nao existe, pode ser que o trigger nao criou ainda
        // Vamos tentar novamente apos um pequeno delay
        if (error.code === 'PGRST116') {
          console.log('[Auth] Profile not found, may need to wait for trigger...');
        }
        return null;
      }

      console.log('[Auth] Profile fetched successfully:', data?.email);
      return data;
    } catch (err) {
      console.error('[Auth] Exception fetching profile:', err);
      return null;
    }
  }, []);

  const handleUserChange = useCallback(
    async (newUser: User | null, source: string = 'unknown') => {
      console.log('[Auth] handleUserChange called from:', source, 'user:', newUser?.email);

      // Avoid concurrent processing
      if (processingAuthRef.current && newUser) {
        console.log('[Auth] Already processing auth, skipping duplicate call');
        return;
      }

      processingAuthRef.current = true;

      try {
        setUser(newUser);

        if (newUser) {
          const userProfile = await fetchProfile(newUser.id);
          setProfile(userProfile);
        } else {
          setProfile(null);
        }
      } finally {
        processingAuthRef.current = false;
      }
    },
    [fetchProfile]
  );

  useEffect(() => {
    // Track if this effect has been cleaned up
    let isMounted = true;

    // Check initial session
    const initAuth = async () => {
      console.log('[Auth] Initializing auth...');

      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('[Auth] Error getting session:', error.message);
        }

        console.log('[Auth] Session check:', session ? 'Found session' : 'No session');

        // Only process if still mounted and not already handled by onAuthStateChange
        if (isMounted && session?.user && !initCompleteRef.current) {
          console.log('[Auth] Found existing user:', session.user.email);
          await handleUserChange(session.user, 'initAuth');
        }
      } catch (err) {
        console.error('[Auth] Exception during init:', err);
      } finally {
        // ALWAYS set loading to false, even on error
        if (isMounted) {
          initCompleteRef.current = true;
          setLoading(false);
          console.log('[Auth] Init complete, loading set to false');
        }
      }
    };

    // Subscribe to auth changes FIRST, before checking session
    // This ensures we catch any auth events that fire during init
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[Auth] Auth state change:', event, session?.user?.email);

        if (!isMounted) {
          console.log('[Auth] Component unmounted, ignoring auth state change');
          return;
        }

        if (event === 'SIGNED_IN' && session?.user) {
          // Set loading false IMMEDIATELY when we have a user
          // Profile fetch happens in background and doesn't block rendering
          if (!initCompleteRef.current) {
            initCompleteRef.current = true;
            setLoading(false);
            console.log('[Auth] Loading set to false via onAuthStateChange SIGNED_IN');
          }
          // Fetch profile in background (don't block)
          handleUserChange(session.user, 'onAuthStateChange-SIGNED_IN');
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
          // Ensure loading is false on sign out
          if (!initCompleteRef.current) {
            initCompleteRef.current = true;
            setLoading(false);
          }
        } else if (event === 'INITIAL_SESSION') {
          // Handle INITIAL_SESSION event - Supabase may fire this instead of SIGNED_IN on load
          console.log('[Auth] INITIAL_SESSION event received');
          // Set loading false IMMEDIATELY
          if (!initCompleteRef.current) {
            initCompleteRef.current = true;
            setLoading(false);
            console.log('[Auth] Loading set to false via INITIAL_SESSION');
          }
          // Fetch profile in background (don't block)
          if (session?.user) {
            handleUserChange(session.user, 'onAuthStateChange-INITIAL_SESSION');
          }
        }
      }
    );

    // Now check session
    initAuth();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [handleUserChange]);

  const signIn = useCallback(
    async (email: string, password: string): Promise<{ error: string | null }> => {
      try {
        console.log('[Auth] Attempting sign in for:', email);

        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          console.error('[Auth] Sign in error:', error.message);
          return { error: error.message };
        }

        console.log('[Auth] Sign in successful, user:', data.user?.id);

        if (data.user) {
          await handleUserChange(data.user);
          console.log('[Auth] User state updated');
        }

        return { error: null };
      } catch (err) {
        console.error('[Auth] Sign in exception:', err);
        return { error: 'Erro inesperado ao fazer login' };
      }
    },
    [handleUserChange]
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  }, []);

  const isAuthenticated = useMemo(() => !!user, [user]);

  const value = useMemo(
    () => ({
      user,
      profile,
      loading,
      isAuthenticated,
      signIn,
      signOut,
    }),
    [user, profile, loading, isAuthenticated, signIn, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
