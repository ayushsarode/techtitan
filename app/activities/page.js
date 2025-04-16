'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useAuth } from '../providers';
import Nav from '../components/Nav';
import PrivateRoute from '../components/PrivateRoute';

export default function Activities() {
  const { user } = useAuth();
  const router = useRouter();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    category: '',
    dateFrom: '',
    dateTo: ''
  });

  useEffect(() => {
    if (user) {
      fetchActivities();
    }
  }, [user]);

  async function fetchActivities() {
    setLoading(true);
    try {
      let query = supabase
        .from('carbon_activities')
        .select(`
          *,
          activity_categories (name, icon)
        `)
        .eq('user_id', user.id)
        .order('activity_date', { ascending: false });
      
      // Apply filters if set
      if (filter.category) {
        query = query.eq('category_id', filter.category);
      }
      
      if (filter.dateFrom) {
        query = query.gte('activity_date', filter.dateFrom);
      }
      
      if (filter.dateTo) {
        query = query.lte('activity_date', filter.dateTo);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleFilterChange(e) {
    const { name, value } = e.target;
    setFilter(prev => ({
      ...prev,
      [name]: value
    }));
  }

  function applyFilters(e) {
    e.preventDefault();
    fetchActivities();
  }

  function resetFilters() {
    setFilter({
      category: '',
      dateFrom: '',
      dateTo: ''
    });
    // Fetch activities without filters
    fetchActivities();
  }

  const deleteActivity = async (id) => {
    if (!confirm('Are you sure you want to delete this activity?')) return;
    
    try {
      const { error } = await supabase
        .from('carbon_activities')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Refresh activities list
      fetchActivities();
    } catch (error) {
      console.error('Error deleting activity:', error);
    }
  };

  return (
    <PrivateRoute>
      <Nav />
      <div className="container mx-auto px-4 py-8 bg-green-100 h-screen">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Your Activities</h1>
          <Link href="/activities/add" className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
            Add New Activity
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-medium text-gray-700 mb-4">Filter Activities</h2>
          <form onSubmit={applyFilters} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                name="category"
                value={filter.category}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">All Categories</option>
                <option value="1">Transportation</option>
                <option value="2">Food</option>
                <option value="3">Home Energy</option>
                <option value="4">Shopping</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                From Date
              </label>
              <input
                type="date"
                name="dateFrom"
                value={filter.dateFrom}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To Date
              </label>
              <input
                type="date"
                name="dateTo"
                value={filter.dateTo}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            
            <div className="flex items-end space-x-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Apply Filters
              </button>
              <button
                type="button"
                onClick={resetFilters}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Reset
              </button>
            </div>
          </form>
        </div>
        
       (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Activity
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Carbon Impact
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Points
                  </th>
                
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
  {/* Demo row */}
  <tr className="bg-green-50 hover:bg-green-100">
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
      {new Date().toLocaleDateString()}
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <span className="text-sm font-medium text-gray-900">Transportation</span>
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <span className="text-sm text-gray-900">Went to Job </span>
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <span className="text-sm text-red-600">150 kg CO2</span>
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <span className="text-sm text-blue-600">+200</span>
    </td>
    
  </tr>

  {/* Real activities */}
  {activities.map((activity) => (
    <tr key={activity.id} className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {new Date(activity.activity_date).toLocaleDateString()}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="text-sm font-medium text-gray-900">
          {activity.activity_categories.name}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="text-sm text-gray-900">{activity.activity_type}</span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="text-sm text-red-600">{activity.carbon_amount} kg CO2</span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="text-sm text-blue-600">+{activity.points_earned}</span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <button
          onClick={() => deleteActivity(activity.id)}
          className="text-red-600 hover:text-red-900"
        >
          Delete
        </button>
      </td>
    </tr>
  ))}
</tbody>

            </table>
          </div>
        )
      </div>
    </PrivateRoute>
  );
}