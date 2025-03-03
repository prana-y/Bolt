import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useCommunityStore } from '../../store/communityStore';
import { useJobStore } from '../../store/jobStore';
import { useResourceStore } from '../../store/resourceStore';
import { Users, Briefcase, BookOpen, MessageSquare, Plus } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { communities, fetchCommunities } = useCommunityStore();
  const { jobs, fetchJobs } = useJobStore();
  const { resources, fetchResources } = useResourceStore();

  useEffect(() => {
    fetchCommunities();
    fetchJobs();
    fetchResources();
  }, [fetchCommunities, fetchJobs, fetchResources]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome back, {user?.full_name || user?.username}!</h2>
        <p className="text-gray-600">
          Connect with other professionals, find job opportunities, and share resources in our supportive community.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Users className="h-5 w-5 mr-2 text-indigo-500" />
              Communities
            </h3>
            <Link
              to="/communities"
              className="text-sm text-indigo-600 hover:text-indigo-900"
            >
              View all
            </Link>
          </div>
          {communities.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-gray-500 mb-3">No communities yet</p>
              <Link
                to="/create-community"
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Plus className="h-4 w-4 mr-1" />
                Create Community
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {communities.slice(0, 3).map((community) => (
                <li key={community.id} className="py-3">
                  <Link
                    to={`/community/${community.id}`}
                    className="flex items-center hover:bg-gray-50 -mx-4 px-4 py-2 rounded-md"
                  >
                    <div className="w-10 h-10 bg-indigo-100 rounded-md flex items-center justify-center mr-3">
                      {community.image_url ? (
                        <img
                          src={community.image_url}
                          alt={community.name}
                          className="w-10 h-10 rounded-md object-cover"
                        />
                      ) : (
                        <Users className="h-5 w-5 text-indigo-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {community.name}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {community.member_count} members
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Briefcase className="h-5 w-5 mr-2 text-indigo-500" />
              Recent Jobs
            </h3>
            <Link
              to="/jobs"
              className="text-sm text-indigo-600 hover:text-indigo-900"
            >
              View all
            </Link>
          </div>
          {jobs.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-gray-500 mb-3">No job postings yet</p>
              <Link
                to="/jobs/create"
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Plus className="h-4 w-4 mr-1" />
                Post a Job
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {jobs.slice(0, 3).map((job) => (
                <li key={job.id} className="py-3">
                  <Link
                    to={`/jobs/${job.id}`}
                    className="flex items-center hover:bg-gray-50 -mx-4 px-4 py-2 rounded-md"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {job.title}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {job.company} • {job.location}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <BookOpen className="h-5 w-5 mr-2 text-indigo-500" />
              Recent Resources
            </h3>
            <Link
              to="/resources"
              className="text-sm text-indigo-600 hover:text-indigo-900"
            >
              View all
            </Link>
          </div>
          {resources.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-gray-500 mb-3">No resources shared yet</p>
              <Link
                to="/resources/create"
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Plus className="h-4 w-4 mr-1" />
                Share Resource
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {resources.slice(0, 3).map((resource) => (
                <li key={resource.id} className="py-3">
                  <Link
                    to={`/resources/${resource.id}`}
                    className="flex items-center hover:bg-gray-50 -mx-4 px-4 py-2 rounded-md"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {resource.title}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {resource.type} • by {resource.user?.username}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="bg-indigo-50 rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-indigo-900 flex items-center">
            <MessageSquare className="h-5 w-5 mr-2 text-indigo-700" />
            Quick Actions
          </h3>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            to="/communities"
            className="bg-white rounded-md shadow p-4 hover:shadow-md transition-shadow duration-200"
          >
            <Users className="h-6 w-6 text-indigo-500 mb-2" />
            <h4 className="text-sm font-medium text-gray-900">Browse Communities</h4>
          </Link>
          <Link
            to="/messages"
            className="bg-white rounded-md shadow p-4 hover:shadow-md transition-shadow duration-200"
          >
            <MessageSquare className="h-6 w-6 text-indigo-500 mb-2" />
            <h4 className="text-sm font-medium text-gray-900">Messages</h4>
          </Link>
          <Link
            to="/jobs"
            className="bg-white rounded-md shadow p-4 hover:shadow-md transition-shadow duration-200"
          >
            <Briefcase className="h-6 w-6 text-indigo-500 mb-2" />
            <h4 className="text-sm font-medium text-gray-900">Find Jobs</h4>
          </Link>
          <Link
            to="/resources"
            className="bg-white rounded-md shadow p-4 hover:shadow-md transition-shadow duration-200"
          >
            <BookOpen className="h-6 w-6 text-indigo-500 mb-2" />
            <h4 className="text-sm font-medium text-gray-900">Explore Resources</h4>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;