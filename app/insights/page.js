'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '../providers';
import Nav from '../components/Nav';
import PrivateRoute from '../components/PrivateRoute';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Insights() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [trends, setTrends] = useState([]);
  const [footprintByCategory, setFootprintByCategory] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [timeRange, setTimeRange] = useState('month'); // week, month, year

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, timeRange]);

  async function fetchData() {
    setLoading(true);
    try {
      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (profileError) throw profileError;
      setProfile(profileData);
      
      // Fetch time-series data
      const period = getPeriodParams(timeRange);
      const { data: trendsData, error: trendsError } = await supabase
        .from('carbon_activities')
        .select('activity_date, carbon_amount')
        .eq('user_id', user.id)
        .gte('activity_date', period.startDate)
        .lte('activity_date', period.endDate)
        .order('activity_date');
      
      if (trendsError) throw trendsError;
      
      // Process trends data by aggregating by date
      const aggregatedTrends = aggregateByDate(trendsData, period.format);
      setTrends(aggregatedTrends);
      
      // Fetch footprint by category
      const { data: catData, error: catError } = await supabase
        .from('carbon_activities')
        .select(`
          carbon_amount,
          activity_categories (id, name)
        `)
        .eq('user_id', user.id)
        .gte('activity_date', period.startDate)
        .lte('activity_date', period.endDate);
      
      if (catError) throw catError;
      
      // Aggregate data by category
      const categoryMap = {};
      catData.forEach(item => {
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
      
      setFootprintByCategory(Object.values(categoryMap));
      
      // Fetch personalized recommendations
      const { data: tipsData, error: tipsError } = await supabase
        .from('carbon_tips')
        .select('*')
        .order('points_potential', { ascending: false })
        .limit(5);
      
      if (tipsError) throw tipsError;
      setRecommendations(tipsData);
      
    } catch (error) {
      console.error('Error fetching insights data:', error);
    } finally {
      setLoading(false);
    }
  }

  function getPeriodParams(range) {
    const today = new Date();
    let startDate = new Date();
    let format = 'day';
    
    switch(range) {
      case 'week':
        startDate.setDate(today.getDate() - 7);
        format = 'day';
        break;
      case 'month':
        startDate.setMonth(today.getMonth() - 1);
        format = 'day';
        break;
      case 'year':
        startDate.setFullYear(today.getFullYear() - 1);
        format = 'month';
        break;
      default:
        startDate.setMonth(today.getMonth() - 1);
        format = 'day';
    }
    
    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0],
      format
    };
  }

  function aggregateByDate(data, format) {
    const aggregated = {};
    
    data.forEach(item => {
      let dateKey;
      const date = new Date(item.activity_date);
      if (format === 'day') {
        dateKey = date.toISOString().split('T')[0];
      } else if (format === 'month') {
        dateKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      }
      
      if (!aggregated[dateKey]) {
        aggregated[dateKey] = {
          date: dateKey,
          carbon: 0
        };
      }
      
      aggregated[dateKey].carbon += item.carbon_amount;
    });
    
    // Convert to array and sort by date
    return Object.values(aggregated).sort((a, b) => a.date.localeCompare(b.date));
  }

  return (
    <PrivateRoute>
      <Nav />
      <div className="container mx-auto px-4 py-8 bg-green-100 h-screen">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Carbon Insights</h1>
        
        {loading ? (
          <div className="text-center py-10">
            <div className="spinner h-10 w-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading your insights...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-700">Your Carbon Footprint Over Time</h2>
                <div className="inline-flex rounded-md shadow-sm" role="group">
                  <button
                    type="button"
                    onClick={() => setTimeRange('week')}
                    className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
                      timeRange === 'week'
                        ? 'bg-green-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                    }`}
                  >
                    Week
                  </button>
                  <button
                    type="button"
                    onClick={() => setTimeRange('month')}
                    className={`px-4 py-2 text-sm font-medium ${
                      timeRange === 'month'
                        ? 'bg-green-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border-t border-b border-gray-300'
                    }`}
                  >
                    Month
                  </button>
                  <button
                    type="button"
                    onClick={() => setTimeRange('year')}
                    className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
                      timeRange === 'year'
                        ? 'bg-green-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                    }`}
                  >
                    Year
                  </button>
                </div>
              </div>
              
              {trends.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 rounded-md">
                  <p className="text-gray-500">No activity data found for this time period.</p>
                  <p className="text-sm text-gray-400 mt-1">Start tracking activities to see your carbon trends.</p>
                </div>
              ) : (
                <div className="h-64 md:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={trends}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(date) => {
                          if (timeRange === 'year') {
                            return date.substring(5, 7); // Show month only
                          }
                          return date.substring(5); // Show month-day
                        }}
                      />
                      <YAxis 
                        label={{ value: 'kg CO2', angle: -90, position: 'insideLeft' }} 
                      />
                      <Tooltip 
                        formatter={(value) => [`${value.toFixed(2)} kg CO2`, 'Carbon']}
                        labelFormatter={(date) => {
                          if (timeRange === 'year') {
                            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                            const month = parseInt(date.substring(5, 7)) - 1;
                            return `${monthNames[month]} ${date.substring(0, 4)}`;
                          }
                          const formattedDate = new Date(date).toLocaleDateString();
                          return formattedDate;
                        }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="carbon"
                        name="Carbon Footprint"
                        stroke="#16a34a"
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
              
              <div className="mt-8">
                <h2 className="text-lg font-medium text-gray-700 mb-4">Category Breakdown</h2>
                
                {footprintByCategory.length === 0 ? (
                  <div className="text-center py-6 bg-gray-50 rounded-md">
                    <p className="text-gray-500">No category data available.</p>
                  </div>
                ) : (
                  <div className="overflow-hidden bg-white shadow sm:rounded-md">
                    <ul role="list" className="divide-y divide-gray-200">
                      {footprintByCategory.map((category) => (
                        <li key={category.category_id}>
                          <div className="px-4 py-4 sm:px-6">
                            <div className="flex items-center justify-between">
                              <div className="text-sm font-medium text-green-600">
                                {category.category_name}
                              </div>
                              <div className="text-sm text-gray-700">
                                {category.total_carbon.toFixed(2)} kg CO2
                              </div>
                            </div>
                            <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
                              <div 
                                className="bg-green-600 h-2.5 rounded-full" 
                                style={{ 
                                  width: `${Math.min(100, (category.total_carbon / (footprintByCategory.reduce((sum, cat) => sum + cat.total_carbon, 0) || 1)) * 100)}%` 
                                }}
                              ></div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-700 mb-4">Your Stats</h2>
              
              <div className="space-y-6">
                <div className="bg-green-50 p-4 rounded-md">
                  <p className="text-sm text-gray-500">Total Carbon Saved</p>
                  <p className="text-2xl font-bold text-green-600">{profile?.total_carbon_saved.toFixed(2)} kg CO2</p>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-md">
                  <p className="text-sm text-gray-500">Total Points</p>
                  <p className="text-2xl font-bold text-blue-600">{profile?.total_points}</p>
                </div>
                
                <h3 className="text-lg font-medium text-gray-700 pt-2">Recommendations</h3>
                
                {recommendations.length === 0 ? (
                  <div className="text-center py-4 bg-gray-50 rounded-md">
                    <p className="text-gray-500">No recommendations available.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recommendations.map((tip) => (
                      <div key={tip.id} className="border border-gray-200 rounded-md p-3 hover:bg-gray-50">
                        <h4 className="font-medium text-green-600">{tip.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{tip.description}</p>
                        <div className="flex justify-between items-center mt-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            tip.impact_level === 'high' ? 'bg-green-100 text-green-800' :
                            tip.impact_level === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {tip.impact_level} impact
                          </span>
                          <span className="text-sm text-blue-600">+{tip.points_potential} potential points</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </PrivateRoute>
  );
}

