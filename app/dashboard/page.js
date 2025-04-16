'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '../providers';
import Nav from '../components/Nav';
import PrivateRoute from '../components/PrivateRoute';
import Link from 'next/link';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export default function Dashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [carbonByCategory, setCarbonByCategory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  async function fetchData() {
    setLoading(true);
    try {
      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Fetch recent activities
      const { data: activities, error: activitiesError } = await supabase
        .from('carbon_activities')
        .select(`
          *,
          activity_categories (name, icon)
        `)
        .eq('user_id', user.id)
        .order('activity_date', { ascending: false })
        .limit(5);

      if (activitiesError) throw activitiesError;
      setRecentActivities(activities);

      // Fetch carbon by category
      const { data: catData, error: catError } = await supabase.rpc(
        'get_carbon_by_category',
        { user_id_param: user.id }
      );

      if (catError) {
        // Fallback if stored procedure isn't available
        const { data, error } = await supabase
          .from('carbon_activities')
          .select(`
            carbon_amount,
            activity_categories (id, name)
          `)
          .eq('user_id', user.id);
          
        if (error) throw error;
        
        // Aggregate data manually
        const categoryMap = {};
        data.forEach(item => {
          const categoryId = item.activity_categories.id;
          const categoryName = item.activity_categories.name;
          
          if (!categoryMap[categoryId]) {
            categoryMap[categoryId] = {
              category_id: categoryId,
              category_name: categoryName,
              total_carbon: 0
            };
          }
          
          categoryMap[categoryId].total_carbon += item.carbon_amount;
        });
        
        setCarbonByCategory(Object.values(categoryMap));
      } else {
        setCarbonByCategory(catData);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }

  const COLORS = ['#38A169', '#4299E1', '#F6AD55', '#F56565', '#9F7AEA'];

  if (loading) {
    return (
      <PrivateRoute>
        <Nav />
        <div className="container mx-auto px-4 py-16 flex justify-center items-center">
          <div className="text-center">
            <div className="spinner h-12 w-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-600 font-medium">Loading your dashboard...</p>
          </div>
        </div>
      </PrivateRoute>
    );
  }

  return (
    <PrivateRoute>
      <Nav />
      <div className="container mx-auto px-4 py-8 bg-green-100">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-green-500 to-teal-400 rounded-xl shadow-lg mb-8 p-6 text-white">
          <h1 className="text-3xl font-bold">Welcome, {profile?.full_name || 'Eco Warrior'}!</h1>
          <p className="mt-2 opacity-90">Track your sustainability journey and reduce your carbon footprint</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            {/* Carbon Impact Summary Cards */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Your Carbon Impact</h2>
                <Link href="/insights" className="text-green-600 hover:text-green-800 text-sm font-medium flex items-center">
                  View details
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-5 rounded-lg border border-green-100">
                  <div className="flex items-center mb-2">
                    <div className="bg-green-100 p-2 rounded-full mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-gray-600 font-medium">Total Carbon Saved</p>
                  </div>
                  <p className="text-3xl font-bold text-green-600">{profile?.total_carbon_saved?.toFixed(2) || '150'} <span className="text-lg">kg CO₂</span></p>
                </div>
                
                <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-5 rounded-lg border border-blue-100">
                  <div className="flex items-center mb-2">
                    <div className="bg-blue-100 p-2 rounded-full mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-gray-600 font-medium">Total Points</p>
                  </div>
                  <p className="text-3xl font-bold text-blue-600">{profile?.total_points || '200'}</p>
                </div>
              </div>
            </div>
            
            {/* Recent Activities */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Recent Activities</h2>
                <Link href="/activities" className="text-green-600 hover:text-green-800 text-sm font-medium flex items-center">
                  View all
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
              
              {recentActivities.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-100">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p className="mt-4 text-gray-500 font-medium">No activities recorded yet.</p>
                  <Link href="/activities/add">
                    <button className="mt-4 px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200 shadow-sm font-medium flex items-center mx-auto">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Add your first activity
                    </button>
                  </Link>
                </div>
              ) : (
                <div className="overflow-hidden bg-white rounded-xl border border-gray-100">
                  <ul role="list" className="divide-y divide-gray-100">
                    {recentActivities.map((activity) => (
                      <li key={activity.id} className="hover:bg-gray-50 transition-colors duration-150">
                        <div className="flex items-center px-4 py-4">
                          <div className="bg-green-100 p-3 rounded-full mr-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                              <p className="font-medium text-green-600">{activity.activity_type}</p>
                              <div className="mt-1 flex items-center text-sm text-gray-500">
                                <span>{new Date(activity.activity_date).toLocaleDateString()}</span>
                                <span className="mx-2">•</span>
                                <span>{activity.activity_categories.name}</span>
                              </div>
                            </div>
                            <div className="mt-4 flex-shrink-0 sm:mt-0">
                              <div className="flex items-center text-sm font-medium text-red-600">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                {activity.carbon_amount.toFixed(2)} kg CO₂
                              </div>
                              <div className="flex items-center mt-1 text-sm font-medium text-blue-600">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                +{activity.points_earned} points
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
          
          {/* Right Column */}
          <div className="space-y-6">
            {/* Carbon By Category */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Carbon Footprint by Category</h2>
              
              {carbonByCategory.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-100">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                  </svg>
                  <p className="mt-4 text-gray-500 font-medium">No data available yet.</p>
                  <p className="text-sm text-gray-400 mt-1">Start adding activities to see your impact.</p>
                </div>
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={carbonByCategory}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="total_carbon"
                        nameKey="category_name"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {carbonByCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value.toFixed(2)} kg CO₂`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
            
            {/* Quick Actions */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Link href="/activities/add" className="flex items-center justify-center w-full px-4 py-3 border border-transparent rounded-lg shadow-sm text-white bg-green-600 hover:bg-green-700 transition-colors duration-200 font-medium">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Activity
                </Link>
                <Link href="/insights" className="flex items-center justify-center w-full px-4 py-3 border border-green-600 rounded-lg shadow-sm text-green-600 bg-white hover:bg-green-50 transition-colors duration-200 font-medium">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Get Insights
                </Link>
                <Link href="/leaderboard" className="flex items-center justify-center w-full px-4 py-3 border border-blue-600 rounded-lg shadow-sm text-blue-600 bg-white hover:bg-blue-50 transition-colors duration-200 font-medium">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  View Leaderboard
                </Link>
              </div>
            </div>
            
            {/* Tips Card */}
            <div className="bg-gradient-to-br from-blue-50 to-teal-50 p-6 rounded-xl shadow-md border border-teal-100">
              <h2 className="text-lg font-bold text-gray-800 mb-3">Eco Tip of the Day</h2>
              <p className="text-gray-600">
                Unplug electronic devices when not in use. Even when turned off, many devices continue to draw power in "standby" mode.
              </p>
              <div className="mt-4 text-right">
                <Link href="/tips" className="text-teal-600 hover:text-teal-800 text-sm font-medium">
                  More tips →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PrivateRoute>
  );
}