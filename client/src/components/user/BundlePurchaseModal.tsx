import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogPortal
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  Zap, 
  Layers, 
  CreditCard, 
  ChevronRight,
  ShieldCheck,
  Video,
  X,
  Loader2,
  Sparkles
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import API from "@/lib/axios";
import { API_ROUTES } from "@/constants/api.constants";
import { toast } from "sonner";

interface Bundle {
  sessions: number;
  price: number;
}

interface BundlePurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  trainerId: string;
  trainerName: string;
  bundles: Bundle[];
}

export const BundlePurchaseModal: React.FC<BundlePurchaseModalProps> = ({
  isOpen,
  onClose,
  trainerId,
  trainerName,
  bundles
}) => {
  const [selectedBundle, setSelectedBundle] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePurchase = async () => {
    if (selectedBundle === null) return;
    
    setIsProcessing(true);
    try {
      const bundle = bundles[selectedBundle];
      const response = await API.post(API_ROUTES.PAYMENT.BUNDLE_CHECKOUT, {
        trainerId,
        sessions: bundle.sessions,
        amount: bundle.price
      });

      if (response.data.url) {
        window.location.href = response.data.url;
      } else {
        throw new Error("Stripe session URL not found");
      }
    } catch (err: any) {
      console.error("Purchase error:", err);
      toast.error(err.response?.data?.message || "Payment initialization failed");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogPortal>
        <DialogContent className="z-[1000] bg-[#050505] border-white/5 text-white max-w-2xl rounded-[3rem] p-0 overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,1)] font-outfit">
          <div className="relative">
            {/* Decorative Background */}
            <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-cyan-500/10 to-transparent pointer-events-none" />
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-cyan-500/5 blur-[100px] rounded-full" />
            
            <button 
              onClick={onClose}
              className="absolute top-8 right-8 z-10 w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all group"
            >
              <X size={20} className="text-neutral-500 group-hover:text-white group-hover:rotate-90 transition-all" />
            </button>

            <div className="p-12 space-y-10">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full">
                  <Zap size={14} className="text-cyan-400" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400">Upgrade Protocol</span>
                </div>
                <div className="space-y-2">
                  <DialogTitle className="text-5xl font-black tracking-tighter uppercase italic leading-none">
                    Session <span className="text-cyan-500">Stacks.</span>
                  </DialogTitle>
                  <DialogDescription className="text-neutral-500 text-lg font-medium leading-relaxed italic">
                    Acquire high-performance video call credits with {trainerName}.
                  </DialogDescription>
                </div>
              </div>

              {bundles.length === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center text-center space-y-6 bg-white/[0.02] rounded-[2.5rem] border border-dashed border-white/5">
                  <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center text-neutral-600">
                    <Sparkles size={32} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold uppercase italic">Bundles Offline</h3>
                    <p className="text-neutral-500 text-sm max-w-xs mx-auto">This trainer hasn't configured session stacks yet. Contact them to enable top-ups.</p>
                  </div>
                </div>
              ) : (
                <div className="grid gap-4">
                  {bundles.map((bundle, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => setSelectedBundle(index)}
                      className={cn(
                        "group relative flex items-center justify-between p-8 rounded-[2rem] border transition-all duration-500",
                        selectedBundle === index 
                          ? "bg-white border-white text-black shadow-[0_20px_50px_rgba(255,255,255,0.1)]" 
                          : "bg-white/[0.02] border-white/5 hover:border-white/20 text-white"
                      )}
                    >
                      <div className="flex items-center gap-6">
                        <div className={cn(
                          "w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500",
                          selectedBundle === index ? "bg-black text-white" : "bg-white/5 text-neutral-500"
                        )}>
                          <Layers size={24} />
                        </div>
                        <div className="text-left">
                          <p className={cn(
                            "text-[10px] font-black uppercase tracking-widest mb-1",
                            selectedBundle === index ? "text-neutral-500" : "text-neutral-600"
                          )}>Credit Package</p>
                          <h4 className="text-2xl font-black tracking-tight">{bundle.sessions} Sessions</h4>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={cn(
                          "text-[10px] font-black uppercase tracking-widest mb-1",
                          selectedBundle === index ? "text-neutral-500" : "text-neutral-600"
                        )}>Investment</p>
                        <h4 className="text-2xl font-black tracking-tight">₹{bundle.price}</h4>
                      </div>
                      
                      {selectedBundle === index && (
                        <motion.div 
                          layoutId="active-indicator"
                          className="absolute -left-2 top-1/2 -translate-y-1/2 w-1 h-12 bg-cyan-500 rounded-full"
                        />
                      )}
                    </motion.button>
                  ))}
                </div>
              )}

              <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500">
                      <ShieldCheck size={18} />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500 italic">Secure Bridge</p>
                      <p className="text-[9px] font-bold text-neutral-600 uppercase tracking-wider">End-to-end encrypted payment</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <CreditCard size={14} className="text-neutral-700" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-neutral-700">Stripe Matrix Active</span>
                  </div>
                </div>

                <Button 
                  onClick={handlePurchase}
                  disabled={selectedBundle === null || isProcessing}
                  className={cn(
                    "w-full h-20 rounded-[2rem] font-black uppercase tracking-[0.2em] text-sm transition-all duration-500",
                    selectedBundle !== null 
                      ? "bg-cyan-500 text-black hover:bg-cyan-400 shadow-[0_20px_50px_rgba(6,182,212,0.3)]" 
                      : "bg-white/5 text-neutral-700 cursor-not-allowed"
                  )}
                >
                  {isProcessing ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>Initialize Transaction <ChevronRight className="ml-4 h-5 w-5" /></>
                  )}
                </Button>
              </div>
              
              <div className="flex items-center justify-center gap-6 opacity-20 group grayscale hover:grayscale-0 transition-all">
                 <Video size={16} />
                 <Zap size={16} />
                 <Layers size={16} />
                 <Sparkles size={16} />
              </div>
            </div>
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
};
