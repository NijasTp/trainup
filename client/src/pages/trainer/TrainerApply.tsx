import type React from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, User, Mail, Phone, MapPin, FileText, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/ui/logo";
import { trainerRequestOtp as trainerRequestOtp } from "@/services/authService";
import { FaRupeeSign } from "react-icons/fa";

export default function TrainerApplyPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    location: "",
    experience: "",
    specialization: "",
    bio: "",
    price: {
      basic: '',
      premium: '',
      pro: '',
    },
    certificate: null as File | null,
    profileImage: null as File | null,
  });
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate()
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({
        ...formData,
        [e.target.name]: e.target.files[0],
      });
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (formData.password !== confirmPassword) {
        setError('Passwords do not match')
      }
      await trainerRequestOtp(formData.email);

      navigate("/trainer/verify-otp", {
        state: {
          formData: {
            ...formData,
            price: JSON.stringify(formData.price)
          },
          email: formData.email,
        },
      });
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to request OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <Logo className="justify-center mb-6" />
        </div>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Link to="/trainer/login" className="text-gray-400 hover:text-white">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <CardTitle className="text-white">Apply as a Trainer</CardTitle>
                <CardDescription className="text-gray-400">Join our community of fitness professionals</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && <div className="text-red-500 text-sm">{error}</div>}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName" className="text-white">
                    Full Name
                  </Label>
                  <div className="relative mt-2">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="fullName"
                      name="fullName"
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="bg-gray-700 border-gray-600 text-white pl-10"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email" className="text-white">
                    Email Address
                  </Label>
                  <div className="relative mt-2">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="bg-gray-700 border-gray-600 text-white pl-10"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="password" className="text-white">
                    Password
                  </Label>
                  <div className="relative mt-2">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="bg-gray-700 border-gray-600 text-white pl-10"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="confirmPassword" className="text-white">
                    Confirm Password
                  </Label>
                  <div className="relative mt-2">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="Enter your password again"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white pl-10"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="phone" className="text-white">
                    Phone Number
                  </Label>
                  <div className="relative mt-2">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="Enter your phone number"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="bg-gray-700 border-gray-600 text-white pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="md:col-span-2 space-y-4">
                  <Label className="text-white">Monthly Subscriptions Pricing (₹)</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="price-basic" className="text-gray-400 text-xs">Basic Plan</Label>
                      <div className="relative mt-1">
                        <FaRupeeSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="price-basic"
                          name="price-basic"
                          type="number"
                          placeholder="Basic"
                          value={formData.price.basic}
                          onChange={(e) => setFormData({ ...formData, price: { ...formData.price, basic: e.target.value } })}
                          className="bg-gray-700 border-gray-600 text-white pl-10"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="price-premium" className="text-gray-400 text-xs">Premium Plan</Label>
                      <div className="relative mt-1">
                        <FaRupeeSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="price-premium"
                          name="price-premium"
                          type="number"
                          placeholder="Premium"
                          value={formData.price.premium}
                          onChange={(e) => setFormData({ ...formData, price: { ...formData.price, premium: e.target.value } })}
                          className="bg-gray-700 border-gray-600 text-white pl-10"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="price-pro" className="text-gray-400 text-xs">Pro Plan</Label>
                      <div className="relative mt-1">
                        <FaRupeeSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="price-pro"
                          name="price-pro"
                          type="number"
                          placeholder="Pro"
                          value={formData.price.pro}
                          onChange={(e) => setFormData({ ...formData, price: { ...formData.price, pro: e.target.value } })}
                          className="bg-gray-700 border-gray-600 text-white pl-10"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location" className="text-white">
                    Location
                  </Label>
                  <div className="relative mt-2">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="location"
                      name="location"
                      type="text"
                      placeholder="City, State"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="bg-gray-700 border-gray-600 text-white pl-10"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="experience" className="text-white">
                    Years of Experience
                  </Label>
                  <Input
                    id="experience"
                    name="experience"
                    type="number"
                    placeholder="e.g., 5"
                    value={formData.experience}
                    onChange={handleInputChange}
                    className="bg-gray-700 border-gray-600 text-white mt-2"
                    required
                  />
                </div>
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
                  <option value="" disabled>Select a specialization</option>
                  <option value="Weight Training">Weight Training</option>
                  <option value="Yoga">Yoga</option>
                  <option value="Pilates">Pilates</option>
                  <option value="Cardio">Cardio</option>
                  <option value="CrossFit">CrossFit</option>
                  <option value="Martial Arts">Martial Arts</option>
                  <option value="Zumba">Zumba</option>
                  <option value="Other">Other</option>
                </select>
                {formData.specialization === "Other" && (
                  <Input
                    id="specialization"
                    name="specialization"
                    type="text"
                    placeholder="Enter your specialization"
                    value={formData.specialization === "Other" ? "" : formData.specialization}
                    onChange={handleInputChange}
                    className="bg-gray-700 border-gray-600 text-white mt-2"
                    required
                  />
                )}
              </div>
              <div>
                <Label htmlFor="profileImage" className="text-white">
                  Profile Picture <span className="trainup-accent">(Required)</span>
                </Label>
                <div className="mt-2 border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
                  <Upload className="flex mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <div className="space-y-2">
                    <Label htmlFor="profileImage" className="flex cursor-pointer">
                      <span className="hover:underline">Click to upload profile picture</span>
                      <Input
                        id="profileImage"
                        name="profileImage"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                        required
                      />
                    </Label>
                    <p className="text-gray-400 text-sm">
                      Upload your profile picture (JPG, PNG)
                    </p>
                    {formData.profileImage && <p className="text-green-400 text-sm">✓ {formData.profileImage.name}</p>}
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="bio" className="text-white">
                  Bio
                </Label>
                <div className="relative mt-2">
                  <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Textarea
                    id="bio"
                    name="bio"
                    placeholder="Tell us about yourself and your training philosophy..."
                    value={formData.bio}
                    onChange={handleInputChange}
                    className="bg-gray-700 border-gray-600 text-white pl-10 min-h-[100px]"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="certificate" className="text-white">
                  Certification/License <span className="trainup-accent">(Required)</span>
                </Label>
                <div className="mt-2 border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
                  <Upload className="flex mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <div className="space-y-2">
                    <Label htmlFor="certificate" className="flex cursor-pointer">
                      <span className="hover:underline">Click to upload certificate</span>
                      <Input
                        id="certificate"
                        name="certificate"
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleFileChange}
                        className="hidden"
                        required
                      />
                    </Label>
                    <p className="text-gray-400 text-sm">
                      Upload your fitness certification or license (JPG, PNG, PDF)
                    </p>
                    {formData.certificate && <p className="text-green-400 text-sm">✓ {formData.certificate.name}</p>}
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full trainup-primary text-black hover:bg-opacity-80"
                disabled={loading}
              >
                {loading ? "Submitting..." : "Submit Application"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}