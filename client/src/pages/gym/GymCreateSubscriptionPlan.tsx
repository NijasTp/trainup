import React, { useState } from 'react';
import { createSubscriptionPlan } from '@/services/gymService';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const GymCreateSubscriptionPlan: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [duration, setDuration] = useState<number>(1);
  const [durationUnit, setDurationUnit] = useState<'day' | 'month' | 'year'>('month');
  const [price, setPrice] = useState<number>(0);
  const [description, setDescription] = useState('');
  const [features, setFeatures] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createSubscriptionPlan({
        name,
        duration,
        durationUnit,
        price,
        description,
        features: features
          .split('\n')
          .map(f => f.trim())
          .filter(Boolean),
      });
      toast.success('Subscription plan created');
      navigate('/gym/subscriptions');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to create plan');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6 flex items-center justify-center">
      <div className="w-full max-w-2xl bg-gray-800 rounded-2xl shadow-2xl p-6">
        <h1 className="text-2xl font-bold text-white mb-4">Create Subscription Plan</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Name</label>
            <input className="w-full bg-gray-700 text-white p-2 rounded-md border border-gray-600" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Duration</label>
              <input type="number" min={1} className="w-full bg-gray-700 text-white p-2 rounded-md border border-gray-600" value={duration} onChange={e => setDuration(Number(e.target.value))} />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Unit</label>
              <select className="w-full bg-gray-700 text-white p-2 rounded-md border border-gray-600" value={durationUnit} onChange={e => setDurationUnit(e.target.value as any)}>
                <option value="day">Day</option>
                <option value="month">Month</option>
                <option value="year">Year</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Price</label>
              <input type="number" min={0} step="0.01" className="w-full bg-gray-700 text-white p-2 rounded-md border border-gray-600" value={price} onChange={e => setPrice(Number(e.target.value))} />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Description</label>
            <textarea className="w-full bg-gray-700 text-white p-2 rounded-md border border-gray-600" value={description} onChange={e => setDescription(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Features (one per line)</label>
            <textarea className="w-full bg-gray-700 text-white p-2 rounded-md border border-gray-600" value={features} onChange={e => setFeatures(e.target.value)} />
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md disabled:opacity-60">
              {loading ? 'Saving...' : 'Create'}
            </button>
            <button type="button" onClick={() => navigate('/gym/subscriptions')} className="bg-gray-700 hover:bg-gray-600 text-white px-5 py-2 rounded-md">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GymCreateSubscriptionPlan;


