// src/pages/GymApply.tsx
import React, { useState, type FormEvent, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Dumbbell, ArrowRight } from "lucide-react";
import BasicInfoForm from "@/components/gym/apply/BasicInfoForm";
import LocationForm from "@/components/gym/apply/LocationForm";
import FileUploadForm from "@/components/gym/apply/FileUpload";
import { requestGymOtp } from "@/services/authService";

interface GeoLocation {
  type: "Point";
  coordinates: [number, number];
}

interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  geoLocation: GeoLocation;
  certificate: File | null;
  profileImage: File | null;
  images: File[];
}

interface Errors {
  [key: string]: string;
}

const GymApply: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    geoLocation: { type: "Point", coordinates: [0, 0] },
    certificate: null,
    profileImage: null,
    images: [],
  });

  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState<boolean>(false);

  const handleFileChange = (
    e: ChangeEvent<HTMLInputElement>,
    field: "certificate" | "profileImage"
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        [field]: file,
      }));
    }
  };

  const handleMultipleImages = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...files].slice(0, 5),
    }));
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Errors = {};

    if (!formData.name) newErrors.name = "Gym name is required";
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.password) newErrors.password = "Password is required";
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    if (!formData.geoLocation.coordinates[0] || !formData.geoLocation.coordinates[1]) {
      newErrors.geoLocation = "Please use current location to set coordinates";
    }

    if (!formData.certificate) newErrors.certificate = "Certificate is required";
    if (!formData.profileImage) newErrors.profileImage = "Profile image is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      await requestGymOtp(formData.email);
      navigate("/gym/verify-otp", { state: { formData } });
    } catch (err: any) {
      setErrors({
        submit: err.response?.data?.error || "Failed to send OTP",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center justify-center gap-2">
              <Dumbbell className="w-10 h-10 text-blue-500" />
              TrainUp Gym Application
            </h1>
            <p className="text-gray-400">
              Join our network of premium fitness facilities
            </p>
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Step 1 of 2</span>
              <span className="text-sm text-gray-400">Application Form</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full w-1/2"></div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-2xl shadow-2xl p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              <BasicInfoForm
                formData={formData}
                handleInputChange={handleInputChange}
                errors={errors}
              />

              <LocationForm
                formData={formData}
                errors={errors}
                setFormData={setFormData}
              />

              <FileUploadForm
                formData={formData}
                handleFileChange={handleFileChange}
                handleMultipleImages={handleMultipleImages}
                removeImage={removeImage}
                errors={errors}
              />

              {errors.submit && (
                <div className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded-lg">
                  {errors.submit}
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      Continue to Verification
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GymApply;