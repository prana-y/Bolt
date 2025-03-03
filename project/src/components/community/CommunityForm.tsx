import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useCommunityStore } from '../../store/communityStore';
import { AlertCircle } from 'lucide-react';

type FormData = {
  name: string;
  description: string;
  imageUrl?: string;
};

const CommunityForm: React.FC = () => {
  const { createCommunity, loading, error } = useCommunityStore();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    const community = await createCommunity(data.name, data.description, data.imageUrl);
    if (community) {
      navigate(`/community/${community.id}`);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Create a New Community</h2>

      {error && (
        <div className="p-3 mb-4 bg-red-100 border border-red-300 rounded-md flex items-center gap-2 text-red-800">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Community Name
          </label>
          <input
            id="name"
            type="text"
            {...register('name', { required: true })}
            className={`mt-1 block w-full rounded-md border ${
              errors.name ? 'border-red-300' : 'border-gray-300'
            } shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">Community name is required</p>
          )}
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            rows={4}
            {...register('description', { required: true })}
            className={`mt-1 block w-full rounded-md border ${
              errors.description ? 'border-red-300' : 'border-gray-300'
            } shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
          ></textarea>
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">Description is required</p>
          )}
        </div>

        <div>
          <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">
            Community Image URL (optional)
          </label>
          <input
            id="imageUrl"
            type="url"
            {...register('imageUrl')}
            className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="https://example.com/image.jpg"
          />
          <p className="mt-1 text-xs text-gray-500">
            Provide a URL to an image for your community (recommended size: 800x400px)
          </p>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => navigate('/communities')}
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
            ) : 'Create Community'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CommunityForm;