import { useState } from 'react';
import GymPageLayout from '@/components/layouts/GymPageLayout';
import { Button } from '@/components/ui/button';
import { Briefcase, Clock, IndianRupee, Star, ShieldCheck, Plus, Sparkles } from 'lucide-react';

export default function PostTrainerHiring() {
    const [formData, setFormData] = useState({
        role: '',
        specialization: '',
        experience: '',
        hours: '',
        salary: '',
        benefits: '',
        description: '',
        type: 'full-time',
    });

    return (
        <GymPageLayout
            title="Talent Acquisition"
            subtitle="Post a hiring request to find the best trainers for your gym."
        >
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 pb-20">
                {/* Form Section */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 md:p-10 shadow-2xl">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="p-3 bg-blue-600/10 rounded-2xl border border-blue-500/20">
                            <Plus className="text-blue-400" size={24} />
                        </div>
                        <h2 className="text-3xl font-black text-white tracking-tighter">Create Hiring Post</h2>
                    </div>

                    <form className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Role / Position</label>
                                <input
                                    type="text"
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-blue-500/50 transition-all font-bold placeholder:font-normal placeholder:text-gray-600"
                                    placeholder="e.g. Lead Strength Coach"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Specialization</label>
                                <input
                                    type="text"
                                    value={formData.specialization}
                                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-blue-500/50 transition-all font-bold placeholder:font-normal placeholder:text-gray-600"
                                    placeholder="e.g. Powerlifting, CrossFit"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Exp. Required (YRS)</label>
                                <input
                                    type="number"
                                    value={formData.experience}
                                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-blue-500/50 transition-all font-bold"
                                    placeholder="2+"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Employment Type</label>
                                <div className="bg-white/5 p-1 rounded-2xl flex h-[60px] relative">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, type: 'full-time' })}
                                        className={`flex-1 rounded-xl text-xs font-black uppercase tracking-widest transition-all z-10 ${formData.type === 'full-time' ? 'text-white bg-blue-600 shadow-lg' : 'text-gray-500 hover:text-white'}`}
                                    >
                                        Full-Time
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, type: 'part-time' })}
                                        className={`flex-1 rounded-xl text-xs font-black uppercase tracking-widest transition-all z-10 ${formData.type === 'part-time' ? 'text-white bg-blue-600 shadow-lg' : 'text-gray-500 hover:text-white'}`}
                                    >
                                        Part-Time
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Salary / Rate (MONTH)</label>
                                <input
                                    type="text"
                                    value={formData.salary}
                                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-blue-500/50 transition-all font-bold placeholder:font-normal placeholder:text-gray-600"
                                    placeholder="₹50,000 – ₹70,000"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Working Hours / Week</label>
                                <input
                                    type="text"
                                    value={formData.hours}
                                    onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-blue-500/50 transition-all font-bold"
                                    placeholder="e.g. 40 hrs (Flexible)"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Benefits</label>
                            <textarea
                                value={formData.benefits}
                                onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-[2rem] px-6 py-5 text-white focus:outline-none focus:border-blue-500/50 transition-all font-bold min-h-[120px] placeholder:font-normal placeholder:text-gray-600"
                                placeholder="Free membership, Medical, PF, Quarterly bonuses..."
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Detailed Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-[2rem] px-6 py-5 text-white focus:outline-none focus:border-blue-500/50 transition-all font-bold min-h-[160px] placeholder:font-normal placeholder:text-gray-600"
                                placeholder="Outline responsibilities, certifications required, and gym culture..."
                            />
                        </div>

                        <Button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-8 rounded-2xl shadow-xl shadow-blue-600/20 text-xl transition-all hover:-translate-y-1">
                            Publish Hiring Opportunity
                        </Button>
                    </form>
                </div>

                {/* Preview Section */}
                <div className="lg:sticky lg:top-8 h-fit space-y-6">
                    <div className="flex items-center gap-2 mb-4 ml-2">
                        <Sparkles className="text-amber-400" size={18} />
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">Live Preview</h3>
                    </div>

                    <div className="bg-gradient-to-br from-white/10 to-transparent backdrop-blur-2xl border border-white/10 rounded-[3rem] p-10 shadow-2xl overflow-hidden relative group">
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/10 rounded-full blur-[80px] group-hover:bg-blue-500/20 transition-colors" />

                        <div className="relative mb-10">
                            <div className="bg-blue-600/20 text-blue-400 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full border border-blue-500/20 w-fit mb-6">
                                Hiring Now • {formData.type === 'full-time' ? 'Full-Time' : 'Part-Time'}
                            </div>
                            <h3 className="text-4xl font-black text-white tracking-tighter leading-none mb-4 group-hover:text-blue-400 transition-colors">
                                {formData.role || "Lead Fitness Coach"}
                            </h3>
                            <div className="flex items-center gap-2 text-gray-400 font-bold italic">
                                <Plus size={16} /> {formData.specialization || "General Fitness & HIIT"}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6 mb-10">
                            <div className="bg-white/5 p-6 rounded-3xl border border-white/5 hover:border-white/10 transition-colors">
                                <IndianRupee size={20} className="text-emerald-400 mb-3" />
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Expected Pay</p>
                                <p className="text-lg font-black text-white">{formData.salary || "Competitive"}</p>
                            </div>
                            <div className="bg-white/5 p-6 rounded-3xl border border-white/5 hover:border-white/10 transition-colors">
                                <Star size={20} className="text-amber-400 mb-3" />
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Experience</p>
                                <p className="text-lg font-black text-white">{formData.experience ? `${formData.experience}+ Years` : "Freshers Welcome"}</p>
                            </div>
                        </div>

                        <div className="space-y-8 mb-10">
                            <div>
                                <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-blue-400 mb-4">
                                    <ShieldCheck size={16} /> Included Benefits
                                </h4>
                                <p className="text-gray-300 font-medium leading-relaxed pr-10">
                                    {formData.benefits || "Health insurance, Paid leave, Free gym access for family, and Career growth opportunities."}
                                </p>
                            </div>
                            <div>
                                <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-blue-400 mb-4">
                                    <Briefcase size={16} /> Job Overview
                                </h4>
                                <p className="text-gray-300 font-medium leading-relaxed pr-10 line-clamp-4">
                                    {formData.description || "Join NYC's fastest growing fitness community. We're looking for passionate coaches who want to make a real impact on people's lives through science-backed training methods."}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-8 border-t border-white/10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-600/20 border border-blue-500/20 flex items-center justify-center">
                                    <Clock size={16} className="text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Frequency</p>
                                    <p className="text-sm font-black text-white">{formData.hours || "40 hrs / wk"}</p>
                                </div>
                            </div>
                            <Button className="bg-white/10 hover:bg-white/20 text-white font-black px-8 h-12 rounded-xl border border-white/10 group-hover:bg-blue-600 group-hover:border-blue-500 transition-all">
                                Apply Now
                            </Button>
                        </div>
                    </div>
                </div>
            </div >
        </GymPageLayout >
    );
}
