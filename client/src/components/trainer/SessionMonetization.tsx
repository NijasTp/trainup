import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Zap, 
  Plus, 
  Trash2, 
  Save, 
  Info,
  DollarSign,
  Layers,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { updateSessionBundles, getTrainerDetails } from '@/services/trainerService';
import { motion, AnimatePresence } from 'framer-motion';

interface SessionBundle {
  sessions: number;
  price: number;
}

export const SessionMonetization: React.FC = () => {
  const [bundles, setBundles] = useState<SessionBundle[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBundles();
  }, []);

  const fetchBundles = async () => {
    try {
      const data = await getTrainerDetails();
      if (data.trainer?.sessionBundles) {
        setBundles(data.trainer.sessionBundles);
      }
    } catch (errorVal) { const error = errorVal as SafeAny;
      console.error('Failed to fetch bundles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addBundle = () => {
    if (bundles.length >= 5) {
      toast.error('Maximum 5 bundle tiers allowed');
      return;
    }
    setBundles([...bundles, { sessions: 1, price: 100 }]);
  };

  const removeBundle = (index: number) => {
    setBundles(bundles.filter((_, i) => i !== index));
  };

  const updateBundle = (index: number, field: keyof SessionBundle, value: number) => {
    const newBundles = [...bundles];
    newBundles[index] = { ...newBundles[index], [field]: value };
    setBundles(newBundles);
  };

  const handleSave = async () => {
    if (bundles.length === 0) {
      toast.error('Add at least one session bundle');
      return;
    }

    // Validation
    const invalid = bundles.some(b => b.sessions <= 0 || b.price <= 0);
    if (invalid) {
      toast.error('All values must be greater than zero');
      return;
    }

    setIsSaving(true);
    try {
      await updateSessionBundles(bundles);
      toast.success('Price packages updated');
    } catch (_error) {
      toast.error('Sync failed. Check connection.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return null;

  return (
    <Card className="bg-white/5 backdrop-blur-2xl border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
      <div className="p-8 md:p-10 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Zap size={20} />
              </div>
              <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">
                Session <span className="text-cyan-400">Monetization</span>
              </h2>
            </div>
            <p className="text-gray-500 font-bold uppercase tracking-[0.2em] text-[10px] italic ml-1">
              Configure video call credit bundles for your clients
            </p>
          </div>
          
          <Button 
            type="button"
            onClick={addBundle}
            variant="outline" 
            className="bg-cyan-500/10 border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20 rounded-xl h-12 px-6 font-black italic uppercase text-[10px] tracking-widest"
          >
            <Plus size={14} className="mr-2" /> Add Tier
          </Button>
        </div>

        {bundles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-6 bg-black/20 rounded-3xl border border-dashed border-white/10 text-center space-y-4">
            <div className="p-4 rounded-full bg-white/5 text-gray-500">
              <Layers size={32} />
            </div>
            <div className="space-y-1">
              <h3 className="text-white font-black italic uppercase text-sm">No Active Bundles</h3>
              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Enable session top-ups by adding your first price tier.</p>
            </div>
            <Button 
              type="button"
              onClick={addBundle} 
              className="bg-white/5 hover:bg-white/10 text-white rounded-xl h-10 px-6 font-black italic uppercase text-[10px]"
            >
              Add Packages
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence mode='popLayout'>
              {bundles.map((bundle, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="group relative flex flex-col md:flex-row items-center gap-4 p-5 bg-black/40 border border-white/5 rounded-2xl hover:border-cyan-500/30 transition-all"
                >
                  <div className="flex-1 w-full grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black text-gray-500 uppercase tracking-widest italic ml-1 flex items-center gap-1.5">
                        <CheckCircle2 size={10} className="text-cyan-500" /> Session Count
                      </Label>
                      <div className="relative">
                        <Input 
                          type="number" 
                          value={bundle.sessions}
                          onChange={(e) => updateBundle(index, 'sessions', parseInt(e.target.value) || 0)}
                          className="bg-white/5 border-white/10 h-14 rounded-xl text-white font-black italic pl-10 focus:ring-1 focus:ring-cyan-500/50" 
                        />
                        <Layers size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black text-gray-500 uppercase tracking-widest italic ml-1 flex items-center gap-1.5">
                        <DollarSign size={10} className="text-amber-500" /> Price (INR)
                      </Label>
                      <div className="relative">
                        <Input 
                          type="number" 
                          value={bundle.price}
                          onChange={(e) => updateBundle(index, 'price', parseInt(e.target.value) || 0)}
                          className="bg-white/5 border-white/10 h-14 rounded-xl text-white font-black italic pl-10 focus:ring-1 focus:ring-cyan-500/50" 
                        />
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600 font-bold">₹</span>
                      </div>
                    </div>
                  </div>

                  <Button 
                    type="button"
                    onClick={() => removeBundle(index)}
                    variant="ghost" 
                    className="md:mt-6 h-14 w-full md:w-14 rounded-xl text-rose-500/50 hover:text-rose-500 hover:bg-rose-500/10 transition-all"
                  >
                    <Trash2 size={20} />
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        <div className="flex flex-col md:flex-row items-center gap-6 pt-4">
          <div className="flex-1 flex items-start gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
              <Info size={16} />
            </div>
            <div className="space-y-1">
              <h4 className="text-white font-black italic uppercase text-[10px] tracking-wider">Important Info</h4>
              <p className="text-gray-500 text-[9px] font-medium leading-relaxed">
                Bundles allow users to purchase additional video call credits when their plan limit is reached. 
                A platform fee of 10% applies to all bundle transactions.
              </p>
            </div>
          </div>

          <Button 
            type="button"
            onClick={handleSave}
            disabled={isSaving || bundles.length === 0}
            className="w-full md:w-auto bg-cyan-500 hover:bg-cyan-400 text-black h-16 px-10 rounded-2xl font-black italic uppercase tracking-widest shadow-lg shadow-cyan-500/20 disabled:opacity-50"
          >
            {isSaving ? (
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                <Zap size={20} />
              </motion.div>
            ) : (
              <>
                <Save size={18} className="mr-2" /> Save Changes
              </>
            )}
          </Button>
        </div>

        {bundles.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl"
          >
            <AlertCircle size={14} className="text-amber-500" />
            <span className="text-amber-500 font-bold uppercase italic text-[9px] tracking-wider">
              Warning: Clients cannot purchase additional sessions until bundles are configured.
            </span>
          </motion.div>
        )}
      </div>
    </Card>
  );
};
