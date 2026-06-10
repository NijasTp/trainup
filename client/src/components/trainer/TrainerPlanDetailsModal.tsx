import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Calendar, MessageSquare, Video, Info } from 'lucide-react';

interface TrainerPlanDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const TrainerPlanDetailsModal: React.FC<TrainerPlanDetailsModalProps> = ({ isOpen, onClose }) => {
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="bg-black/95 backdrop-blur-2xl border-white/10 text-white rounded-[2rem] max-w-lg p-6 md:p-8">
                <DialogHeader className="space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                            <Info size={20} />
                        </div>
                        <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter text-white">
                            Plan <span className="text-cyan-400">Explanations</span>
                        </DialogTitle>
                    </div>
                    <DialogDescription className="text-gray-500 font-bold uppercase italic text-[10px] tracking-widest">
                        Understanding what each pricing tier offers to your clients
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 mt-6">
                    {/* Standard Plan */}
                    <div className="p-5 bg-white/5 rounded-2xl border border-white/5 space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-black uppercase tracking-widest text-white">Standard Plan</span>
                            <span className="text-[10px] font-black uppercase bg-[#176B87]/20 text-cyan-400 border border-[#176B87]/30 px-2 py-0.5 rounded-md">Basic Tier</span>
                        </div>
                        <div className="flex items-start gap-3 mt-3">
                            <div className="p-2 bg-cyan-500/10 rounded-xl text-cyan-400 shrink-0 mt-0.5">
                                <Calendar size={14} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-300">Workout Assigning Only</p>
                                <p className="text-[11px] text-gray-500 mt-1">Clients get custom-tailored workout protocols and scheduled routines assigned to their profile. Communication features are locked.</p>
                            </div>
                        </div>
                    </div>

                    {/* Premium Plan */}
                    <div className="p-5 bg-white/5 rounded-2xl border border-white/5 space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-black uppercase tracking-widest text-white">Premium Plan</span>
                            <span className="text-[10px] font-black uppercase bg-purple-500/20 text-purple-400 border border-purple-500/30 px-2 py-0.5 rounded-md">Standard Tier</span>
                        </div>
                        <div className="flex items-start gap-3 mt-3">
                            <div className="p-2 bg-purple-500/10 rounded-xl text-purple-400 shrink-0 mt-0.5">
                                <MessageSquare size={14} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-300">Chat Messaging & Workouts</p>
                                <p className="text-[11px] text-gray-500 mt-1">Clients unlock direct in-app text messaging access with you to ask questions, check progress, and seek guidance alongside custom workouts.</p>
                            </div>
                        </div>
                    </div>

                    {/* Pro Plan */}
                    <div className="p-5 bg-white/5 rounded-2xl border border-white/5 space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-black uppercase tracking-widest text-white">Pro Plan</span>
                            <span className="text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-md">Ultimate Tier</span>
                        </div>
                        <div className="flex items-start gap-3 mt-3">
                            <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400 shrink-0 mt-0.5">
                                <Video size={14} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-300">Video Calls, Chat & Workouts</p>
                                <p className="text-[11px] text-gray-500 mt-1">Unlock live 1-on-1 video training calls, unlimited text messaging, and priority workout scheduling for elite coaching.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
