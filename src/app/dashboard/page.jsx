'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { supabase } from '@/lib/supabase/client';
import { plantService } from '@/lib/supabase/plant';
import { 
  Activity, 
  TrendingDown, 
  TrendingUp, 
  Calendar,
  Award,
  BarChart2,
  Leaf,
  Users,
  Target,
  Zap,
  MessageCircle
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    dailyEmissions: null,
    weeklyEmissions: null,
    streak: 0,
    xp: 0,
    level: 1,
    plant: null,
    challengesActive: 0,
    achievementsEarned: 0,
    targetAchieved: false,
    leaderboardPosition: null,
    totalUsers: 0,
    progressPercentage: 0,
    carbonReduced: 0,
    insights: [],
    nextLevelXp: 100,
  });

  const plantRef = useRef(null);

  const formatNumber = (num) => {
    return Math.round(num * 100) / 100;
  };

  const getLevelTitle = (level) => {
    const titles = {
      1: 'Seedling',
      2: 'Sprout',
      3: 'Sapling',
      4: 'Young Tree',
      5: 'Mature Tree',
      6: 'Forest Guardian',
      7: 'Climate Hero',
      8: 'Ecosystem Protector',
      9: 'Earth Steward',
      10: 'Carbon Neutralizer'
    };
    
    return titles[level] || `Expert (Level ${level})`;
  };

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user) return;

      try {
        setLoading(true);

        const { data: userData } = await supabase
          .from('users')
          .select('level, total_xp, current_streak')
          .eq('id', user.id)
          .single();

        const today = new Date().toISOString().split('T')[0];
        const { data: dailyData } = await supabase
          .from('daily_summaries')
          .select('total_co2, target_achieved')
          .eq('user_id', user.id)
          .eq('date', today)
          .single();

        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const oneWeekAgoStr = oneWeekAgo.toISOString().split('T')[0];

        const { data: weeklyData } = await supabase
          .from('daily_summaries')
          .select('total_co2')
          .eq('user_id', user.id)
          .gte('date', oneWeekAgoStr)
          .lte('date', today);

        const weeklyTotal = weeklyData?.reduce((sum, day) => sum + day.total_co2, 0) || 0;

        const plant = await plantService.getUserActivePlant(user.id);

        const { count: challengesCount } = await supabase
          .from('user_challenges')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('status', 'active');

        const { count: achievementsCount } = await supabase
          .from('user_achievements')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);
          
        // Get leaderboard position
        const { data: leaderboardData } = await supabase
          .from('users')
          .select('id, total_xp')
          .order('total_xp', { ascending: false });
          
        const userPosition = leaderboardData?.findIndex(item => item.id === user.id) + 1 || null;
        
        // Calculate carbon reduced compared to average
        const carbonReduced = 15.2 - (weeklyTotal / 7); // Example: 15.2kg is average daily emissions
        
        // Get personalized insights based on user activities
        const { data: activityData } = await supabase
          .from('user_activities')
          .select('activity_type, co2_amount')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(20);
          
        // Generate insights based on activity data
        const insights = generateInsights(activityData);
        
        // Calculate next level XP requirement
        const nextLevelXp = userData.level * 100;
        
        // Calculate progress percentage to next level
        const progressPercentage = Math.min(100, (userData.total_xp % nextLevelXp) / nextLevelXp * 100);

        setDashboardData({
          dailyEmissions: dailyData?.total_co2 || 0,
          weeklyEmissions: weeklyTotal,
          streak: userData?.current_streak || 0,
          xp: userData?.total_xp || 0,
          level: userData?.level || 1,
          plant,
          challengesActive: challengesCount || 0,
          achievementsEarned: achievementsCount || 0,
          targetAchieved: dailyData?.target_achieved || false,
          leaderboardPosition: userPosition,
          totalUsers: leaderboardData?.length || 0,
          progressPercentage,
          carbonReduced: formatNumber(Math.max(0, carbonReduced)),
          insights,
          nextLevelXp,
        });
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user]);
  
  // Animate plant growth when level changes
  useEffect(() => {
    if (plantRef.current && !loading) {
      plantRef.current.animate(
        [
          { transform: 'scale(1)' },
          { transform: 'scale(1.2)' },
          { transform: 'scale(1)' }
        ],
        {
          duration: 1000,
          easing: 'ease-in-out'
        }
      );
    }
  }, [dashboardData.level, loading]);

  const generateInsights = (activityData) => {
    if (!activityData || activityData.length === 0) {
      return [
        "Start logging your daily activities to receive personalized insights.",
        "We'll analyze your carbon footprint and suggest improvements."
      ];
    }
    
    // Group activities by type and calculate total emissions
    const activityGroups = activityData.reduce((acc, item) => {
      if (!acc[item.activity_type]) {
        acc[item.activity_type] = 0;
      }
      acc[item.activity_type] += item.co2_amount;
      return acc;
    }, {});
    
    // Sort activities by emission amount
    const sortedActivities = Object.entries(activityGroups)
      .sort((a, b) => b[1] - a[1]);
    
    const insights = [];
    
    // Generate insight for highest emission activity
    if (sortedActivities.length > 0) {
      const [highestActivity, amount] = sortedActivities[0];
      insights.push(`Your ${highestActivity} activities contribute the most to your carbon footprint (${formatNumber(amount)} kg CO₂).`);
      
      // Suggest alternatives based on highest emission activity
      switch (highestActivity.toLowerCase()) {
        case 'transportation':
          insights.push("Try using public transport or cycling for your daily commute to reduce emissions.");
          break;
        case 'electricity':
          insights.push("Consider switching to energy-efficient appliances and turn off lights when not in use.");
          break;
        case 'food':
          insights.push("Reducing meat consumption by just one meal per week can significantly lower your carbon footprint.");
          break;
        case 'shopping':
          insights.push("Buying secondhand items and repairing instead of replacing can reduce your consumption footprint.");
          break;
        default:
          insights.push("Focus on reducing your highest emission activities for maximum impact.");
      }
    }
    
    // Add general insight based on overall performance
    if (sortedActivities.length > 1) {
      insights.push("Keep tracking your activities daily to unlock more personalized insights and recommendations.");
    }
    
    return insights;
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  const activeChallenges = [
    { id: 1, title: "Zero Waste Week", progress: 60, reward: "50 XP" },
    { id: 2, title: "Plant-based Day", progress: 100, reward: "Tree Badge" }
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Your Carbon Footprint Dashboard</h1>
      
      {/* Level & Progress Bar */}
      <div className="mt-6 bg-white overflow-hidden shadow rounded-lg p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3">
          <div>
            <h2 className="text-lg font-medium text-gray-900">
              Level {dashboardData.level}: {getLevelTitle(dashboardData.level)}
            </h2>
            <p className="text-sm text-gray-500">
              {dashboardData.xp} / {dashboardData.nextLevelXp} XP to Level {dashboardData.level + 1}
            </p>
          </div>
          <div className="mt-2 sm:mt-0 text-right">
            <p className="text-sm font-medium text-gray-500">Total Carbon Reduced</p>
            <p className="text-2xl font-bold text-green-600">{dashboardData.carbonReduced} kg CO₂/day</p>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
          <motion.div 
            className="bg-gradient-to-r from-green-300 to-green-600 h-4"
            initial={{ width: 0 }}
            animate={{ width: `${dashboardData.progressPercentage}%` }}
            transition={{ duration: 1 }}
          />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Daily Emissions */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 rounded-full p-3">
                <Activity className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Today's CO₂ Emissions</dt>
                  <dd className="flex items-center">
                    <div className="text-lg font-medium text-gray-900">
                      {formatNumber(dashboardData.dailyEmissions)} kg
                    </div>
                    {dashboardData.targetAchieved ? (
                      <TrendingDown className="ml-2 h-5 w-5 text-green-500" />
                    ) : (
                      <TrendingUp className="ml-2 h-5 w-5 text-red-500" />
                    )}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-4 sm:px-6">
            <Link href="/dashboard/activities" className="text-sm font-medium text-green-600 hover:text-green-500">
              View all activities
            </Link>
          </div>
        </div>

        {/* Weekly Emissions */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 rounded-full p-3">
                <BarChart2 className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Weekly CO₂ Emissions</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {formatNumber(dashboardData.weeklyEmissions)} kg
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-4 sm:px-6">
            <Link href="/dashboard/insights" className="text-sm font-medium text-blue-600 hover:text-blue-500">
              See weekly trends
            </Link>
          </div>
        </div>

        {/* Streak */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-100 rounded-full p-3">
                <Calendar className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Current Streak</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {dashboardData.streak} days
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-4 sm:px-6">
            <span className="text-sm text-gray-500">
              {dashboardData.streak > 0 ? "Keep it up!" : "Start your streak today!"}
            </span>
          </div>
        </div>

        {/* XP & Level */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-100 rounded-full p-3">
                <Award className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">XP / Achievements</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {dashboardData.xp} XP / {dashboardData.achievementsEarned} Earned
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-4 sm:px-6">
            <Link href="/dashboard/achievements" className="text-sm font-medium text-purple-600 hover:text-purple-500">
              View achievements
            </Link>
          </div>
        </div>
      </div>

      {/* Plant Growth & Leaderboard */}
      <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Plant Growth Visualization */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-6 py-5">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Your Carbon Impact Plant</h3>
            <div className="flex flex-col items-center">
              <div 
                ref={plantRef} 
                className="relative h-64 w-64 flex items-center justify-center"
              >
                {dashboardData.level <= 3 ? (
                  // Seedling to Sapling
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <path d="M50,95 L50,65" stroke="#8B4513" strokeWidth="4" />
                    <circle cx="50" cy={65 - dashboardData.level * 5} r={5 + dashboardData.level * 3} fill="#4CAF50" />
                    {dashboardData.level >= 2 && (
                      <>
                        <path d="M45,55 L40,50" stroke="#4CAF50" strokeWidth="2" />
                        <path d="M55,55 L60,50" stroke="#4CAF50" strokeWidth="2" />
                      </>
                    )}
                    {dashboardData.level >= 3 && (
                      <>
                        <path d="M45,45 L35,45" stroke="#4CAF50" strokeWidth="2" />
                        <path d="M55,45 L65,45" stroke="#4CAF50" strokeWidth="2" />
                      </>
                    )}
                  </svg>
                ) : dashboardData.level <= 6 ? (
                  // Young to Mature Tree
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <path d="M50,95 L50,50" stroke="#8B4513" strokeWidth="5" />
                    <ellipse cx="50" cy="40" rx={10 + (dashboardData.level-3) * 3} ry={15 + (dashboardData.level-3) * 4} fill="#388E3C" />
                    <ellipse cx="40" cy="50" rx={8 + (dashboardData.level-3) * 2} ry={10 + (dashboardData.level-3) * 2} fill="#43A047" />
                    <ellipse cx="60" cy="50" rx={8 + (dashboardData.level-3) * 2} ry={10 + (dashboardData.level-3) * 2} fill="#43A047" />
                    <ellipse cx="50" cy="30" rx={8 + (dashboardData.level-3) * 2} ry={10 + (dashboardData.level-3) * 2} fill="#4CAF50" />
                  </svg>
                ) : (
                  // Forest to Carbon Neutralizer
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <path d="M50,95 L50,45" stroke="#6D4C41" strokeWidth="6" />
                    <path d="M45,45 L40,30" stroke="#6D4C41" strokeWidth="3" />
                    <path d="M55,45 L60,30" stroke="#6D4C41" strokeWidth="3" />
                    <circle cx="50" cy="25" r={15 + (dashboardData.level-7) * 2} fill="#2E7D32" />
                    <circle cx="40" cy="30" r={10 + (dashboardData.level-7) * 1.5} fill="#388E3C" />
                    <circle cx="60" cy="30" r={10 + (dashboardData.level-7) * 1.5} fill="#388E3C" />
                    <circle cx="45" cy="20" r={8 + (dashboardData.level-7) * 1} fill="#43A047" />
                    <circle cx="55" cy="20" r={8 + (dashboardData.level-7) * 1} fill="#43A047" />
                    {dashboardData.level >= 9 && (
                      <>
                        <circle cx="30" cy="35" r="5" fill="#4CAF50" />
                        <circle cx="70" cy="35" r="5" fill="#4CAF50" />
                      </>
                    )}
                    {dashboardData.level >= 10 && (
                      <circle cx="50" cy="12" r="6" fill="#81C784" />
                    )}
                  </svg>
                )}
              </div>
              <p className="mt-2 text-center text-gray-700 font-medium">
                {getLevelTitle(dashboardData.level)}
              </p>
              <p className="text-sm text-gray-500 text-center">
                {dashboardData.level < 10 
                  ? `Keep reducing your carbon footprint to grow your plant!` 
                  : `Your plant has reached its maximum growth. Amazing work!`}
              </p>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-4 sm:px-6">
            <Link href="/dashboard/plants" className="text-sm font-medium text-green-600 hover:text-green-500">
              Manage your plants
            </Link>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-6 py-5">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Users className="h-5 w-5 mr-2 text-blue-500" />
              Community Leaderboard
            </h3>
            <div className="relative">
              {dashboardData.leaderboardPosition && (
                <div className="mb-6 bg-blue-50 rounded-lg p-4 border border-blue-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-blue-500 text-white rounded-full h-8 w-8 flex items-center justify-center font-bold">
                        {dashboardData.leaderboardPosition}
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">Your Ranking</p>
                        <p className="text-xs text-gray-500">Top {Math.ceil((dashboardData.leaderboardPosition / dashboardData.totalUsers) * 100)}%</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">{dashboardData.xp} XP</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="space-y-3">
                {[1, 2, 3].map(position => (
                  <div key={position} className="flex items-center justify-between bg-gray-50 rounded-lg p-3 border border-gray-100">
                    <div className="flex items-center">
                      <div className={`flex-shrink-0 rounded-full h-8 w-8 flex items-center justify-center font-bold ${
                        position === 1 ? 'bg-yellow-400 text-yellow-800' : 
                        position === 2 ? 'bg-gray-300 text-gray-700' : 
                        'bg-amber-700 text-amber-100'
                      }`}>
                        {position}
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                          {position === 1 ? 'EcoWarrior' : position === 2 ? 'GreenThumb' : 'EarthProtector'}
                        </p>
                        <p className="text-xs text-gray-500">Level {10 - position + 1}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{(11 - position) * 250} XP</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-4 sm:px-6 text-center">
            <Link href="/dashboard/leaderboard" className="text-sm font-medium text-blue-600 hover:text-blue-500">
              View full leaderboard
            </Link>
          </div>
        </div>
      </div>

      {/* Challenges & Insights */}
      <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Active Challenges */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-6 py-5">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Target className="h-5 w-5 mr-2 text-red-500" />
              Active Challenges
            </h3>
            {activeChallenges.length > 0 ? (
              <div className="space-y-4">
                {activeChallenges.map(challenge => (
                  <div key={challenge.id} className="border border-gray-200 rounded-md p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-900">{challenge.title}</h4>
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                        Reward: {challenge.reward}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
                      <div 
                        className="bg-green-600 h-2.5 rounded-full"
                        style={{ width: `${challenge.progress}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-right text-gray-500">{challenge.progress}% complete</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No active challenges. Join a challenge to earn rewards!</p>
              </div>
            )}
          </div>
          <div className="bg-gray-50 px-4 py-4 sm:px-6">
            <Link href="/dashboard/challenges" className="text-sm font-medium text-red-600 hover:text-red-500">
              Browse all challenges
            </Link>
          </div>
        </div>

        {/* Personalized Insights */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-6 py-5">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Zap className="h-5 w-5 mr-2 text-yellow-500" />
              Personalized Insights
            </h3>
            <div className="space-y-4">
              {dashboardData.insights.map((insight, idx) => (
                <div key={idx} className="flex">
                  <div className="flex-shrink-0 mt-1">
                    <MessageCircle className="h-5 w-5 text-blue-500" />
                  </div>
                  <p className="ml-3 text-sm text-gray-700">{insight}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-4 sm:px-6">
            <Link href="/dashboard/insights" className="text-sm font-medium text-yellow-600 hover:text-yellow-500">
              View detailed analysis
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}