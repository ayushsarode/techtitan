import { supabase } from './client';

export const adminService = {
  // Check if user is an admin
  async isAdmin(userId) {
    const { data, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return data?.role === 'admin';
  },

  // Get all users (admin only)
  async getAllUsers() {
    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        user_settings (*),
        daily_summaries (*)
      `);
    
    if (error) throw error;
    return data;
  },

  // Get dashboard summary (admin only)
  async getDashboardSummary() {
    const { data, error } = await supabase
      .from('admin_dashboard_summary')
      .select('*')
      .single();
    
    if (error) throw error;
    return data;
  },

  // Create a new challenge (admin only)
  async createChallenge(challenge) {
    const { data, error } = await supabase
      .from('challenges')
      .insert(challenge)
      .select();
    
    if (error) throw error;
    return data;
  },

  // Generate and save a report
  async generateReport(adminId, reportParams) {
    const { data, error } = await supabase
      .from('admin_reports')
      .insert({
        admin_id: adminId,
        title: reportParams.title,
        description: reportParams.description,
        report_type: reportParams.report_type,
        parameters: reportParams.parameters,
      })
      .select();
    
    if (error) throw error;
    return data;
  },
};
