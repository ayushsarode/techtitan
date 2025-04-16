import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/supabase/auth';
import { supabase } from '@/lib/supabase/client';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Get initial session and set up auth listener
    const initAuth = async () => {
      setLoading(true);
      
      try {
        // Get current session
        const session = await authService.getSession();
        setSession(session);
        
        if (session) {
          // Get user data
          const user = await authService.getCurrentUser();
          setUser(user);
          
          // Check if user is admin
          if (user) {
            const { data } = await supabase
              .from('users')
              .select('role')
              .eq('id', user.id)
              .single();
            
            setIsAdmin(data?.role === 'admin');
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Set up auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        
        if (session) {
          const user = await authService.getCurrentUser();
          setUser(user);
          
          // Check if user is admin on auth change
          if (user) {
            const { data } = await supabase
              .from('users')
              .select('role')
              .eq('id', user.id)
              .single();
            
            setIsAdmin(data?.role === 'admin');
          }
        } else {
          setUser(null);
          setIsAdmin(false);
        }
      }
    );

    // Clean up subscription
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Sign up function
  const signUp = async (email, password, username) => {
    try {
      await authService.signUp({ email, password, username });
      router.push('/auth/verify-email');
    } catch (error) {
      throw new Error(error.message);
    }
  };

  // Sign in function
  const login = async (email, password) => {
    try {
      const { session } = await authService.login({ email, password });
      if (session) {
        router.push('/dashboard');
      }
    } catch (error) {
      throw new Error(error.message);
    }
  };

  // Sign out function
  const logout = async () => {
    try {
      await authService.logout();
      router.push('/');
    } catch (error) {
      throw new Error(error.message);
    }
  };

  return {
    user,
    session,
    loading,
    isAdmin,
    signUp,
    login,
    logout,
  };
}
