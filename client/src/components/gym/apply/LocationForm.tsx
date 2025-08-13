
import { MapPin } from 'lucide-react';

const LocationForm = ({ formData, handleInputChange, errors }:any) => {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
        <MapPin className="w-6 h-6 text-blue-500" />
        Location Details
      </h2>
      
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Street Address
        </label>
        <input
          type="text"
          name="location.address"
          value={formData.location.address}
          onChange={handleInputChange}
          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition"
          placeholder="123 Fitness Street"
        />
        {errors.address && <p className="text-red-400 text-sm mt-1">{errors.address}</p>}
      </div>
      
      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            City
          </label>
          <input
            type="text"
            name="location.city"
            value={formData.location.city}
            onChange={handleInputChange}
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition"
            placeholder="New York"
          />
          {errors.city && <p className="text-red-400 text-sm mt-1">{errors.city}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            State
          </label>
          <input
            type="text"
            name="location.state"
            value={formData.location.state}
            onChange={handleInputChange}
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition"
            placeholder="NY"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            ZIP Code
          </label>
          <input
            type="text"
            name="location.zipCode"
            value={formData.location.zipCode}
            onChange={handleInputChange}
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition"
            placeholder="10001"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Country
        </label>
        <input
          type="text"
          name="location.country"
          value={formData.location.country}
          onChange={handleInputChange}
          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition"
          placeholder="United States"
        />
      </div>
    </div>
  );
};

export default LocationForm;