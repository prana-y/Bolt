import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCommunityStore } from '../../store/communityStore';
import { useAuthStore } from '../../store/authStore';
import { Users, Plus } from 'lucide-react';

const CommunityList: React.FC = () => {
  const { communities, fetchCommunities, loading } = useCommunityStore();
  const { user } = useAuthStore();

  useEffect(() => {
    fetchCommunities();
  }, [fetchCommunities]);

  if (loading && communities.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Communities</h2>
        <Link
          to="/create-community"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Community
        </Link>
      </div>

      {communities.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No communities yet</h3>
          <p className="text-gray-500 mb-4">
            Create a new community or join existing ones to connect with others.
          </p>
          <Link
            to="/create-community"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Community
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {communities.map((community) => (
            <Link
              key={community.id}
              to={`/community/${community.id}`}
              className="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow duration-300"
            >
              <div className="h-32 bg-indigo-100 flex items-center justify-center">
                {community.image_url ? (
                  <img
                    src={community.image_url}
                    alt={community.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Users className="h-12 w-12 text-indigo-500" />
                )}
              </div>
              <div className="p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-1">{community.name}</h3>
                <p className="text-sm text-gray-500 mb-3 line-clamp-2">{community.description}</p>
                <div className="flex items-center text-sm text-gray-500">
                  <Users className="h-4 w-4 mr-1" />
                  <span>{community.member_count} members</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommunityList;