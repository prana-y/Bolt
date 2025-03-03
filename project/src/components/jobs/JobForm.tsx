import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useJobStore } from '../../store/jobStore';
import { useAuthStore } from '../../store/authStore';
import { AlertCircle } from 'lucide-react';

type FormData = {
  title: string;
  company: string;
  location: string;
  description: string;
  requirements?: string;
  salary_range?: string;
  application_url?: string;
};

const JobForm: React.FC = () => {
  const { createJob, loading, error } = useJobStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    if (!user) return;
    
    const job = await createJob({
      ...data,
      user_id: user.id
    });
    
    if (job) {
      navigate(`/jobs/${job.id}`);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Post a Job</h2>

      {error && (
        <div className="p-3 mb-4 bg-red-100 border border-red-300 rounded-md flex items-center gap-2 text-red-800">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Job Title
            </label>
            <input
              id="title"
              type="text"
              {...register('title', { required: true })}
              className={`mt-1 block w-full rounded-md border ${
                errors.title ? 'border-red-300' : 'border-gray-300'
              } shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">Job title is required</p>
            )}
          </div>

          <div>
            <label htmlFor="company" className="block text-sm font-medium text-gray-700">
              Company
            </label>
            <input
              id="company"
              type="text"
              {...register('company', { required: true })}
              className={`mt-1 block w-full rounded-md border ${
                errors.company ? 'border-red-300' : 'border-gray-300'
              } shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
            />
            {errors.company && (
              <p className="mt-1 text-sm text-red-600">Company is required</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700">
              Location
            </label>
            <input
              id="location"
              type="text"
              {...register('location', { required: true })}
              className={`mt-1 block w-full rounded-md border ${
                errors.location ? 'border-red-300' : 'border-gray-300'
              } shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
            />
            {errors.location && (
              <p className="mt-1 text-sm text-red-600">Location is required</p>
            )}
          </div>

          <div>
            <label htmlFor="salary_range" className="block text-sm font-medium text-gray-700">
              Salary Range (optional)
            </label>
            <input
              id="salary_range"
              type="text"
              {...register('salary_range')}
              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="e.g. $50,000 - $70,000"
            />
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Job Description
          </label>
          <textarea
            id="description"
            rows={5}
            {...register('description', { required: true })}
            className={`mt-1 block w-full rounded-md border ${
              errors.description ? 'border-red-300' : 'border-gray-300'
            } shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
          ></textarea>
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">Job description is required</p>
          )}
        </div>

        <div>
          <label htmlFor="requirements" className="block text-sm font-medium text-gray-700">
            Requirements (optional)
          </label>
          <textarea
            id="requirements"
            rows={3}
            {...register('requirements')}
            className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          ></textarea>
        </div>

        <div>
          <label htmlFor="application_url" className="block text-sm font-medium text-gray-700">
            Application URL (optional)
          </label>
          <input
            id="application_url"
            type="url"
            {...register('application_url')}
            className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="https://example.com/apply"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => navigate('/jobs')}
            className="mr-3 inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Posting...
              </span>
            ) : 'Post Job'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default JobForm;