'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/app/providers';
import Nav from '@/app/components/Nav';
import PrivateRoute from '@/app/components/PrivateRoute';
import { calculateCarbonFootprint, calculatePoints } from '@/lib/carbonCalculations';

export default function AddActivity() {
  const { user } = useAuth();
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [formData, setFormData] = useState({
    category_id: '',
    activity_type: '',
    activity_date: new Date().toISOString().split('T')[0],
    details: {}
  });

  // Dynamic form fields based on selected category
  const [formFields, setFormFields] = useState([]);

  useEffect(() => {
    fetchCategories();
    ensureUserExists(); // Make sure user exists in the database
  }, [user]);

  useEffect(() => {
    if (formData.category_id) {
      updateFormFields(formData.category_id);
    }
  }, [formData.category_id]);

  // This function ensures the authenticated user exists in the database
  async function ensureUserExists() {
    if (!user) return;
    
    try {
      // First check if user already exists
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .single();
      
      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
        console.error('Error checking user:', fetchError);
        return;
      }
      
      // If user doesn't exist, create them
      if (!existingUser) {
        const { error: insertError } = await supabase
          .from('users')
          .insert([{
            id: user.id,
            email: user.email,
            total_carbon: 0,
            total_points: 0,
            created_at: new Date()
          }]);
        
        if (insertError) {
          console.error('Error creating user record:', insertError);
        }
      }
    } catch (error) {
      console.error('Error in ensureUserExists:', error);
    }
  }

  async function fetchCategories() {
    const { data, error } = await supabase
      .from('activity_categories')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching categories:', error);
      return;
    }
    
    setCategories(data || []);
  }

  function updateFormFields(categoryId) {
    const category = categories.find(c => c.id === parseInt(categoryId));
    if (!category) return;

    // Set form fields based on category
    switch(category.name) {
      case 'Transportation':
        setFormFields([
          { name: 'mode', label: 'Mode of Transport', type: 'select', options: [
            { value: 'car', label: 'Car' },
            { value: 'bus', label: 'Bus' },
            { value: 'train', label: 'Train' },
            { value: 'plane', label: 'Plane' },
            { value: 'bike', label: 'Bicycle' },
            { value: 'walk', label: 'Walking' }
          ]},
          { name: 'distance', label: 'Distance (km)', type: 'number' },
          { name: 'passengers', label: 'Number of Passengers', type: 'number', default: 1 }
        ]);
        break;
      case 'Food':
        setFormFields([
          { name: 'meal_type', label: 'Meal Type', type: 'select', options: [
            { value: 'vegan', label: 'Vegan' },
            { value: 'vegetarian', label: 'Vegetarian' },
            { value: 'pescatarian', label: 'Pescatarian' },
            { value: 'meat_low', label: 'Meat (Low Amount)' },
            { value: 'meat_high', label: 'Meat (High Amount)' }
          ]},
          { name: 'local_sourced', label: 'Locally Sourced?', type: 'checkbox' },
          { name: 'organic', label: 'Organic?', type: 'checkbox' },
          { name: 'servings', label: 'Number of Servings', type: 'number', default: 1 }
        ]);
        break;
      case 'Home Energy':
        setFormFields([
          { name: 'energy_type', label: 'Energy Type', type: 'select', options: [
            { value: 'electricity', label: 'Electricity' },
            { value: 'natural_gas', label: 'Natural Gas' },
            { value: 'heating_oil', label: 'Heating Oil' },
            { value: 'renewable', label: 'Renewable Energy' }
          ]},
          { name: 'amount', label: 'Amount (kWh or m³)', type: 'number' },
          { name: 'green_energy', label: 'Green Energy Source?', type: 'checkbox' }
        ]);
        break;
      case 'Shopping':
        setFormFields([
          { name: 'product_type', label: 'Product Type', type: 'select', options: [
            { value: 'clothing', label: 'Clothing' },
            { value: 'electronics', label: 'Electronics' },
            { value: 'household', label: 'Household Items' },
            { value: 'secondhand', label: 'Second-hand Items' }
          ]},
          { name: 'amount_spent', label: 'Amount Spent ($)', type: 'number' },
          { name: 'sustainable', label: 'Sustainable Product?', type: 'checkbox' }
        ]);
        break;
      default:
        setFormFields([
          { name: 'description', label: 'Description', type: 'text' },
          { name: 'amount', label: 'Amount', type: 'number' }
        ]);
    }
    
    // Reset details
    setFormData(prev => ({
      ...prev,
      details: {}
    }));
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    
    if (name === 'category_id') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        activity_type: '' // Reset activity type when category changes
      }));
    } else if (name.startsWith('details.')) {
      const detailName = name.replace('details.', '');
      setFormData(prev => ({
        ...prev,
        details: {
          ...prev.details,
          [detailName]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      if (!user) throw new Error('User not authenticated');
      
      // Ensure user exists in database before proceeding
      await ensureUserExists();
      
      const selectedCategory = categories.find(c => c.id === parseInt(formData.category_id));
      if (!selectedCategory) throw new Error('Please select a category');
      
      // Calculate carbon footprint and points
      const carbonAmount = calculateCarbonFootprint(
        selectedCategory.name,
        formData.activity_type,
        formData.details
      );
      
      const pointsEarned = calculatePoints(
        selectedCategory.name,
        formData.activity_type,
        formData.details,
        carbonAmount
      );
      
      // Save to database
      const { data, error } = await supabase
        .from('carbon_activities')
        .insert([{
          user_id: user.id,
          category_id: parseInt(formData.category_id),
          activity_type: formData.activity_type,
          activity_date: formData.activity_date,
          carbon_amount: carbonAmount,
          points_earned: pointsEarned,
          details: formData.details
        }]);
      
      if (error) throw error;
      
      // Update user totals
      await supabase.rpc('update_user_totals', { 
        user_id_param: user.id,
        carbon_amount_param: carbonAmount,
        points_param: pointsEarned
      });
      
      setMessage({ 
        type: 'success', 
        text: 'Activity added successfully!' 
      });
      
      // Reset form
      setFormData({
        category_id: '',
        activity_type: '',
        activity_date: new Date().toISOString().split('T')[0],
        details: {}
      });
      
      // Redirect after short delay
      setTimeout(() => {
        router.push('/activities');
      }, 1500);
      
    } catch (error) {
      console.error('Error adding activity:', error);
      setMessage({ 
        type: 'error', 
        text: `Error: ${error.message}` 
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <PrivateRoute>
      <Nav />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Add New Activity</h1>
          
          {message.text && (
            <div className={`mb-4 p-4 rounded ${
              message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {message.text}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 text-black">
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Category
                </label>
                <select
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              
              {formData.category_id && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Activity Type
                  </label>
                  <input
                    type="text"
                    name="activity_type"
                    value={formData.activity_type}
                    onChange={handleChange}
                    required
                    placeholder="E.g., Commute to work, Grocery shopping"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  name="activity_date"
                  value={formData.activity_date}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              
              {formFields.length > 0 && (
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-lg font-medium text-gray-700 mb-3">Activity Details</h3>
                  <div className="space-y-3">
                    {formFields.map(field => (
                      <div key={field.name}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {field.label}
                        </label>
                        
                        {field.type === 'select' ? (
                          <select
                            name={`details.${field.name}`}
                            value={formData.details[field.name] || ''}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                          >
                            <option value="">Select an option</option>
                            {field.options.map(option => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        ) : field.type === 'checkbox' ? (
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              name={`details.${field.name}`}
                              checked={formData.details[field.name] || false}
                              onChange={handleChange}
                              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-600">Yes</span>
                          </div>
                        ) : (
                          <input
                            type={field.type}
                            name={`details.${field.name}`}
                            value={formData.details[field.name] || (field.default !== undefined ? field.default : '')}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  {loading ? 'Saving...' : 'Save Activity'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </PrivateRoute>
  );
}