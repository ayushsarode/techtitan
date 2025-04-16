import { supabase } from './client';

export const plantService = {
  // Get available plant types
  async getPlantTypes() {
    const { data, error } = await supabase
      .from('plant_types')
      .select('*');
    
    if (error) throw error;
    return data;
  },

  // Get user's active plant
  async getUserActivePlant(userId) {
    const { data, error } = await supabase
      .from('user_plants')
      .select(`
        *,
        plant_types (*)
      `)
      .eq('user_id', userId)
      .eq('is_active', true)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "No rows returned"
    return data;
  },

  // Start growing a new plant
  async startGrowingPlant(userId, plantTypeId, name, co2ReducedGoal) {
    // First check if user has an active plant
    const { data: activePlant } = await supabase
      .from('user_plants')
      .select('id')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single();
    
    // If there's an active plant, deactivate it
    if (activePlant) {
      await supabase
        .from('user_plants')
        .update({ is_active: false })
        .eq('id', activePlant.id);
    }
    
    // Create the new plant
    const { data, error } = await supabase
      .from('user_plants')
      .insert({
        user_id: userId,
        plant_type_id: plantTypeId,
        name,
        growth_stage: 1,
        current_xp: 0,
        co2_reduced_goal: co2ReducedGoal,
        is_active: true,
      })
      .select();
    
    if (error) throw error;
    return data;
  },

  // Update plant growth based on user's XP
  async updatePlantGrowth(userId) {
    // Get the user's current active plant
    const { data: plant, error: plantError } = await supabase
      .from('user_plants')
      .select(`
        *,
        plant_types (*)
      `)
      .eq('user_id', userId)
      .eq('is_active', true)
      .single();
    
    if (plantError) throw plantError;
    
    if (!plant) return null;
    
    // Get user's total XP
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('total_xp')
      .eq('id', userId)
      .single();
    
    if (userError) throw userError;
    
    // Calculate new growth stage based on XP
    const xpLevels = plant.plant_types.xp_to_level_up;
    let newStage = 1;
    
    for (let i = 0; i < xpLevels.length; i++) {
      if (plant.current_xp >= xpLevels[i]) {
        newStage = i + 2; // +2 because stages start at 1 and array is 0-indexed
      } else {
        break;
      }
    }
    
    // Only update if growth stage has changed
    if (newStage !== plant.growth_stage) {
      const { data, error } = await supabase
        .from('user_plants')
        .update({
          growth_stage: newStage,
          date_last_leveled: new Date().toISOString(),
        })
        .eq('id', plant.id)
        .select();
      
      if (error) throw error;
      return data;
    }
    
    return plant;
  },
};
