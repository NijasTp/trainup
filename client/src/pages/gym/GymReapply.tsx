import React, { useMemo, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { type RootState } from '@/redux/store';
import { getGymDetails, reapplyGym } from '@/services/gymService';
import { toast } from 'react-toastify';
import LocationForm from '@/components/gym/apply/LocationForm';
import FileUploadForm from '@/components/gym/apply/FileUpload';
import { loginGym } from '@/redux/slices/gymAuthSlice';

const GymReapply: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { gym } = useSelector((state: RootState) => state.gymAuth);
console.log(gym)
  const rejectReasonFromNav = (location.state as any)?.rejectReason as string | undefined;
  const rejectReason = useMemo(
    () => rejectReasonFromNav || gym?.rejectReason || 'Application was rejected.',
    [rejectReasonFromNav, gym?.rejectReason]
  );

  // Form State
  const [name, setName] = useState(gym?.name || '');
  const [geoLocation, setGeoLocation] = useState<{
    type: 'Point';
    coordinates: [number, number];
  }>({ type: 'Point', coordinates: [0, 0] });
  const [certificate, setCertificate] = useState<File | null>(null);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [images, setImages] = useState<File[]>([]);
  const dispatch = useDispatch();

  
  const [errors, setErrors] = useState<Record<string, string>>({
    name: '',
    location: '',
    certificate: '',
    profileImage: '',
    images: '',
  });

  const [touched, setTouched] = useState<Record<string, boolean>>({
    name: false,
    location: false,
    certificate: false,
    profileImage: false,
    images: false,
  });

  const [submitting, setSubmitting] = useState(false);

  // Real-time validation
  useEffect(() => {
    const newErrors: Record<string, string> = {};

    if (touched.name && !name.trim()) {
      newErrors.name = 'Gym name is required';
    }

    if (touched.location) {
      const [lng, lat] = geoLocation.coordinates;
      if (!lng || !lat || lng === 0 || lat === 0) {
        newErrors.location = 'Please select a valid location on the map';
      }
    }

    if (touched.certificate && !certificate) {
      newErrors.certificate = 'Certificate is required';
    }

    if (touched.profileImage && !profileImage) {
      newErrors.profileImage = 'Profile image is required';
    }

    if (touched.images && images.length === 0) {
      newErrors.images = 'At least one gym image is required';
    }

    setErrors(newErrors);
  }, [name, geoLocation, certificate, profileImage, images, touched]);

  // Check if form is valid
  const isFormValid = () => {
    return (
      name.trim() &&
      geoLocation.coordinates[0] !== 0 &&
      geoLocation.coordinates[1] !== 0 &&
      certificate &&
      profileImage &&
      images.length > 0
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    setTouched({
      name: true,
      location: true,
      certificate: true,
      profileImage: true,
      images: true,
    });

    if (!isFormValid()) {
      toast.error('Please fix all errors before submitting');
      return;
    }

    const form = new FormData();
    form.append('name', name.trim());
    form.append('geoLocation', JSON.stringify(geoLocation));
    if (certificate) form.append('certificate', certificate);
    if (profileImage) form.append('profileImage', profileImage);
    images.forEach((file) => form.append('images', file));

    setSubmitting(true);
    try {
      await reapplyGym(form);

      // CRITICAL: Refetch fresh gym details from server
      const freshData = await getGymDetails();
      const updatedGym = freshData.gymDetails;

      // Update Redux immediately with fresh data
      dispatch(loginGym({
        ...updatedGym,
        isVerified: updatedGym.verifyStatus === 'approved'
      }));

      toast.success('Reapplied successfully! Your application is now pending.');
      navigate('/gym/waitlist', { replace: true });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to reapply');
    }finally {
    setSubmitting(false);
  }
};

return (
  <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6 flex items-center justify-center">
    <div className="w-full max-w-2xl bg-gray-800 rounded-2xl shadow-2xl p-8">
      <h1 className="text-3xl font-bold text-white mb-3">Application Rejected</h1>
      <div className="bg-red-900/30 border border-red-700 text-red-300 p-4 rounded-lg mb-6">
        <p className="font-medium">Reason:</p>
        <p className="mt-1">{rejectReason}</p>
      </div>

      <h2 className="text-2xl font-semibold text-white mb-6">Reapply with Updated Details</h2>

      <form onSubmit={handleSubmit} className="space-y-7">
        {/* Gym Name */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Gym Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => setTouched((prev) => ({ ...prev, name: true }))}
            className={`w-full rounded-lg bg-gray-700 text-white p-3 border ${errors.name ? 'border-red-500' : 'border-gray-600'
              } focus:border-blue-500 focus:outline-none transition`}
            placeholder="Enter your gym name"
          />
          {errors.name && <p className="mt-1 text-sm text-red-400">{errors.name}</p>}
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Gym Location <span className="text-red-500">*</span>
          </label>
          <div className="rounded-lg overflow-hidden">
            <LocationForm
              formData={{ geoLocation }}
              errors={{ location: errors.location }}
              setFormData={(updater: any) => {
                if (typeof updater === 'function') {
                  setGeoLocation((prev) => updater(prev).geoLocation || prev);
                } else {
                  setGeoLocation(updater.geoLocation || geoLocation);
                }
                setTouched((prev) => ({ ...prev, location: true }));
              }}
            />
          </div>
          {errors.location && <p className="mt-1 text-sm text-red-400">{errors.location}</p>}
        </div>

        {/* File Uploads */}
        <FileUploadForm
          formData={{
            certificate,
            profileImage,
            images,
          }}
          handleFileChange={(e: React.ChangeEvent<HTMLInputElement>, field: 'certificate' | 'profileImage') => {
            const file = e.target.files?.[0] || null;
            if (field === 'certificate') setCertificate(file);
            if (field === 'profileImage') setProfileImage(file);
            setTouched((prev) => ({ ...prev, [field]: true }));
          }}
          handleMultipleImages={(e: React.ChangeEvent<HTMLInputElement>) => {
            const files = Array.from(e.target.files || []);
            setImages((prev) => [...prev, ...files].slice(0, 5));
            setTouched((prev) => ({ ...prev, images: true }));
          }}
          removeImage={(index: number) => {
            setImages((prev) => prev.filter((_, i) => i !== index));
            setTouched((prev) => ({ ...prev, images: true }));
          }}
          errors={{
            certificate: errors.certificate,
            profileImage: errors.profileImage,
            images: errors.images,
          }}
        />

        {/* Submit Buttons */}
        <div className="flex items-center gap-4 pt-4">
          <button
            type="submit"
            disabled={submitting || !isFormValid()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium px-6 py-3 rounded-lg transition"
          >
            {submitting ? 'Submitting...' : 'Reapply'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/gym/waitlist')}
            className="bg-gray-700 hover:bg-gray-600 text-white font-medium px-6 py-3 rounded-lg transition"
          >
            Cancel
          </button>
        </div>

        {/* Summary of required fields */}
        <div className="text-xs text-gray-400 mt-4">
          <span className="text-red-500">*</span> All fields are required.
        </div>
      </form>
    </div>
  </div>
);
};

export default GymReapply;