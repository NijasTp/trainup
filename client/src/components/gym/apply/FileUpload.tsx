
import { Image, Award, Camera, X } from 'lucide-react';

const FileUploadForm = ({ formData, handleFileChange, handleMultipleImages, removeImage, errors }:any) => {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
        <Image className="w-6 h-6 text-blue-500" />
        Documents & Images
      </h2>
      
      {/* Certificate Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Gym Certificate <span className="text-red-400">*</span>
        </label>
        <div className="relative">
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => handleFileChange(e, 'certificate')}
            className="hidden"
            id="certificate"
          />
          <label
            htmlFor="certificate"
            className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-gray-700 border-2 border-dashed border-gray-600 rounded-lg text-gray-300 hover:border-blue-500 cursor-pointer transition"
          >
            <Award className="w-5 h-5" />
            {formData.certificate ? formData.certificate.name : 'Upload Certificate'}
          </label>
        </div>
        {errors.certificate && <p className="text-red-400 text-sm mt-1">{errors.certificate}</p>}
      </div>

      {/* Profile Image Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Gym Logo/Profile Image <span className="text-red-400">*</span>
        </label>
        <div className="relative">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange(e, 'profileImage')}
            className="hidden"
            id="profileImage"
          />
          <label
            htmlFor="profileImage"
            className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-gray-700 border-2 border-dashed border-gray-600 rounded-lg text-gray-300 hover:border-blue-500 cursor-pointer transition"
          >
            <Camera className="w-5 h-5" />
            {formData.profileImage ? formData.profileImage.name : 'Upload Logo'}
          </label>
        </div>
        {errors.profileImage && <p className="text-red-400 text-sm mt-1">{errors.profileImage}</p>}
      </div>

      {/* Gallery Images */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Gym Gallery (Max 5 images)
        </label>
        <div className="relative">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleMultipleImages}
            className="hidden"
            id="gallery"
          />
          <label
            htmlFor="gallery"
            className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-gray-700 border-2 border-dashed border-gray-600 rounded-lg text-gray-300 hover:border-blue-500 cursor-pointer transition"
          >
            <Image className="w-5 h-5" />
            Add Gallery Images
          </label>
        </div>
        
        {/* Preview Gallery Images */}
        {formData.images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mt-4">
            {formData.images.map((image:any, index:any) => (
              <div key={index} className="relative group">
                <img
                  src={URL.createObjectURL(image)}
                  alt={`Gallery ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUploadForm;