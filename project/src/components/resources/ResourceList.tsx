import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useResourceStore } from '../../store/resourceStore';
import { BookOpen, Plus, Link as LinkIcon, Video, PenTool as Tool, FileText } from 'lucide-react';
import { format } from 'date-fns';

const ResourceList: React.FC = () => {
  const { resources, fetchResources, loading } = useResourceStore();

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'article':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'video':
        return <Video className="h-5 w-5 text-red-500" />;
      case 'tool':
        return <Tool className="h-5 w-5 text-green-500" />;
      default:
        return <LinkIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  if (loading && resources.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Resources</h2>
        <Link
          to="/resources/create"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Share Resource
        </Link>
      </div>

      {resources.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No resources yet</h3>
          <p className="text-gray-500 mb-4">
            Share helpful articles, videos, or tools with the community.
          </p>
          <Link
            to="/resources/create"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Share Your First Resource
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {resources.map((resource) => (
            <div key={resource.id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow duration-300">
              <div className="p-5">
                <div className="flex items-center mb-3">
                  {getResourceIcon(resource.type)}
                  <span className="ml-2 text-xs font-medium uppercase text-gray-500">
                    {resource.type}
                  </span>
                </div>
                <Link to={`/resources/${resource.id}`}>
                  <h3 className="text-lg font-medium text-gray-900 mb-2 hover:text-indigo-600">{resource.title}</h3>
                </Link>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">{resource.description}</p>
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center mr-2">
                      {resource.user?.avatar_url ? (
                        <img 
                          src={resource.user.avatar_url} 
                          alt={resource.user.username} 
                          className="w-6 h-6 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-xs font-semibold text-indigo-800">
                          {resource.user?.username?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">{resource.user?.username}</span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {format(new Date(resource.created_at), 'MMM d, yyyy')}
                  </span>
                </div>
              </div>
              <a 
                href={resource.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block bg-gray-50 px-5 py-3 text-center text-sm font-medium text-indigo-600 hover:bg-gray-100"
              >
                Visit Resource <LinkIcon className="inline-block h-4 w-4 ml-1" />
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResourceList;