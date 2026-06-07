import type React from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, User, Mail, Phone, MapPin, FileText, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trainerRequestOtp } from "@/services/authService";
import { FaRupeeSign } from "react-icons/fa";
import ColorBends from "@/components/ui/ColorBends";

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
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
        setError('Passwords do not match');
        setLoading(false);
        return;
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
    } catch (errVal) { const err = errVal as SafeAny;
      setError(err.response?.data?.error || "Failed to request OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden py-12 px-4">
      {/* ColorBends Background Layer */}
      <div className="absolute inset-0 z-0">
        <ColorBends
          colors={["#ff5c7a", "#8a5cff", "#00ffd1"]}
          rotation={0}
          speed={0.2}
          scale={1}
          frequency={1}
          warpStrength={1}
          mouseInfluence={1}
          parallax={0.5}
          noise={0.1}
          transparent
          autoRotate={0}
          className="pointer-events-none"
          style={{ pointerEvents: 'none' }}
        />
        <div className="absolute inset-0 bg-black/60"></div>
      </div>

      <div className="relative z-10 w-full max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-center text-4xl font-black tracking-tighter text-white mb-2">
            TRAIN<span className="text-[#176B87]">UP</span>
          </h1>
          <p className="text-gray-400 text-xs font-black uppercase tracking-widest text-center">
            Fitness Professional Program
          </p>
        </div>

        <Card className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl text-white">
          <CardHeader className="border-b border-white/10 pb-6">
            <div className="flex items-center gap-4">
              <Link to="/trainer/login" className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <CardTitle className="text-white text-2xl font-bold">Apply as a Trainer</CardTitle>
                <CardDescription className="text-gray-400">Join our community of fitness professionals</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName" className="text-gray-300 font-bold uppercase tracking-wider text-xs ml-1">
                    Full Name
                  </Label>
                  <div className="relative mt-2">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="fullName"
                      name="fullName"
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="bg-white/5 border-white/10 text-white pl-12 h-12 rounded-xl focus:border-[#176B87] focus:ring-2 focus:ring-[#176B87]/50"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email" className="text-gray-300 font-bold uppercase tracking-wider text-xs ml-1">
                    Email Address
                  </Label>
                  <div className="relative mt-2">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="bg-white/5 border-white/10 text-white pl-12 h-12 rounded-xl focus:border-[#176B87] focus:ring-2 focus:ring-[#176B87]/50"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="password" className="text-gray-300 font-bold uppercase tracking-wider text-xs ml-1">
                    Password
                  </Label>
                  <div className="relative mt-2">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="bg-white/5 border-white/10 text-white pl-12 h-12 rounded-xl focus:border-[#176B87] focus:ring-2 focus:ring-[#176B87]/50"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="confirmPassword" className="text-gray-300 font-bold uppercase tracking-wider text-xs ml-1">
                    Confirm Password
                  </Label>
                  <div className="relative mt-2">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="bg-white/5 border-white/10 text-white pl-12 h-12 rounded-xl focus:border-[#176B87] focus:ring-2 focus:ring-[#176B87]/50"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="phone" className="text-gray-300 font-bold uppercase tracking-wider text-xs ml-1">
                    Phone Number
                  </Label>
                  <div className="relative mt-2">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="Enter your phone number"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="bg-white/5 border-white/10 text-white pl-12 h-12 rounded-xl focus:border-[#176B87] focus:ring-2 focus:ring-[#176B87]/50"
                      required
                    />
                  </div>
                </div>
                
                <div className="md:col-span-2 space-y-4 pt-2">
                  <Label className="text-gray-300 font-bold uppercase tracking-wider text-xs ml-1">Monthly Subscriptions Pricing (₹)</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="price-basic" className="text-gray-400 text-[10px] font-bold uppercase tracking-widest ml-1">Basic Plan</Label>
                      <div className="relative mt-1">
                        <FaRupeeSign className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                        <Input
                          id="price-basic"
                          name="price-basic"
                          type="number"
                          placeholder="Basic"
                          value={formData.price.basic}
                          onChange={(e) => setFormData({ ...formData, price: { ...formData.price, basic: e.target.value } })}
                          className="bg-white/5 border-white/10 text-white pl-10 h-11 rounded-xl focus:border-[#176B87] focus:ring-2 focus:ring-[#176B87]/50"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="price-premium" className="text-gray-400 text-[10px] font-bold uppercase tracking-widest ml-1">Premium Plan</Label>
                      <div className="relative mt-1">
                        <FaRupeeSign className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                        <Input
                          id="price-premium"
                          name="price-premium"
                          type="number"
                          placeholder="Premium"
                          value={formData.price.premium}
                          onChange={(e) => setFormData({ ...formData, price: { ...formData.price, premium: e.target.value } })}
                          className="bg-white/5 border-white/10 text-white pl-10 h-11 rounded-xl focus:border-[#176B87] focus:ring-2 focus:ring-[#176B87]/50"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="price-pro" className="text-gray-400 text-[10px] font-bold uppercase tracking-widest ml-1">Pro Plan</Label>
                      <div className="relative mt-1">
                        <FaRupeeSign className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                        <Input
                          id="price-pro"
                          name="price-pro"
                          type="number"
                          placeholder="Pro"
                          value={formData.price.pro}
                          onChange={(e) => setFormData({ ...formData, price: { ...formData.price, pro: e.target.value } })}
                          className="bg-white/5 border-white/10 text-white pl-10 h-11 rounded-xl focus:border-[#176B87] focus:ring-2 focus:ring-[#176B87]/50"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location" className="text-gray-300 font-bold uppercase tracking-wider text-xs ml-1">
                    Location
                  </Label>
                  <div className="relative mt-2">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="location"
                      name="location"
                      type="text"
                      placeholder="City, State"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="bg-white/5 border-white/10 text-white pl-12 h-12 rounded-xl focus:border-[#176B87] focus:ring-2 focus:ring-[#176B87]/50"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="experience" className="text-gray-300 font-bold uppercase tracking-wider text-xs ml-1">
                    Years of Experience
                  </Label>
                  <Input
                    id="experience"
                    name="experience"
                    type="number"
                    placeholder="e.g., 5"
                    value={formData.experience}
                    onChange={handleInputChange}
                    className="bg-white/5 border-white/10 text-white mt-2 h-12 rounded-xl focus:border-[#176B87] focus:ring-2 focus:ring-[#176B87]/50"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="specialization" className="text-gray-300 font-bold uppercase tracking-wider text-xs ml-1">
                  Specialization
                </Label>
                <select
                  id="specialization"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleInputChange}
                  className="bg-white/5 border border-white/10 text-white mt-2 block w-full p-3 h-12 rounded-xl focus:border-[#176B87] focus:ring-2 focus:ring-[#176B87]/50 transition-all cursor-pointer"
                  style={{ colorScheme: 'dark' }}
                  required
                >
                  <option value="" disabled className="bg-neutral-900">Select a specialization</option>
                  <option value="Weight Training" className="bg-neutral-900">Weight Training</option>
                  <option value="Yoga" className="bg-neutral-900">Yoga</option>
                  <option value="Pilates" className="bg-neutral-900">Pilates</option>
                  <option value="Cardio" className="bg-neutral-900">Cardio</option>
                  <option value="CrossFit" className="bg-neutral-900">CrossFit</option>
                  <option value="Martial Arts" className="bg-neutral-900">Martial Arts</option>
                  <option value="Zumba" className="bg-neutral-900">Zumba</option>
                  <option value="Other" className="bg-neutral-900">Other</option>
                </select>
                {formData.specialization === "Other" && (
                  <Input
                    id="specialization"
                    name="specialization"
                    type="text"
                    placeholder="Enter your specialization"
                    value={formData.specialization === "Other" ? "" : formData.specialization}
                    onChange={handleInputChange}
                    className="bg-white/5 border-white/10 text-white mt-2 h-12 rounded-xl focus:border-[#176B87] focus:ring-2 focus:ring-[#176B87]/50"
                    required
                  />
                )}
              </div>

              <div>
                <Label htmlFor="profileImage" className="text-gray-300 font-bold uppercase tracking-wider text-xs ml-1">
                  Profile Picture <span className="text-[#176B87]">(Required)</span>
                </Label>
                <div className="mt-2 border-2 border-dashed border-white/10 bg-white/5 hover:bg-white/10 hover:border-[#176B87]/50 rounded-2xl p-6 text-center cursor-pointer transition-all duration-300 relative">
                  <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <Label htmlFor="profileImage" className="cursor-pointer block text-sm font-medium text-gray-300 hover:text-white transition-colors">
                    Click to upload profile picture
                  </Label>
                  <Input
                    id="profileImage"
                    name="profileImage"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    required
                  />
                  <p className="text-gray-500 text-xs mt-1">
                    Upload your profile picture (JPG, PNG)
                  </p>
                  {formData.profileImage && <p className="text-[#00ffd1] text-xs font-bold mt-2">✓ {formData.profileImage.name}</p>}
                </div>
              </div>

              <div>
                <Label htmlFor="bio" className="text-gray-300 font-bold uppercase tracking-wider text-xs ml-1">
                  Bio
                </Label>
                <div className="relative mt-2">
                  <FileText className="absolute left-4 top-4 h-4 w-4 text-gray-400" />
                  <Textarea
                    id="bio"
                    name="bio"
                    placeholder="Tell us about yourself and your training philosophy..."
                    value={formData.bio}
                    onChange={handleInputChange}
                    className="bg-white/5 border-white/10 text-white pl-12 min-h-[100px] rounded-xl focus:border-[#176B87] focus:ring-2 focus:ring-[#176B87]/50"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="certificate" className="text-gray-300 font-bold uppercase tracking-wider text-xs ml-1">
                  Certification/License <span className="text-[#176B87]">(Required)</span>
                </Label>
                <div className="mt-2 border-2 border-dashed border-white/10 bg-white/5 hover:bg-white/10 hover:border-[#176B87]/50 rounded-2xl p-6 text-center cursor-pointer transition-all duration-300 relative">
                  <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <Label htmlFor="certificate" className="cursor-pointer block text-sm font-medium text-gray-300 hover:text-white transition-colors">
                    Click to upload certificate
                  </Label>
                  <Input
                    id="certificate"
                    name="certificate"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    required
                  />
                  <p className="text-gray-500 text-xs mt-1">
                    Upload your fitness certification or license (JPG, PNG, PDF)
                  </p>
                  {formData.certificate && <p className="text-[#00ffd1] text-xs font-bold mt-2">✓ {formData.certificate.name}</p>}
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-[#176B87] hover:bg-[#64CCC5] text-white font-black rounded-xl transition-all duration-300 flex items-center justify-center cursor-pointer"
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