import { useState } from 'react';

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
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Form */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 md:p-8 border border-gray-200 dark:border-gray-700">
                    <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Post Trainer Hiring</h1>

                    <form className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role / Position</label>
                            <input
                                type="text"
                                name="role"
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g. Strength Coach"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Specialization</label>
                            <input
                                type="text"
                                name="specialization"
                                value={formData.specialization}
                                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                placeholder="e.g. Powerlifting, Yoga, CrossFit"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Experience Required (years)</label>
                                <input
                                    type="number"
                                    name="experience"
                                    value={formData.experience}
                                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    placeholder="2+"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Working Hours / Week</label>
                                <input
                                    type="text"
                                    name="hours"
                                    value={formData.hours}
                                    onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    placeholder="e.g. 40 hrs (Mon-Sat)"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Salary / Rate</label>
                                <input
                                    type="text"
                                    name="salary"
                                    value={formData.salary}
                                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    placeholder="₹45,000 – ₹70,000 / month"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Employment Type</label>
                                <div className="flex gap-4 mt-2">
                                    <label className="flex items-center">
                                        <input type="radio" name="type" value="full-time" checked={formData.type === 'full-time'} onChange={() => setFormData({ ...formData, type: 'full-time' })} className="mr-2" />
                                        Full-time
                                    </label>
                                    <label className="flex items-center">
                                        <input type="radio" name="type" value="part-time" checked={formData.type === 'part-time'} onChange={() => setFormData({ ...formData, type: 'part-time' })} className="mr-2" />
                                        Part-time
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Benefits</label>
                            <textarea
                                name="benefits"
                                value={formData.benefits}
                                onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white h-24"
                                placeholder="PF, Health insurance, Free membership, Performance bonus..."
                            ></textarea>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Job Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white h-32"
                                placeholder="Write detailed responsibilities and requirements..."
                            ></textarea>
                        </div>

                        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition mt-4">
                            Publish Hiring Post
                        </button>
                    </form>
                </div>

                {/* Preview Card */}
                <div className="lg:sticky lg:top-8 h-fit">
                    <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Preview (as seen by trainers)</h2>
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{formData.role || "Personal Trainer / Strength Coach"}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{formData.specialization || "Specialization: Functional Training, HIIT"}</p>

                        <div className="mt-5 space-y-3 text-sm">
                            <p><strong>Type:</strong> {formData.type === 'full-time' ? 'Full-time' : 'Part-time'}</p>
                            <p><strong>Experience:</strong> {formData.experience || "2+ years"}</p>
                            <p><strong>Salary:</strong> {formData.salary || "₹50,000 – ₹80,000 / month"}</p>
                            <p><strong>Hours:</strong> {formData.hours || "42 hrs/week (flexible shifts)"}</p>
                        </div>

                        <div className="mt-6">
                            <h4 className="font-semibold text-gray-800 dark:text-gray-200">Benefits:</h4>
                            <p className="text-gray-600 dark:text-gray-300 mt-1">{formData.benefits || "Gym membership, Incentives, Training allowance..."}</p>
                        </div>

                        <div className="mt-6">
                            <h4 className="font-semibold text-gray-800 dark:text-gray-200">Description</h4>
                            <p className="text-gray-600 dark:text-gray-300 mt-1 line-clamp-4">{formData.description || "We are looking for a passionate trainer..."}</p>
                        </div>

                        <button className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium">
                            Apply Now
                        </button>
                    </div>
                </div>
            </div >
        </div >
    );
}