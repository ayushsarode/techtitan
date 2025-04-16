'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../providers';
import Nav from '../components/Nav';
import PrivateRoute from '../components/PrivateRoute';

export default function Leaderboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [sortBy, setSortBy] = useState('points'); // 'points' or 'carbon'

  useEffect(() => {
    if (user) {
      fetchLeaderboard();
    }
  }, [user, sortBy]);

  // Mock data for leaderboard
  const fakeLeaderboard = [
    { id: '1', username: 'adityawarekar', full_name: 'adityawarekar1984@gmail.com', avatar_url: '', total_carbon_saved: 150, total_points: 200 },
    { id: '2', username: 'aniketgawande', full_name: 'Aniket Gawande', avatar_url: '', total_carbon_saved: 130, total_points: 100 },
  ];

  async function fetchLeaderboard() {
    setLoading(true);
    try {
      // Simulate delay for loading
      setTimeout(() => {
        const sortedLeaderboard = [...fakeLeaderboard].sort((a, b) => {
          return sortBy === 'points'
            ? b.total_points - a.total_points
            : b.total_carbon_saved - a.total_carbon_saved;
        });
        
        setLeaderboard(sortedLeaderboard);

        // Find user's rank
        const userIndex = sortedLeaderboard.findIndex(profile => profile.id === user.id);
        setUserRank(userIndex !== -1 ? userIndex + 1 : null);

        setLoading(false);
      }, 1000); // Simulated loading delay
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      setLoading(false);
    }
  }

  return (
    <PrivateRoute>
      <Nav />
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-800">Leaderboard</h1>
              
              <div className="inline-flex rounded-md shadow-sm" role="group">
                <button
                  type="button"
                  onClick={() => setSortBy('points')}
                  className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
                    sortBy === 'points'
                      ? 'bg-green-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                  }`}
                >
                  Points
                </button>
                <button
                  type="button"
                  onClick={() => setSortBy('carbon')}
                  className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
                    sortBy === 'carbon'
                      ? 'bg-green-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                  }`}
                >
                  Carbon Saved
                </button>
              </div>
            </div>
          </div>
          
          {loading ? (
            <div className="text-center py-10">
              <div className="spinner h-10 w-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading leaderboard...</p>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500">No users found.</p>
            </div>
          ) : (
            <>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rank
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {sortBy === 'points' ? 'Points' : 'Carbon Saved'}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {leaderboard.map((profile, index) => (
                    <tr 
                      key={profile.id} 
                      className={`${profile.id === user?.id ? 'bg-green-50' : 'hover:bg-gray-50'}`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              {profile.avatar_url ? (
                                <img 
                                  src={profile.avatar_url} 
                                  alt={profile.username} 
                                  className="h-10 w-10 rounded-full"
                                />
                              ) : (
                                <span className="text-gray-500 font-medium">
                                  {profile.username?.charAt(0)?.toUpperCase() || profile.full_name?.charAt(0)?.toUpperCase() || '?'}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {profile.username || 'Anonymous User'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {profile.full_name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {sortBy === 'points' ? (
                          <div className="text-sm text-blue-600 font-medium">{profile.total_points} points</div>
                        ) : (
                          <div className="text-sm text-green-600 font-medium">{profile.total_carbon_saved.toFixed(2)} kg CO2</div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {userRank && (
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <div className="text-sm">
                    <span className="font-medium text-gray-800">Your rank: </span>
                    <span className="font-bold text-green-600">{userRank}</span>
                    <span className="text-gray-500"> out of {leaderboard.length} users</span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </PrivateRoute>
  );
}
