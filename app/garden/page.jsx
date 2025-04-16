'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '../providers';
import Nav from '../components/Nav';
import PrivateRoute from '../components/PrivateRoute';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const PLANT_LEVELS = [
  { level: 1, pointsRequired: 0, name: 'Seedling', heightClass: 'h-16' },
  { level: 2, pointsRequired: 100, name: 'Sprout', heightClass: 'h-24' },
  { level: 3, pointsRequired: 200, name: 'Sapling', heightClass: 'h-32' },
  { level: 4, pointsRequired: 500, name: 'Young Tree', heightClass: 'h-40' },
  { level: 5, pointsRequired: 1000, name: 'Mature Tree', heightClass: 'h-48' },
  { level: 6, pointsRequired: 2000, name: 'Ancient Tree', heightClass: 'h-56' }
];

export default function PlantGrowth() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [trends, setTrends] = useState([]);
  const [timeRange, setTimeRange] = useState('month');
  const [plantLevel, setPlantLevel] = useState(null);
  const [nextLevelProgress, setNextLevelProgress] = useState(0);

  useEffect(() => {
    if (user) {
      fetchData();
    } else {
      // Dummy mode
      setPlantLevel(PLANT_LEVELS[1]); // Dummy: Sprout
      setNextLevelProgress(35); // Example progress
      setLoading(false);
    }
  }, [user, timeRange]);

  async function fetchData() {
    setLoading(true);
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      const currentPoints = profileData.total_points;
      let currentLevel = PLANT_LEVELS[0];
      let nextLevel = PLANT_LEVELS[1];

      for (let i = PLANT_LEVELS.length - 1; i >= 0; i--) {
        if (currentPoints >= PLANT_LEVELS[i].pointsRequired) {
          currentLevel = PLANT_LEVELS[i];
          nextLevel = PLANT_LEVELS[i + 1] || PLANT_LEVELS[i];
          break;
        }
      }

      setPlantLevel(currentLevel);

      if (currentLevel.level === PLANT_LEVELS.length) {
        setNextLevelProgress(100);
      } else {
        const pointsForNextLevel = nextLevel.pointsRequired - currentLevel.pointsRequired;
        const pointsProgress = currentPoints - currentLevel.pointsRequired;
        const progressPercentage = Math.min(100, (pointsProgress / pointsForNextLevel) * 100);
        setNextLevelProgress(progressPercentage);
      }

      const period = getPeriodParams(timeRange);
      const { data: trendsData, error: trendsError } = await supabase
        .from('carbon_activities')
        .select('activity_date, carbon_amount')
        .eq('user_id', user.id)
        .gte('activity_date', period.startDate)
        .lte('activity_date', period.endDate)
        .order('activity_date');

      if (trendsError) throw trendsError;

      const aggregatedTrends = aggregateByDate(trendsData, period.format);
      setTrends(aggregatedTrends);

    } catch (error) {
      console.error('Error fetching plant growth data:', error);
    } finally {
      setLoading(false);
    }
  }

  function getPeriodParams(range) {
    const today = new Date();
    let startDate = new Date();
    let format = 'day';

    switch (range) {
      case 'week':
        startDate.setDate(today.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(today.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(today.getFullYear() - 1);
        format = 'month';
        break;
      default:
        startDate.setMonth(today.getMonth() - 1);
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
      const date = new Date(item.activity_date);
      let dateKey = format === 'month'
        ? `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`
        : date.toISOString().split('T')[0];

      if (!aggregated[dateKey]) {
        aggregated[dateKey] = { date: dateKey, carbon: 0 };
      }
      aggregated[dateKey].carbon += item.carbon_amount;
    });

    return Object.values(aggregated).sort((a, b) => a.date.localeCompare(b.date));
  }

  function renderPlant() {
    if (!plantLevel) return null;

    // Generate leaf colors based on level
    const mainLeafColor = plantLevel.level <= 2 ? 'bg-green-400' : 'bg-green-500';
    const leafAccentColor = plantLevel.level >= 4 ? 'bg-green-600' : 'bg-green-400';
    const trunkColor = plantLevel.level >= 3 ? 'bg-amber-800' : 'bg-amber-700';
    
    // Add animation classes
    const leafAnimation = "transition-all duration-700 hover:scale-105";
    const trunkAnimation = "transition-all duration-500";
    
    return (
      <div className="flex flex-col items-center justify-center">
        <div className="flex flex-col items-center relative">
          <div className="w-4xl mb-4 flex flex-col items-center justify-end">
            <div className={`w-32 ${plantLevel.heightClass} relative`}>
              {/* Tree top/leaves section */}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-24 h-24 rounded-full bg-green-400 opacity-30 scale-125"></div>
              
              {/* Main top blob */}
              <div className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 ${plantLevel.level >= 2 ? 'w-20 h-20' : 'w-12 h-12'} ${mainLeafColor} rounded-full ${leafAnimation} shadow-lg`}></div>
              
              {/* Level 3+ foliage */}
              {plantLevel.level >= 3 && (
                <>
                  <div className={`absolute bottom-8 left-0 w-12 h-12 ${mainLeafColor} rounded-full -translate-x-4 ${leafAnimation}`}></div>
                  <div className={`absolute bottom-8 right-0 w-12 h-12 ${mainLeafColor} rounded-full translate-x-4 ${leafAnimation}`}></div>
                  <div className={`absolute bottom-14 left-1/2 transform -translate-x-1/2 w-16 h-16 ${mainLeafColor} rounded-full ${leafAnimation}`}></div>
                </>
              )}
              
              {/* Level 4+ foliage */}
              {plantLevel.level >= 4 && (
                <>
                  <div className={`absolute bottom-16 left-0 w-14 h-14 ${leafAccentColor} rounded-full -translate-x-8 ${leafAnimation}`}></div>
                  <div className={`absolute bottom-16 right-0 w-14 h-14 ${leafAccentColor} rounded-full translate-x-8 ${leafAnimation}`}></div>
                  <div className={`absolute bottom-24 left-1/2 transform -translate-x-1/2 w-18 h-18 ${mainLeafColor} rounded-full ${leafAnimation}`}></div>
                </>
              )}
              
              {/* Level 5+ foliage */}
              {plantLevel.level >= 5 && (
                <>
                  <div className={`absolute bottom-28 left-0 w-16 h-16 ${leafAccentColor} rounded-full -translate-x-10 ${leafAnimation}`}></div>
                  <div className={`absolute bottom-28 right-0 w-16 h-16 ${leafAccentColor} rounded-full translate-x-10 ${leafAnimation}`}></div>
                  <div className={`absolute bottom-32 left-1/2 transform -translate-x-1/2 w-20 h-20 ${mainLeafColor} rounded-full ${leafAnimation}`}></div>
                </>
              )}
              
              {/* Level 6 foliage */}
              {plantLevel.level >= 6 && (
                <>
                  <div className={`absolute bottom-40 left-0 w-16 h-16 ${leafAccentColor} rounded-full -translate-x-12 ${leafAnimation}`}></div>
                  <div className={`absolute bottom-40 right-0 w-16 h-16 ${leafAccentColor} rounded-full translate-x-12 ${leafAnimation}`}></div>
                  <div className={`absolute bottom-44 left-1/2 transform -translate-x-1/2 w-20 h-20 ${mainLeafColor} rounded-full ${leafAnimation}`}></div>
                  
                  {/* Special decorations for max level */}
                  <div className="absolute bottom-48 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-yellow-300 rounded-full animate-pulse shadow-yellow-200 shadow-md"></div>
                  <div className="absolute bottom-36 left-0 w-4 h-4 bg-yellow-200 rounded-full -translate-x-14 animate-pulse shadow-yellow-100 shadow-sm"></div>
                  <div className="absolute bottom-36 right-0 w-4 h-4 bg-yellow-200 rounded-full translate-x-14 animate-pulse shadow-yellow-100 shadow-sm"></div>
                </>
              )}
            </div>

            {/* Tree trunk */}
            <div className={`w-6 ${plantLevel.level >= 3 ? 'h-20' : 'h-12'} ${trunkColor} rounded-full ${trunkAnimation} shadow-md`}>
              {/* Trunk texture */}
              {plantLevel.level >= 3 && (
                <>
                  <div className="w-1 h-8 bg-amber-900 rounded-full mx-auto mt-2 opacity-40"></div>
                  <div className="w-1 h-4 bg-amber-900 rounded-full ml-1 mt-1 opacity-40"></div>
                </>
              )}
            </div>
            
            {/* Enhanced Soil and Pot Section */}
            <div className="relative w-32 h-24">
              {/* Decorative pot rim */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-28 h-8 bg-gradient-to-b from-amber-600 to-amber-800 rounded-t-lg shadow-inner z-10 overflow-hidden">
                {/* Rim decoration */}
                <div className="w-full h-2 bg-amber-500 opacity-30 rounded-full mt-1"></div>
                <div className="w-full flex justify-between px-2 mt-1">
                  <div className="w-2 h-2 bg-amber-500 rounded-full opacity-30"></div>
                  <div className="w-2 h-2 bg-amber-500 rounded-full opacity-30"></div>
                  <div className="w-2 h-2 bg-amber-500 rounded-full opacity-30"></div>
                </div>
              </div>
              
              {/* Main pot body */}
              <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-32 h-16 bg-gradient-to-b from-amber-800 to-amber-900 rounded-b-lg shadow-lg z-0 overflow-hidden">
                {/* Pot textures and details */}
                <div className="w-full h-full relative">
                  {/* Decorative pot lines */}
                  <div className="absolute top-0 left-0 w-full h-full flex flex-col justify-around">
                    <div className="w-full h-px bg-amber-700 opacity-60"></div>
                    <div className="w-full h-px bg-amber-700 opacity-60"></div>
                  </div>
                  
                  {/* Side pattern */}
                  <div className="absolute top-0 left-0 h-full w-4 bg-amber-700 opacity-20 rounded-br-lg"></div>
                  <div className="absolute top-0 right-0 h-full w-4 bg-amber-700 opacity-20 rounded-bl-lg"></div>
                  
                  {/* Bottom shadow */}
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-28 h-2 bg-black opacity-20 rounded-full"></div>
                </div>
              </div>
              
              {/* Soil surface */}
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-24 h-6 bg-gradient-to-b from-amber-950 to-amber-800 rounded-t-md shadow-inner z-20">
                {/* Soil texture elements */}
                <div className="w-full h-full relative overflow-hidden">
                  <div className="absolute top-1 left-3 w-2 h-1 bg-amber-700 rounded-full opacity-60"></div>
                  <div className="absolute top-2 left-8 w-1 h-1 bg-amber-700 rounded-full opacity-60"></div>
                  <div className="absolute top-1 right-5 w-2 h-1 bg-amber-700 rounded-full opacity-60"></div>
                  <div className="absolute top-3 right-3 w-1 h-1 bg-amber-700 rounded-full opacity-60"></div>
                  <div className="absolute top-2 left-14 w-2 h-1 bg-amber-700 rounded-full opacity-60"></div>
                  
                  {/* Plant level indicators showing as small sprouts in soil */}
                  <div className="w-full flex justify-center gap-3 mt-1">
                    {[...Array(6)].map((_, i) => (
                      <div 
                        key={i} 
                        className={`w-1 h-2 rounded-t-full transition-all ${i < plantLevel.level ? 'bg-green-500' : 'bg-amber-700 opacity-40'}`}
                      ></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Plant info */}
          <div className="bg-white bg-opacity-90 rounded-lg px-4 py-2 shadow-md mt-2 text-center">
            <h2 className="text-xl font-bold text-green-700">{plantLevel.name}</h2>
            <p className="text-sm text-gray-600">Level {plantLevel.level}</p>
          </div>
        </div>

        {plantLevel.level < PLANT_LEVELS.length && (
          <div className="w-full mt-6">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Level {plantLevel.level}</span>
              <span>Level {plantLevel.level + 1}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 shadow-inner">
              <div
                className="bg-gradient-to-r from-green-400 to-green-600 h-4 rounded-full transition-all duration-1000"
                style={{ width: `${nextLevelProgress}%` }}
              ></div>
            </div>
            <div className="flex justify-end mt-1">
              <span className="text-sm text-gray-600">
                {profile?.total_points ?? 200} / {PLANT_LEVELS[plantLevel.level + 1]?.pointsRequired ?? 100} points
              </span>
            </div>
          </div>
        )}

        {plantLevel.level === PLANT_LEVELS.length && (
          <div className="mt-4 text-center">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 shadow-sm">
              <span className="mr-1">✨</span> Maximum Level Reached! <span className="ml-1">✨</span>
            </span>
            <p className="text-sm text-gray-600 mt-2">
              Congratulations! Your plant has reached its maximum growth level.
            </p>
          </div>
        )}
      </div>
    );
  }

  // Time range selector
  function renderTimeRangeSelector() {
    return (
      <div className="flex justify-center mb-6 bg-white rounded-lg shadow p-2">
        <div className="flex space-x-2">
          {['week', 'month', 'year'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                timeRange === range
                  ? 'bg-green-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <PrivateRoute allowAnonymous>
      <Nav />
     <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 flex items-center justify-center ">
  <div className="container max-w-9xl px-4 py-8 ">
    <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Your Carbon Plant</h1>
    
    {loading ? (
      <div className="text-center py-10">
        <div className="h-10 w-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="mt-2 text-gray-600">Growing your plant...</p>
      </div>
    ) : (
      <>
        <div className="flex justify-center mb-6">
          {renderTimeRangeSelector()}
        </div>

        <div className="grid place-items-center w-full">
  <div className="bg-white rounded-lg shadow-md p-6 flex items-center justify-center hover:shadow-lg transition-shadow duration-300">
    {renderPlant()}
  </div>
</div>


      </>
    )}
  </div>
</div>

    </PrivateRoute>
  );
}