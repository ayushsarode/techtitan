import { useState, useEffect } from 'react';
import { activityService } from '@/lib/supabase/activities';
import { useAuth } from './useAuth';

export function useActivities(startDate, endDate) {
  const [activities, setActivities] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activityTypes, setActivityTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    // Load activity categories and types
    const loadActivityData = async () => {
      try {
        const categoriesData = await activityService.getCategories();
        setCategories(categoriesData);
        
        const typesData = await activityService.getAllActivityTypes();
        setActivityTypes(typesData);
      } catch (error) {
        console.error('Error loading activity data:', error);
      }
    };

    loadActivityData();
  }, []);

  useEffect(() => {
    // Load user activities when user is available and dates are provided
    const loadUserActivities = async () => {
      if (!user || !startDate || !endDate) return;
      
      setLoading(true);
      try {
        const activitiesData = await activityService.getUserActivityLogs(
          user.id,
          startDate,
          endDate
        );
        setActivities(activitiesData);
      } catch (error) {
        console.error('Error loading user activities:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserActivities();
  }, [user, startDate, endDate]);

  // Log a new activity
  const logActivity = async (activityData) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      await activityService.logActivity(user.id, activityData);
      
      // Reload activities if dates are available
      if (startDate && endDate) {
        const updatedActivities = await activityService.getUserActivityLogs(
          user.id,
          startDate,
          endDate
        );
        setActivities(updatedActivities);
      }
      
      return true;
    } catch (error) {
      throw new Error(error.message);
    }
  };

  // Delete an activity
  const deleteActivity = async (activityId) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      await activityService.deleteActivityLog(activityId, user.id);
      
      // Update local state by removing the deleted activity
      setActivities(activities.filter(activity => activity.id !== activityId));
      
      return true;
    } catch (error) {
      throw new Error(error.message);
    }
  };

  return {
    activities,
    categories,
    activityTypes,
    loading,
    logActivity,
    deleteActivity,
  };
}
