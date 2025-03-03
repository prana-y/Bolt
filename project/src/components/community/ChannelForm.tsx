import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { useCommunityStore } from '../../store/communityStore';
import { AlertCircle } from 'lucide-react';

type FormData = {
  name: string;
  description: string;
};

const ChannelForm: React.FC = () => {
  const { id: communityId } = useParams<{ id: string }>();
  const { createChannel, loading, error } = useCommunityStore();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    if (communityId) {
      const channel = await createChannel(data.name, data.description, communityId);
      if (channel) {
        navigate(`/community/${communityId}`);
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Create a New Channel</h2>

      {error && (
        <div className="p-3 mb-4 bg-red-100 border border-red-300 rounded-md flex items-center gap-2 text-red-800">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Channel Name
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
              #
            </span>
            <input
              id="name"
              type="text"
              {...register('name', { required: true })}
              className={`block w-full pl-8 pr-3 py-2 border ${
                errors.name ? 'border-red-300' : 'border-gray-300'
              } rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
              placeholder="general"
            />
          </div>
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">Channel name is required</p>
          )}
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description (optional)
          </label>
          <textarea
            id="description"
            rows={3}
            {...register('description')}
            className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="What is this channel about?"
          ></textarea>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => navigate(`/community/${communityId}`)}
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
                Creating...
              </span>
            ) : 'Create Channel'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChannelForm;