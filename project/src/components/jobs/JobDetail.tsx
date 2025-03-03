import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useJobStore } from '../../store/jobStore';
import { useAuthStore } from '../../store/authStore';
import { format } from 'date-fns';
import { Briefcase, Building, MapPin, Calendar, ExternalLink, Edit, Trash2 } from 'lucide-react';

const JobDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { currentJob, fetchJob, deleteJob, loading } = useJobStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      fetchJob(id);
    }
  }, [id, fetchJob]);

  const handleDelete = async () => {
    if (!id) return;
    
    if (window.confirm('Are you sure you want to delete this job posting?')) {
      await deleteJob(id);
      navigate('/jobs');
    }
  };

  if (loading && !currentJob) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!currentJob) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Job not found</h2>
        <p className="text-gray-500 mb-6">The job posting you're looking for doesn't exist or has been removed.</p>
        <Link
          to="/jobs"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Back to Job Board
        </Link>
      </div>
    );
  }

  const isOwner = user?.id === currentJob.user_id;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link
          to="/jobs"
          className="text-indigo-600 hover:text-indigo-900 flex items-center"
        >
          <svg className="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          Back to Job Board
        </Link>
      </div>

      <div className="bg-white shadow overflow-hidden rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{currentJob.title}</h2>
            <div className="mt-1 flex items-center text-sm text-gray-500">
              <Building className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
              <span className="mr-4">{currentJob.company}</span>
              <MapPin className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
              <span>{currentJob.location}</span>
            </div>
          </div>
          {isOwner && (
            <div className="flex space-x-2">
              <Link
                to={`/jobs/edit/${currentJob.id}`}
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
          <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 mb-6">
            <div className="sm:col-span-1">
              <div className="flex items-center">
                <Briefcase className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-sm font-medium text-gray-500">Salary Range</span>
              </div>
              <div className="mt-1 text-sm text-gray-900">
                {currentJob.salary_range || 'Not specified'}
              </div>
            </div>
            <div className="sm:col-span-1">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-sm font-medium text-gray-500">Posted On</span>
              </div>
              <div className="mt-1 text-sm text-gray-900">
                {format(new Date(currentJob.created_at), 'MMMM d, yyyy')}
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Job Description</h3>
            <div className="text-sm text-gray-500 whitespace-pre-line">
              {currentJob.description}
            </div>
          </div>

          {currentJob.requirements && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Requirements</h3>
              <div className="text-sm text-gray-500 whitespace-pre-line">
                {currentJob.requirements}
              </div>
            </div>
          )}

          {currentJob.application_url && (
            <div className="mt-8">
              <a
                href={currentJob.application_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Apply for this position
                <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobDetail;