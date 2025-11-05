import React, { useEffect, useMemo, useState } from 'react';
import { listSubscriptionPlans, updateSubscriptionPlan, deleteSubscriptionPlan } from '@/services/gymService';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { toast } from 'react-toastify';

interface Plan {
  _id: string;
  name: string;
  duration: number;
  durationUnit: string;
  price: number;
  description?: string;
  features?: string[];
  isActive: boolean;
}

const GymSubscriptionList: React.FC = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [active, setActive] = useState<'all' | 'true' | 'false'>('all');

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit]);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res = await listSubscriptionPlans({ page, limit, search, active: active === 'all' ? '' : active });
      setPlans(res.items || res.plans || []);
      setTotal(res.total || 0);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to load plans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, search, active]);

  const handleToggleActive = async (plan: Plan) => {
    try {
      await updateSubscriptionPlan(plan._id, { isActive: !plan.isActive });
      toast.success('Plan updated');
      fetchPlans();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Update failed');
    }
  };

  const handleDelete = async (planId: string) => {
    if (!confirm('Delete this plan?')) return;
    try {
      await deleteSubscriptionPlan(planId);
      toast.success('Plan deleted');
      fetchPlans();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-5xl mx-auto bg-gray-800 rounded-2xl shadow-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-white">Subscription Plans</h1>
          <button onClick={() => navigate(ROUTES.GYM_SUBSCRIPTIONS_NEW)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">New Plan</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <input
            placeholder="Search plans..."
            className="bg-gray-700 text-white p-2 rounded-md border border-gray-600"
            value={search}
            onChange={(e) => { setPage(1); setSearch(e.target.value); }}
          />
          <select className="bg-gray-700 text-white p-2 rounded-md border border-gray-600" value={active} onChange={(e) => { setPage(1); setActive(e.target.value as any); }}>
            <option value="all">All</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
          <select className="bg-gray-700 text-white p-2 rounded-md border border-gray-600" value={limit} onChange={(e) => { setPage(1); setLimit(Number(e.target.value)); }}>
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-gray-300">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="py-2">Name</th>
                <th className="py-2">Duration</th>
                <th className="py-2">Price</th>
                <th className="py-2">Active</th>
                <th className="py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td className="py-6" colSpan={5}>Loading...</td></tr>
              ) : plans.length === 0 ? (
                <tr><td className="py-6" colSpan={5}>No plans found</td></tr>
              ) : (
                plans.map(plan => (
                  <tr key={plan._id} className="border-b border-gray-800">
                    <td className="py-2">{plan.name}</td>
                    <td className="py-2">{plan.duration} {plan.durationUnit}</td>
                    <td className="py-2">${plan.price.toFixed(2)}</td>
                    <td className="py-2">
                      <button onClick={() => handleToggleActive(plan)} className={plan.isActive ? 'text-green-400' : 'text-gray-400'}>
                        {plan.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="py-2 text-right space-x-2">
                      <button onClick={() => navigate(`${ROUTES.GYM_SUBSCRIPTIONS}/edit/${plan._id}`)} className="text-blue-400 hover:underline">Edit</button>
                      <button onClick={() => handleDelete(plan._id)} className="text-red-400 hover:underline">Delete</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between mt-4">
          <span className="text-gray-400 text-sm">Page {page} of {totalPages}</span>
          <div className="space-x-2">
            <button disabled={page<=1} onClick={() => setPage(p => Math.max(1, p-1))} className="bg-gray-700 disabled:opacity-50 text-white px-3 py-1 rounded-md">Prev</button>
            <button disabled={page>=totalPages} onClick={() => setPage(p => Math.min(totalPages, p+1))} className="bg-gray-700 disabled:opacity-50 text-white px-3 py-1 rounded-md">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GymSubscriptionList;


