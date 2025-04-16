import { supabase } from './client';

export const authService = {
  // Get current session
  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  // Get current user
  async getCurrentUser() {
    const { data } = await supabase.auth.getUser();
    return data.user;
  },

  // Sign up a new user
  async signUp({ email, password, username }) {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) throw authError;

    if (authData.user) {
      const { data, error } = await supabase.from('users').insert([
        {
          id: authData.user.id,
          email,
          username,
          role: 'user',
        },
      ]);

      if (error) {
        console.error('Failed to create user profile', error);
        throw error;
      }

      await supabase.from('user_settings').insert([
        {
          user_id: authData.user.id,
          daily_co2_target: 10.0,
          notifications_enabled: true,
          leaderboard_visible: true,
          theme: 'light',
          measurement_system: 'metric',
        },
      ]);

      return authData;
    }

    throw new Error('Failed to create user');
  },

  // Sign in a user
  async login({ email, password }) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    if (data.user) {
      await supabase
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', data.user.id);
    }

    return data;
  },

  // Sign out
  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Password reset request
  async resetPassword(email) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/update-password`,
    });

    if (error) throw error;
    return true;
  },
};
