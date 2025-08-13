
import { Users } from 'lucide-react';

const GymDetailsForm = ({ formData, handleInputChange }:any) => {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
        <Users className="w-6 h-6 text-blue-500" />
        Gym Details
      </h2>
      
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Number of Trainers
          </label>
          <input
            type="number"
            name="trainers"
            value={formData.trainers}
            onChange={handleInputChange}
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition"
            placeholder="0"
            min="0"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Current Members
          </label>
          <input
            type="number"
            name="members"
            value={formData.members}
            onChange={handleInputChange}
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition"
            placeholder="0"
            min="0"
          />
        </div>
      </div>
    </div>
  );
};

export default GymDetailsForm;