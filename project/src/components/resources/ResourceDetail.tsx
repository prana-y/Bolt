import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useResourceStore } from '../../store/resourceStore';
import { useAuthStore } from '../../store/authStore';
import { format } from 'date-fns';
import { BookOpen, Link as LinkIcon, Video, PenTool as Tool, FileText, ExternalLink, Edit, Trash2 } from 'lucide-react';

const ResourceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { currentResource, fetchResource, deleteResource, loading } = useResourceStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      fetchResource(id);
    }
  }, [id, fetchResource]);

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'article':
        return <FileText className="h-6 w-6 text-blue-500" />;
      case 'video':
        return <Video className="h-6 w-6 text-red-500" />;
      case 'tool':
        return <Tool className="h-6 w-6 text-green-500" />;
      default:
        return <LinkIcon className="h-6 w-6 text-gray-500" />;
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    
    if (window.confirm('Are you sure you want to delete this resource?')) {
      await deleteResource(id);
      navigate('/resources');
    }
  };

  if (loading && !currentResource) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!currentResource) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Resource not found</h2>
        <p className="text-gray-500 mb-6">The resource you're looking for doesn't exist or has been removed.</p>
        <Link
          to="/resources"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Back to Resources
        </Link>
      </div>
    );
  }

  const isOwner = user?.id === currentResource.user_id;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link
          to="/resources"
          className="text-indigo-600 hover:text-indigo-900 flex items-center"
        >
          <svg className="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          Back to Resources
        </Link>
      </div>

      <div className="bg-white shadow overflow-hidden rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-start">
          <div className="flex items-center">
            {getResourceIcon(currentResource.type)}
            <h2 className="ml-3 text-2xl font-bold text-gray-900">{currentResource.title}</h2>
          </div>
          {isOwner && (
            <div className="flex space-x-2">
              <Link
                to={`/resources/edit/${currentResource.id}`}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Link>
              <button
                onClick={handleDelete}
                className="inline-flex items-center px-3 py-1.5 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </button>
            </div>
          )}
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <div className="mb-6">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 mr-2">
              {currentResource.type.charAt(0).toUpperCase() + currentResource.type.slice(1)}
            </span>
            <span className="text-sm text-gray-500">
              Shared on {format(new Date(currentResource.created_at), 'MMMM d, yyyy')}
            </span>
          </div>

          <div className="mb-6">
            <p className="text-gray-700 whitespace-pre-line">
              {currentResource.description}
            </p>
          </div>

          <div className="mb-6">
            <a
              href={currentResource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Visit Resource
              <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </div>

          <div className="border-t border-gray-200 pt-4 flex items-center">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
              {currentResource.user?.avatar_url ? (
                <img 
                  src={currentResource.user.avatar_url} 
                  alt={currentResource.user.username} 
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <span className="text-sm font-semibold text-indigo-800">
                  {currentResource.user?.username?.charAt(0).toUpperCase() || 'U'}
                </span>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                Shared by {currentResource.user?.username}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourceDetail;