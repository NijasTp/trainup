import { useEffect, useState } from 'react';
import {
    LiveKitRoom,
    useTracks,
    type TrackReference,
    RoomAudioRenderer,
    useRoomContext,
    useLocalParticipant,
    useRemoteParticipants,
    VideoTrack,
} from '@livekit/components-react';
import { Track } from 'livekit-client';
import { Button } from "@/components/ui/button";
import {
    Video,
    VideoOff,
    Mic,
    MicOff,
    PhoneOff,
    Users,
    AlertCircle,
    Loader2,
    User as UserIcon,
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogPortal
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import API from "@/lib/axios";
import { useSelector } from 'react-redux';
import { type RootState } from '@/redux/store';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from "@/lib/utils";

interface VideoCallProps {
    roomId: string;
    onLeave: () => void;
}

export default function VideoCall({ roomId, onLeave }: VideoCallProps) {
    const [token, setToken] = useState<string | null>(null);
    const [isLoadingToken, setIsLoadingToken] = useState(true);

    useEffect(() => {
        const fetchToken = async () => {
            try {
                const response = await API.get(`/video-call/token/${roomId}`);
                setToken(response.data.token);
            } catch (err) {
                toast.error("Failed to authenticate video session");
                onLeave();
            } finally {
                setIsLoadingToken(false);
            }
        };
        fetchToken();
    }, [roomId, onLeave]);

    if (isLoadingToken) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white font-outfit">
                <Loader2 className="w-12 h-12 text-white/20 animate-spin mb-4" />
                <p className="text-xs font-black uppercase tracking-[0.3em] opacity-40">Authenticating...</p>
            </div>
        );
    }

    if (!token) return null;

    return (
        <LiveKitRoom
            video={true}
            audio={true}
            token={token}
            serverUrl={import.meta.env.VITE_LIVEKIT_URL}
            onDisconnected={onLeave}
            className="h-screen w-full"
        >
            <VideoCallUI roomId={roomId} onLeave={onLeave} />
        </LiveKitRoom>
    );
}

function VideoCallUI({ roomId, onLeave }: { roomId: string, onLeave: () => void }) {
    const isTrainer = useSelector((state: RootState) => state.trainerAuth.isAuthenticated);
    const room = useRoomContext();
    const { localParticipant } = useLocalParticipant();
    const remoteParticipants = useRemoteParticipants();
    
    // UI State
    const [callDuration, setCallDuration] = useState(0);
    const [isSessionOver, setIsSessionOver] = useState(false);
    const [scheduledEndTime, setScheduledEndTime] = useState<Date | null>(null);
    const [actualStartTime, setActualStartTime] = useState<Date | null>(null);

    const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
    const [rating, setRating] = useState(0);
    const [feedback, setFeedback] = useState("");
    const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
    
    // Permission state
    const [mediaError, setMediaError] = useState<{ type: 'audio' | 'video' | 'both', message: string } | null>(null);

    // Sync timer on mount
    useEffect(() => {
        const syncData = async () => {
            try {
                const response = await API.get(`/video-call/room/${roomId}`);
                const vc = response.data.videoCall;
                if (vc.actualStartTime) setActualStartTime(new Date(vc.actualStartTime));
                if (vc.scheduledEndTime) setScheduledEndTime(new Date(vc.scheduledEndTime));
                
                // If we are joining an active room, tell the server
                const joinResponse = await API.post(`/video-call/room/${roomId}/join`);
                const joinedVc = joinResponse.data.videoCall;
                if (joinedVc && joinedVc.actualStartTime) {
                    setActualStartTime(new Date(joinedVc.actualStartTime));
                }
                if (joinedVc && joinedVc.scheduledEndTime) {
                    setScheduledEndTime(new Date(joinedVc.scheduledEndTime));
                }
            } catch (err) {
                console.error("Sync failed", err);
            }
        };
        syncData();
    }, [roomId]);

    // Timer Loop
    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            if (actualStartTime) {
                setCallDuration(Math.floor((now.getTime() - actualStartTime.getTime()) / 1000));
            }
            if (scheduledEndTime && now >= scheduledEndTime) {
                setIsSessionOver(true);
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [actualStartTime, scheduledEndTime]);

    const formatDuration = (s: number) => {
        const m = Math.floor(s / 60);
        return `${m.toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
    };

    const handleEndCall = async () => {
        if (isTrainer) {
            setIsFeedbackModalOpen(true);
        } else {
            await room.disconnect();
            onLeave();
        }
    };

    // Media Controls
    const toggleVideo = async () => {
        try {
            const isEnabled = localParticipant.isCameraEnabled;
            await localParticipant.setCameraEnabled(!isEnabled);
            setMediaError(prev => prev?.type === 'video' ? null : prev);
        } catch (err: any) {
            console.error("Video toggle failed", err);
            setMediaError({ type: 'video', message: "Camera access denied" });
            toast.error("Could not access camera");
        }
    };

    const toggleAudio = async () => {
        try {
            const isEnabled = localParticipant.isMicrophoneEnabled;
            await localParticipant.setMicrophoneEnabled(!isEnabled);
            setMediaError(prev => prev?.type === 'audio' ? null : prev);
        } catch (err: any) {
            console.error("Audio toggle failed", err);
            setMediaError({ type: 'audio', message: "Microphone access denied" });
            toast.error("Could not access microphone");
        }
    };

    // Tracks
    const tracks = useTracks(
        [
            { source: Track.Source.Camera, withPlaceholder: false },
            { source: Track.Source.ScreenShare, withPlaceholder: false },
        ],
        { onlySubscribed: false },
    );

    const remoteTracks = tracks.filter(t => t.participant !== localParticipant) as TrackReference[];
    const localTrack = tracks.find(t => t.participant === localParticipant) as TrackReference | undefined;

    return (
        <div className="relative w-full h-screen bg-[#020202] overflow-hidden flex flex-col font-outfit text-white">
            <RoomAudioRenderer />

            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-50 p-8 flex items-center justify-between pointer-events-none">
                <div className="flex items-center gap-4 pointer-events-auto">
                    <div className="flex items-center gap-3 px-6 py-3 bg-black/40 backdrop-blur-3xl rounded-2xl border border-white/10">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Live</span>
                        <div className="h-4 w-[1px] bg-white/10 mx-2" />
                        <span className="text-sm font-bold font-mono text-white/90">{formatDuration(callDuration)}</span>
                    </div>
                    <div className="flex items-center gap-3 px-6 py-3 bg-black/40 backdrop-blur-3xl rounded-2xl border border-white/10">
                        <Users className="w-4 h-4 text-white/40" />
                        <span className="text-sm font-black text-white/90">{remoteParticipants.length + 1}</span>
                    </div>
                </div>
            </div>

            {/* Main Stage */}
            <div className="flex-1 relative bg-black">
                {remoteTracks.length > 0 ? (
                    <div className={cn(
                        "absolute inset-0 bg-[#050505]",
                        remoteTracks.length > 1 ? "grid grid-cols-2 gap-px" : "flex items-center justify-center"
                    )}>
                        {remoteTracks.map((track) => (
                            <div key={track.participant.sid} className="relative w-full h-full overflow-hidden flex items-center justify-center">
                                <VideoTrack 
                                    trackRef={track} 
                                    className="w-full h-full object-cover" 
                                />
                                <div className="absolute bottom-10 left-10 z-10">
                                    <div className="px-4 py-2 bg-black/40 backdrop-blur-xl rounded-full border border-white/10">
                                        <span className="text-xs font-black uppercase tracking-widest text-white/90">
                                            {track.participant.identity || track.participant.name}
                                        </span>
                                    </div>
                                </div>
                                {!track.participant.isCameraEnabled && (
                                    <div className="absolute inset-0 bg-[#080808] flex flex-col items-center justify-center space-y-6">
                                        <div className="w-32 h-32 rounded-[3.5rem] bg-white/[0.02] border border-white/5 flex items-center justify-center">
                                            <UserIcon className="w-12 h-12 text-white/5" />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/10">Camera Off</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <div className="w-40 h-40 rounded-[4rem] bg-white/[0.02] flex items-center justify-center mb-10 border border-white/5 animate-pulse">
                            <UserIcon className="w-16 h-16 text-white/5" />
                        </div>
                        <h3 className="text-3xl font-black text-white/10 uppercase tracking-[0.5em] italic">Connecting...</h3>
                    </div>
                )}
                
                {/* Media Error Notification */}
                <AnimatePresence>
                    {mediaError && (
                        <motion.div 
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -20, opacity: 0 }}
                            className="absolute top-32 left-1/2 -translate-x-1/2 z-[70] flex items-center gap-3 px-8 py-4 bg-red-500/10 backdrop-blur-3xl border border-red-500/20 rounded-[2rem] shadow-[0_20px_50px_rgba(239,68,68,0.2)]"
                        >
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                            <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">{mediaError.message}</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* PIP (Self View) */}
            <motion.div 
                drag 
                dragConstraints={{ left: -1000, right: 0, top: -800, bottom: 200 }}
                dragElastic={0.1}
                dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
                whileHover={{ scale: 1.02 }}
                className="absolute right-10 bottom-40 w-56 md:w-80 aspect-video bg-[#0a0a0a] rounded-[2.5rem] overflow-hidden shadow-2xl border-2 border-white/10 z-50 cursor-move group"
                style={{ clipPath: "inset(0 round 2.5rem)" }}
            >
                {localParticipant.isCameraEnabled ? (
                    localTrack && (
                        <div className="w-full h-full relative">
                            <VideoTrack trackRef={localTrack} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-[2.5rem] pointer-events-none" />
                        </div>
                    )
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-[#050505] space-y-3">
                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
                            <VideoOff className="w-5 h-5 text-white/20" />
                        </div>
                        <span className="text-[8px] font-black uppercase tracking-widest text-white/20">Camera Off</span>
                    </div>
                )}
                {/* Visual Resize Indicator (Decorative since we don't have a library for it) */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-6 h-6 rounded-lg bg-black/40 backdrop-blur-xl flex items-center justify-center">
                        <Users className="w-3 h-3 text-white/40" />
                    </div>
                </div>
            </motion.div>

            {/* Controls */}
            <div className="absolute bottom-0 left-0 right-0 z-[60] p-12 flex justify-center bg-gradient-to-t from-black via-black/40 to-transparent">
                <div className="flex items-center gap-6 px-10 py-6 bg-white/5 backdrop-blur-3xl rounded-[3rem] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                    <Button
                        variant="ghost" size="icon"
                        className={cn(
                            "h-16 w-16 rounded-[1.8rem] border transition-all", 
                            (!localParticipant.isMicrophoneEnabled || mediaError?.type === 'audio') 
                                ? 'bg-red-500/20 border-red-500/40 text-red-500 hover:bg-red-500/30' 
                                : 'bg-white/5 border-white/5 hover:bg-white/10 text-white'
                        )}
                        onClick={toggleAudio}
                    >
                        {localParticipant.isMicrophoneEnabled && mediaError?.type !== 'audio' ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
                    </Button>

                    <Button
                        variant="destructive" size="icon"
                        className="h-24 w-24 rounded-[2.5rem] bg-red-600 hover:bg-red-700 shadow-2xl transition-all hover:scale-110 active:scale-95"
                        onClick={handleEndCall}
                    >
                        <PhoneOff className="w-8 h-8" />
                    </Button>

                    <Button
                        variant="ghost" size="icon"
                        className={cn(
                            "h-16 w-16 rounded-[1.8rem] border transition-all", 
                            (!localParticipant.isCameraEnabled || mediaError?.type === 'video') 
                                ? 'bg-red-500/20 border-red-500/40 text-red-500 hover:bg-red-500/30' 
                                : 'bg-white/5 border-white/5 hover:bg-white/10 text-white'
                        )}
                        onClick={toggleVideo}
                    >
                        {localParticipant.isCameraEnabled && mediaError?.type !== 'video' ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
                    </Button>
                </div>
            </div>

            {/* Session Over Overlay */}
            <AnimatePresence>
                {isSessionOver && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="absolute inset-0 z-[200] bg-black/90 backdrop-blur-3xl flex flex-col items-center justify-center text-center p-8"
                    >
                        <div className="w-24 h-24 rounded-full bg-red-500/10 flex items-center justify-center mb-8 border border-red-500/20">
                            <AlertCircle className="w-10 h-10 text-red-500" />
                        </div>
                        <h2 className="text-5xl font-black italic uppercase tracking-tighter mb-4 text-white">Session Ended.</h2>
                        <p className="text-neutral-500 text-lg max-w-md mb-12">The scheduled training window has concluded.</p>
                        <Button 
                            onClick={handleEndCall}
                            className="h-20 px-16 rounded-3xl bg-white text-black font-black uppercase tracking-widest text-sm hover:bg-neutral-200 transition-all shadow-[0_20px_50px_rgba(255,255,255,0.1)]"
                        >
                            {isTrainer ? "Complete Summary" : "Exit Session"}
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Feedback Modal */}
            <Dialog open={isFeedbackModalOpen} onOpenChange={setIsFeedbackModalOpen}>
                <DialogPortal>
                    <DialogContent className="z-[1000] bg-[#080808] border-white/10 text-white max-w-xl rounded-[3rem] p-12 shadow-[0_50px_100px_rgba(0,0,0,1)]">
                        <DialogHeader className="space-y-4">
                            <DialogTitle className="text-4xl font-black tracking-tighter italic uppercase">Session Summary.</DialogTitle>
                            <DialogDescription className="text-neutral-500 text-lg italic">Provide feedback for your client.</DialogDescription>
                        </DialogHeader>

                        <div className="space-y-12 py-10">
                            <div className="space-y-6">
                                <label className="text-[10px] font-black uppercase text-neutral-600 tracking-widest">Rating (1-10)</label>
                                <div className="grid grid-cols-5 gap-3">
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                                        <button
                                            key={num} onClick={() => setRating(num)}
                                            className={cn("h-14 rounded-2xl font-black transition-all", rating === num ? 'bg-white text-black scale-105' : 'text-neutral-600 hover:text-white hover:bg-white/5')}
                                        >
                                            {num}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase text-neutral-600 tracking-widest">Detailed Observations</label>
                                <Textarea
                                    placeholder="Corrections, highlights, goals..."
                                    value={feedback} onChange={(e) => setFeedback(e.target.value)}
                                    className="bg-white/[0.03] border-white/5 min-h-[160px] rounded-[2rem] p-6 focus:ring-1 focus:ring-white/10"
                                />
                            </div>
                        </div>

                        <DialogFooter className="gap-4">
                            <Button variant="ghost" onClick={async () => { await room.disconnect(); onLeave(); }} className="h-16 px-10 rounded-2xl text-neutral-600 font-bold">Skip</Button>
                            <Button 
                                onClick={async () => {
                                    if (rating === 0) return toast.error("Rating required");
                                    setIsSubmittingFeedback(true);
                                    try {
                                        await API.post(`/video-call/room/${roomId}/feedback`, { rating, feedback });
                                        toast.success("Session Completed.");
                                        await room.disconnect();
                                        onLeave();
                                    } catch (e) { toast.error("Submission failed"); }
                                    finally { setIsSubmittingFeedback(false); }
                                }}
                                disabled={isSubmittingFeedback || rating === 0}
                                className="h-16 px-12 rounded-2xl bg-white text-black font-black uppercase flex-1"
                            >
                                {isSubmittingFeedback ? <Loader2 className="animate-spin" /> : "Finish Session"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </DialogPortal>
            </Dialog>
        </div>
    );
}
