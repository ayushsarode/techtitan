import { supabase } from './client';

export const activityService = {
  async getCategories() {
    const { data, error } = await supabase
      .from('activity_categories')
      .select('*');
    
    if (error) throw error;
    return data;
  },

  async getActivityTypesByCategory(categoryId) {
    const { data, error } = await supabase
      .from('activity_types')
      .select('*')
      .eq('category_id', categoryId);
    
    if (error) throw error;
    return data;
  },

  async getAllActivityTypes() {
    const { data, error } = await supabase
      .from('activity_types')
      .select(`
        *,
        activity_categories (
          name,
          icon_url
        )
      `);
    
    if (error) throw error;
    return data;
  },

  async logActivity(userId, activity) {
    const { data: activityType, error: activityTypeError } = await supabase
      .from('activity_types')
      .select('base_co2_per_unit')
      .eq('id', activity.activity_type_id)
      .single();
    
    if (activityTypeError) throw activityTypeError;

    const co2_emission = activityType.base_co2_per_unit * activity.quantity;

    const { data, error } = await supabase
      .from('activity_logs')
      .insert({
        user_id: userId,
        activity_type_id: activity.activity_type_id,
        date: activity.date,
        quantity: activity.quantity,
        co2_emission,
        notes: activity.notes,
      })
      .select();
    
    if (error) throw error;

    await this.updateDailySummary(userId, activity.date);

    return data;
  },

  async updateDailySummary(userId, date) {
    const { data: totalCO2Data, error: totalCO2Error } = await supabase
      .rpc('calculate_daily_footprint', {
        user_uuid: userId,
        day: date,
      });

    if (totalCO2Error) throw totalCO2Error;

    const { count: activitiesCount, error: countError } = await supabase
      .from('activity_logs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('date', date);

    if (countError) throw countError;

    const { data: settings, error: settingsError } = await supabase
      .from('user_settings')
      .select('daily_co2_target')
      .eq('user_id', userId)
      .single();

    if (settingsError && settingsError.code !== 'PGRST116') throw settingsError;

    const daily_co2_target = settings?.daily_co2_target || 10.0;
    const target_achieved = totalCO2Data <= daily_co2_target;

    let xp_earned = 0;
    if (target_achieved) {
      xp_earned = Math.round((daily_co2_target - totalCO2Data) * 10);
    }

    const { data, error } = await supabase
      .from('daily_summaries')
      .upsert({
        user_id: userId,
        date,
        total_co2: totalCO2Data,
        activities_count: activitiesCount || 0,
        xp_earned,
        target_achieved,
      })
      .select();

    if (error) throw error;

    if (xp_earned > 0) {
      await supabase.rpc('add_user_xp', {
        user_uuid: userId,
        xp_amount: xp_earned,
      });
    }

    return data;
  },

  async getUserActivityLogs(userId, startDate, endDate) {
    const { data, error } = await supabase
      .from('activity_logs')
      .select(`
        *,
        activity_types (
          name,
          unit_type,
          activity_categories (
            name,
            icon_url
          )
        )
      `)
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false });

    if (error) throw error;
    return data;
  },

  async deleteActivityLog(logId, userId) {
    const { data: logData, error: logError } = await supabase
      .from('activity_logs')
      .select('date')
      .eq('id', logId)
      .eq('user_id', userId)
      .single();

    if (logError) throw logError;

    const { error } = await supabase
      .from('activity_logs')
      .delete()
      .eq('id', logId)
      .eq('user_id', userId);

    if (error) throw error;

    if (logData) {
      await this.updateDailySummary(userId, logData.date);
    }

    return true;
  },
};
