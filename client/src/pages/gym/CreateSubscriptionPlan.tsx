import { useState } from 'react';
import { Check, CheckCircle, IndianRupee, FileText } from 'lucide-react';

export default function CreateSubscriptionPlan() {
    const [features, setFeatures] = useState({
        gymAccess: true,
        cardioBox: true,
        trainer: false,
        steam: false,
        massage: false,
        diet: false,
        groupClasses: false
    });

    const [formData, setFormData] = useState({
        name: '',
        duration: '1',
        price: '',
        description: ''
    });

    const toggleFeature = (key: keyof typeof features) => {
        setFeatures(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Form Section */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 md:p-8 border border-gray-200 dark:border-gray-700">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Create Subscription Plan</h1>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Plan Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                placeholder="e.g. Gold Membership"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Duration (Months)</label>
                                <select
                                    value={formData.duration}
                                    onChange={e => setFormData({ ...formData, duration: e.target.value })}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                >
                                    <option value="1">1 Month</option>
                                    <option value="3">3 Months</option>
                                    <option value="6">6 Months</option>
                                    <option value="12">12 Months</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price (₹)</label>
                                <input
                                    type="number"
                                    value={formData.price}
                                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    placeholder="e.g. 4999"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                            <textarea
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white h-24"
                                placeholder="Briefly describe the plan benefits..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Included Features</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div
                                    onClick={() => toggleFeature('gymAccess')}
                                    className={`p-3 rounded-lg border cursor-pointer flex items-center gap-3 transition ${features.gymAccess ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                                >
                                    <div className={`w-5 h-5 rounded flex items-center justify-center border ${features.gymAccess ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-400'}`}>
                                        {features.gymAccess && <Check size={14} />}
                                    </div>
                                    <span className="text-sm font-medium dark:text-white">Gym Equipment Access</span>
                                </div>

                                <div
                                    onClick={() => toggleFeature('cardioBox')}
                                    className={`p-3 rounded-lg border cursor-pointer flex items-center gap-3 transition ${features.cardioBox ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                                >
                                    <div className={`w-5 h-5 rounded flex items-center justify-center border ${features.cardioBox ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-400'}`}>
                                        {features.cardioBox && <Check size={14} />}
                                    </div>
                                    <span className="text-sm font-medium dark:text-white">Cardio Zone</span>
                                </div>

                                <div
                                    onClick={() => toggleFeature('trainer')}
                                    className={`p-3 rounded-lg border cursor-pointer flex items-center gap-3 transition ${features.trainer ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                                >
                                    <div className={`w-5 h-5 rounded flex items-center justify-center border ${features.trainer ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-400'}`}>
                                        {features.trainer && <Check size={14} />}
                                    </div>
                                    <span className="text-sm font-medium dark:text-white">Personal Trainer</span>
                                </div>

                                <div
                                    onClick={() => toggleFeature('steam')}
                                    className={`p-3 rounded-lg border cursor-pointer flex items-center gap-3 transition ${features.steam ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                                >
                                    <div className={`w-5 h-5 rounded flex items-center justify-center border ${features.steam ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-400'}`}>
                                        {features.steam && <Check size={14} />}
                                    </div>
                                    <span className="text-sm font-medium dark:text-white">Steam Bath</span>
                                </div>

                                <div
                                    onClick={() => toggleFeature('massage')}
                                    className={`p-3 rounded-lg border cursor-pointer flex items-center gap-3 transition ${features.massage ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                                >
                                    <div className={`w-5 h-5 rounded flex items-center justify-center border ${features.massage ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-400'}`}>
                                        {features.massage && <Check size={14} />}
                                    </div>
                                    <span className="text-sm font-medium dark:text-white">Massage Therapy</span>
                                </div>
                            </div>
                        </div>

                        <button className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-lg shadow-lg shadow-blue-500/30 transition mt-4">
                            Create Plan
                        </button>
                    </div>
                </div>

                {/* Preview Section */}
                <div className="lg:sticky lg:top-8 h-fit">
                    <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Plan Preview</h2>

                    <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-cyan-500"></div>

                        <div className="p-8">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{formData.name || "Plan Name"}</h3>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{formData.duration} Month{formData.duration !== '1' ? 's' : ''} Membership</p>
                                </div>
                                {formData.duration === '12' && (
                                    <span className="bg-gradient-to-r from-amber-200 to-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">Best Value</span>
                                )}
                            </div>

                            <div className="flex items-baseline mb-6">
                                <span className="text-4xl font-extrabold text-gray-900 dark:text-white flex items-start">
                                    <IndianRupee size={24} className="mt-1.5" />
                                    {formData.price || "0"}
                                </span>
                                <span className="text-gray-500 dark:text-gray-400 ml-2">/ {formData.duration} mo</span>
                            </div>

                            <p className="text-gray-600 dark:text-gray-300 text-sm mb-6 leading-relaxed">
                                {formData.description || "Plan description will appear here..."}
                            </p>

                            <div className="space-y-3 mb-8">
                                <p className="font-semibold text-gray-900 dark:text-white text-sm uppercase tracking-wide">Included Features</p>
                                {Object.entries(features).map(([key, value]) => (
                                    value && (
                                        <div key={key} className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-200">
                                            <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
                                            <span>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
                                        </div>
                                    )
                                ))}
                                {!Object.values(features).some(v => v) && (
                                    <p className="text-sm text-gray-400 italic">No features selected</p>
                                )}
                            </div>

                            <button className="w-full py-3 rounded-lg font-bold bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:opacity-90 transition">
                                Subscribe Now
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
