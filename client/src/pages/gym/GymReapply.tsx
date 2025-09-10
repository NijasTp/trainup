import React, { useState, useEffect, type FormEvent, type ChangeEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { type RootState } from "@/redux/store";
import { getGymDetails } from "@/services/gymService";
import { Dumbbell, ArrowRight } from "lucide-react";
import BasicInfoForm from "@/components/gym/apply/BasicInfoForm";
import LocationForm from "@/components/gym/apply/LocationForm";
import FileUploadForm from "@/components/gym/apply/FileUpload";
import { reapplyGym } from "@/services/gymService"; 
import { toast } from "react-toastify";
import type { GymApplication } from "@/interfaces/gym/iGymWaitlist";

interface Location {
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  location: Location;
  certificate: File | null;
  profileImage: File | null;
  images: File[];
}

interface Errors {
  [key: string]: string;
}

const GymReapply: React.FC = () => {
  const { gym, isAuthenticated } = useSelector((state: RootState) => state.gymAuth);
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    location: { address: "", city: "", state: "", zipCode: "", country: "" },
    certificate: null,
    profileImage: null,
    images: [],
  });
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [application, setApplication] = useState<GymApplication | null>(null);
  const [fetchLoading, setFetchLoading] = useState<boolean>(true);
  const [rejectReason, setRejectReason] = useState<string>("");

  useEffect(() => {
    const fetchApplicationDetails = async () => {
      if (gym?._id) {
        try {
          setFetchLoading(true);
          const response = await getGymDetails();
          if (response.gymDetails) {
            const gymDetails = response.gymDetails;
            setApplication(gymDetails);
            setRejectReason(gymDetails.rejectReason || "No specific reason provided.");

        
            setFormData((prev) => ({
              ...prev,
              name: gymDetails.name || "",
              email: gymDetails.email || "",
              location: {
                address: gymDetails.location || "",
                city: "",
                state: "",
                zipCode: "",
                country: "",
              },

              password: "",
              confirmPassword: "",
              certificate: null,
              profileImage: null,
              images: [],
            }));
          }
        } catch (error: any) {
          console.error("Error fetching application details:", error);
          toast.error("Failed to load application details.");
        } finally {
          setFetchLoading(false);
        }
      }
    };

    if (isAuthenticated && gym) {
      fetchApplicationDetails();
    } else {
      navigate("/gym/login");
    }
  }, [gym, isAuthenticated, navigate]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof FormData] as Location),
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]:
          name === "trainers" || name === "members"
            ? parseInt(value) || 0
            : value,
      }));
    }
  };

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

  const validateForm = (): boolean => {
    const newErrors: Errors = {};

    if (!formData.name) newErrors.name = "Gym name is required";
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.password) newErrors.password = "Password is required (for account update)";
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    if (!formData.location.address) newErrors.address = "Address is required";
    if (!formData.location.city) newErrors.city = "City is required";
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
      // Assuming reapplyGym service handles the reapplication without OTP since user is authenticated
      await reapplyGym(formData);
      toast.success("Reapplication submitted successfully!");
      navigate("/gym/waitlist");
    } catch (err: any) {
      setErrors({ submit: err.response?.data?.error || "Failed to reapply" });
      toast.error("Reapplication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || !gym) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-4">
        <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 text-center">
          <p className="text-gray-400 text-lg">Please log in to reapply.</p>
        </div>
      </div>
    );
  }

  if (fetchLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center justify-center gap-2">
              <Dumbbell className="w-10 h-10 text-red-500" />
              Application Rejected - Please Reapply
            </h1>
            <p className="text-gray-400">Update your information and try again to join our network.</p>
          </div>

          {/* Rejection Reason Card */}
          {rejectReason && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 mb-8">
              <h3 className="text-lg font-semibold text-red-400 mb-3">Rejection Reason</h3>
              <p className="text-red-300">{rejectReason}</p>
            </div>
          )}

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Step 1 of 1</span>
              <span className="text-sm text-gray-400">Reapplication Form</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="bg-red-500 h-2 rounded-full w-full"></div>
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-gray-800 rounded-2xl shadow-2xl p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              <BasicInfoForm 
                formData={formData} 
                handleInputChange={handleInputChange} 
                errors={errors} 
              />
              
              <LocationForm
                formData={formData} 
                handleInputChange={handleInputChange} 
                errors={errors} 
              />
              
              <FileUploadForm 
                formData={formData} 
                handleFileChange={handleFileChange}
                handleMultipleImages={handleMultipleImages}
                removeImage={removeImage}
                errors={errors} 
              />

              {/* Error Message */}
              {errors.submit && (
                <div className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded-lg">
                  {errors.submit}
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-8 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Reapplying...
                    </>
                  ) : (
                    <>
                      Reapply Now
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

export default GymReapply;