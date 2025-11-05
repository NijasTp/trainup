import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getSubscriptionPlan, updateSubscriptionPlan } from '@/services/gymService';
import { toast } from 'react-toastify';

const GymEditSubscriptionPlan: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [duration, setDuration] = useState<number>(1);
  const [durationUnit, setDurationUnit] = useState<'day' | 'month' | 'year'>('month');
  const [price, setPrice] = useState<number>(0);
  const [description, setDescription] = useState('');
  const [features, setFeatures] = useState<string>('');
  const [isActive, setIsActive] = useState<boolean>(true);

  useEffect(() => {
    const fetchPlan = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const plan = await getSubscriptionPlan(id);
        setName(plan.name);
        setDuration(plan.duration);
        setDurationUnit(plan.durationUnit);
        setPrice(plan.price);
        setDescription(plan.description || '');
        setFeatures((plan.features || []).join('\n'));
        setIsActive(plan.isActive);
      } catch (err: any) {
        toast.error(err?.response?.data?.message || 'Failed to load plan');
      } finally {
        setLoading(false);
      }
    };
    fetchPlan();
  }, [id]);

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSaving(true);
    try {
      await updateSubscriptionPlan(id, {
        name,
        duration,
        durationUnit,
        price,
        description,
        features: features.split('\n').map(s => s.trim()).filter(Boolean),
        isActive,
      });
      toast.success('Plan updated');
      navigate('/gym/subscriptions');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update plan');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6 flex items-center justify-center">
      <div className="w-full max-w-2xl bg-gray-800 rounded-2xl shadow-2xl p-6">
        <h1 className="text-2xl font-bold text-white mb-4">Edit Subscription Plan</h1>
        <form onSubmit={onSave} className="space-y-4">
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
          <div className="flex items-center gap-2">
            <input id="active" type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} />
            <label htmlFor="active" className="text-gray-300">Active</label>
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md disabled:opacity-60">
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button type="button" onClick={() => navigate('/gym/subscriptions')} className="bg-gray-700 hover:bg-gray-600 text-white px-5 py-2 rounded-md">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GymEditSubscriptionPlan;


