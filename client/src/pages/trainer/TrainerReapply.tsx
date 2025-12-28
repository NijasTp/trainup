import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { reapplyTrainer, getTrainerDetails } from '@/services/trainerService';
import { Logo } from '@/components/ui/logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, ArrowLeft } from 'lucide-react';

import type { TrainerDetails } from "@/interfaces/trainer/ITrainerReapply";

const TrainerReapply: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    experience: '',
    specialization: '',
    bio: '',
    price: {
      basic: '',
      premium: '',
      pro: '',
    },
    certificate: null as File | null,
    profileImage: null as File | null,
  });
  const [rejectReason, setRejectReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);


  useEffect(() => {
    const fetchTrainerDetails = async () => {
      setFetching(true);
      try {
        const res = await getTrainerDetails();
        const trainer = res.trainer as TrainerDetails;
        setRejectReason(trainer.rejectReason);
        setFormData((prev) => ({
          ...prev,
          fullName: trainer.name || '',
          email: trainer.email || '',
          phone: trainer.phone || '',
          location: trainer.location || '',
          experience: trainer.experience || '',
          specialization: trainer.specialization || '',
          bio: trainer.bio || '',
          price: {
            basic: trainer.price?.basic || '',
            premium: trainer.price?.premium || '',
            pro: trainer.price?.pro || '',
          },
        }));
      } catch (error: any) {
        toast.error(error.response?.data?.error || error.message || 'Failed to fetch trainer details');
        console.error('Error fetching trainer details:', error);
      } finally {
        setFetching(false);
      }
    };
    fetchTrainerDetails();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setFormData((prev) => ({
        ...prev,
        [name]: files[0],
      }));
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName || !formData.email || !formData.phone || !formData.specialization) {
      toast.error("Please fill in all required fields");
      return;
    }

    const data = new FormData();

    // text fields
    data.append("fullName", formData.fullName);
    data.append("email", formData.email);
    data.append("phone", formData.phone);
    data.append("location", formData.location);
    data.append("experience", formData.experience);
    data.append("specialization", formData.specialization);
    data.append("bio", formData.bio);
    data.append("price", JSON.stringify(formData.price));

    // files
    if (formData.certificate) {
      data.append("certificate", formData.certificate);
    }
    if (formData.profileImage) {
      data.append("profileImage", formData.profileImage);
    }

    setLoading(true);
    try {
      await reapplyTrainer(data);
      toast.success("Application resubmitted successfully");
      navigate("/trainer/waitlist");
    } catch (error: any) {
      toast.error(
        error.response?.data?.error || error.message || "Failed to submit application"
      );
      console.error("Error submitting reapplication:", error);
    } finally {
      setLoading(false);
    }
  };


  const handleBack = () => {
    navigate('/trainer/waitlist');
  };

  return (
    <div className="min-h-screen bg-[#1F2A44] flex items-center justify-center p-4">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');
          body {
            font-family: 'Poppins', sans-serif;
          }
          .animate-fade-in {
            animation: fadeIn 0.5s ease-out;
          }
          @keyframes fadeIn {
            0% { opacity: 0; transform: translateY(10px); }
            100% { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>

      <div className="w-full max-w-2xl animate-fade-in">
        <div className="mb-6 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="text-white hover:text-[#4B8B9B] hover:bg-[#4B8B9B]/10"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Waitlist
          </Button>
          <Logo />
        </div>

        <Card className="bg-[#111827] border border-[#4B8B9B]/30 shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-white text-3xl font-bold tracking-tight">
              Reapply as Trainer
            </CardTitle>
            <CardDescription className="text-[#4B8B9B] text-lg">
              The last application was rejected because of the following reason:
              <span className='text-red-700'> {rejectReason} </span>
            </CardDescription>
          </CardHeader>

          <CardContent>
            {fetching ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-[#4B8B9B]" />
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="fullName" className="text-white">
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="bg-gray-700 border-gray-600 text-white mt-2"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="text-white">
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="bg-gray-700 border-gray-600 text-white mt-2"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="phone" className="text-white">
                    Phone
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="bg-gray-700 border-gray-600 text-white mt-2"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="location" className="text-white">
                    Location
                  </Label>
                  <Input
                    id="location"
                    name="location"
                    type="text"
                    placeholder="Enter your location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="bg-gray-700 border-gray-600 text-white mt-2"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="experience" className="text-white">
                    Experience
                  </Label>
                  <Input
                    id="experience"
                    name="experience"
                    type="text"
                    placeholder="e.g., 5 years"
                    value={formData.experience}
                    onChange={handleInputChange}
                    className="bg-gray-700 border-gray-600 text-white mt-2"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="specialization" className="text-white">
                    Specialization
                  </Label>
                  <select
                    id="specialization"
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleInputChange}
                    className="bg-gray-700 border-gray-600 text-white mt-2 block w-full p-2 rounded-md"
                    required
                  >
                    <option value="" disabled>
                      Select a specialization
                    </option>
                    <option value="Weight Training">Weight Training</option>
                    <option value="Yoga">Yoga</option>
                    <option value="Pilates">Pilates</option>
                    <option value="Cardio">Cardio</option>
                    <option value="CrossFit">CrossFit</option>
                    <option value="Martial Arts">Martial Arts</option>
                    <option value="Zumba">Zumba</option>
                    <option value="Other">Other</option>
                  </select>
                  {formData.specialization === 'Other' && (
                    <Input
                      id="specialization"
                      name="specialization"
                      type="text"
                      placeholder="Enter your specialization"
                      value={formData.specialization === 'Other' ? '' : formData.specialization}
                      onChange={handleInputChange}
                      className="bg-gray-700 border-gray-600 text-white mt-2"
                      required
                    />
                  )}
                </div>

                <div>
                  <Label htmlFor="bio" className="text-white">
                    Bio
                  </Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    placeholder="Tell us about yourself"
                    value={formData.bio}
                    onChange={handleInputChange}
                    className="bg-gray-700 border-gray-600 text-white mt-2"
                    rows={4}
                  />
                </div>

                <div className="space-y-4">
                  <Label className="text-white font-semibold">Monthly Subscription Prices (₹)</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="price-basic" className="text-gray-400 text-xs">Basic Plan</Label>
                      <Input
                        id="price-basic"
                        name="price-basic"
                        type="number"
                        placeholder="Basic"
                        value={formData.price.basic}
                        onChange={(e) => setFormData({ ...formData, price: { ...formData.price, basic: e.target.value } })}
                        className="bg-gray-700 border-gray-600 text-white mt-1"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="price-premium" className="text-gray-400 text-xs">Premium Plan</Label>
                      <Input
                        id="price-premium"
                        name="price-premium"
                        type="number"
                        placeholder="Premium"
                        value={formData.price.premium}
                        onChange={(e) => setFormData({ ...formData, price: { ...formData.price, premium: e.target.value } })}
                        className="bg-gray-700 border-gray-600 text-white mt-1"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="price-pro" className="text-gray-400 text-xs">Pro Plan</Label>
                      <Input
                        id="price-pro"
                        name="price-pro"
                        type="number"
                        placeholder="Pro"
                        value={formData.price.pro}
                        onChange={(e) => setFormData({ ...formData, price: { ...formData.price, pro: e.target.value } })}
                        className="bg-gray-700 border-gray-600 text-white mt-1"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="certificate" className="text-white">
                    Certificate
                  </Label>
                  <Input
                    id="certificate"
                    name="certificate"
                    type="file"
                    accept=".pdf,.jpg,.png"
                    onChange={handleFileChange}
                    className="bg-gray-700 border-gray-600 text-white mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="profileImage" className="text-white">
                    Profile Image
                  </Label>
                  <Input
                    id="profileImage"
                    name="profileImage"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="bg-gray-700 border-gray-600 text-white mt-2"
                  />
                </div>

                <div className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
                    className="text-gray-400 border-gray-600 hover:bg-gray-700/50 hover:text-white"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading || fetching}
                    className="bg-[#001C30] text-white hover:bg-gradient-to-r hover:from-[#001C30] hover:to-[#1F2A44] transition duration-300"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      'Submit Application'
                    )}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TrainerReapply;