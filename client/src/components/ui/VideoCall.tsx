import { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Video,
    VideoOff,
    Mic,
    MicOff,
    PhoneOff,
    Users,
    Clock,
    AlertCircle,
    Loader2,
    Star,
    MessageSquare,
    Signal,
    User as UserIcon
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import io, { Socket } from 'socket.io-client';
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
    const isTrainer = useSelector((state: RootState) => state.trainerAuth.isAuthenticated);
    const currentUser = useSelector((state: RootState) => 
        isTrainer ? state.trainerAuth.trainer : state.userAuth.user
    );
    
    // UI State
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);
    const [isAudioEnabled, setIsAudioEnabled] = useState(true);
    const [isCameraDenied, setIsCameraDenied] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [callDuration, setCallDuration] = useState(0);
    const [isRemoteUserConnected, setIsRemoteUserConnected] = useState(false);
    const [participantCount, setParticipantCount] = useState(1);
    
    // Feedback State
    const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
    const [rating, setRating] = useState(0);
    const [feedback, setFeedback] = useState("");
    const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

    // Refs
    const localVideoRef = useRef<HTMLVideoElement | null>(null);
    const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
    const socketRef = useRef<Socket | null>(null);
    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
    const localStreamRef = useRef<MediaStream | null>(null);
    const callStartTimeRef = useRef<Date | null>(null);
    
    // Perfect Negotiation State
    const makingOfferRef = useRef(false);
    const ignoreOfferRef = useRef(false);
    const isPoliteRef = useRef(false);
    const isInitializingRef = useRef(false);

    const rtcConfiguration = {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' },
            { urls: 'stun:stun3.l.google.com:19302' },
            { urls: 'stun:stun4.l.google.com:19302' },
        ],
        iceCandidatePoolSize: 10
    };

    // Timer Sync Logic
    const syncTimer = useCallback(async () => {
        try {
            const response = await API.get(`/video-call/room/${roomId}`);
            if (response.data.videoCall.actualStartTime) {
                const startTime = new Date(response.data.videoCall.actualStartTime);
                callStartTimeRef.current = startTime;
                setParticipantCount(response.data.activeParticipants || 1);
            }
        } catch (err) {
            console.error("Failed to sync timer with server", err);
        }
    }, [roomId]);

    useEffect(() => {
        if (!isInitializingRef.current) {
            initializeCall();
        }
        return () => {
            cleanup();
        };
    }, [roomId]);

    // Duration Update Loop
    useEffect(() => {
        const interval = setInterval(() => {
            if (callStartTimeRef.current) {
                const now = new Date();
                const diff = Math.floor((now.getTime() - callStartTimeRef.current.getTime()) / 1000);
                setCallDuration(diff > 0 ? diff : 0);
            }
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const initializeCall = async () => {
        if (isInitializingRef.current) return;
        isInitializingRef.current = true;

        try {
            setIsLoading(true);
            setError(null);

            // 1. Get User Media
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { 
                        width: { ideal: 1280, max: 1920 }, 
                        height: { ideal: 720, max: 1080 },
                        frameRate: { ideal: 30, max: 60 }
                    },
                    audio: {
                        echoCancellation: true,
                        noiseSuppression: true,
                        autoGainControl: true
                    }
                });
                localStreamRef.current = stream;
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                }
            } catch (mediaErr: any) {
                console.warn("Media access denied or device busy:", mediaErr);
                setIsCameraDenied(true);
                setIsVideoEnabled(false);
                if (mediaErr.name === 'NotReadableError' || mediaErr.name === 'TrackStartError') {
                    toast.error("Camera is already in use by another application or tab.");
                } else {
                    toast.error("Could not access camera/microphone. Please check permissions.");
                }
            }

            // 2. Initialize Socket
            if (!socketRef.current) {
                socketRef.current = io(import.meta.env.VITE_API_URL, {
                    withCredentials: true,
                    transports: ['websocket', 'polling'],
                    reconnection: true,
                    reconnectionAttempts: 5
                });

                socketRef.current.on('connect', () => {
                    setIsConnected(true);
                    socketRef.current?.emit('join_video_room', { roomId });
                    syncTimer();
                });

                socketRef.current.on('connect_error', () => {
                    setError('Signal lost. Attempting to reconnect...');
                    setIsLoading(false);
                });

                setupSocketListeners();
            }

            // 3. Register Join via API
            await API.post(`/video-call/room/${roomId}/join`);
            setIsLoading(false);
        } catch (err: any) {
            setError(err.message || 'System uplink failure');
            setIsLoading(false);
        }
    };

    const setupSocketListeners = () => {
        const socket = socketRef.current;
        if (!socket) return;

        socket.on('room_joined', ({ isInitiator }) => {
            isPoliteRef.current = !isInitiator;
            logger.info(`Joined as ${isInitiator ? 'Initiator' : 'Peer'} (Polite: ${isPoliteRef.current})`);
        });

        socket.on('user_joined', async () => {
            setIsRemoteUserConnected(true);
            toast.info("Participant joined the session");
            // Sync timer again when someone joins to ensure we have the correct startTime
            syncTimer();
            // If I'm the initiator, I'll wait for negotiationneeded to fire
        });

        socket.on('user_left', () => {
            setIsRemoteUserConnected(false);
            setRemoteStream(null);
            if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
            toast.warning("Participant left the session");
        });

        socket.on('participant_count_update', ({ count }) => {
            setParticipantCount(count);
        });

        socket.on('webrtc_offer', async ({ offer }) => {
            const pc = getOrCreatePeerConnection();
            try {
                const offerCollision = (makingOfferRef.current || pc.signalingState !== 'stable');
                ignoreOfferRef.current = !isPoliteRef.current && offerCollision;

                if (ignoreOfferRef.current) {
                    logger.info("Ignoring colliding offer as aggressive peer");
                    return;
                }

                if (offerCollision) {
                    await pc.setLocalDescription({ type: 'rollback' });
                }

                await pc.setRemoteDescription(new RTCSessionDescription(offer));
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                socket.emit('webrtc_answer', { roomId, answer });
            } catch (err) {
                console.error('Signal negotiation failed (Offer):', err);
            }
        });

        socket.on('webrtc_answer', async ({ answer }) => {
            const pc = peerConnectionRef.current;
            if (!pc) return;
            try {
                await pc.setRemoteDescription(new RTCSessionDescription(answer));
            } catch (err) {
                console.error('Signal negotiation failed (Answer):', err);
            }
        });

        socket.on('webrtc_ice_candidate', async ({ candidate }) => {
            const pc = peerConnectionRef.current;
            if (!pc) return;
            try {
                await pc.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (err) {
                // Ignore errors from late candidates
            }
        });
    };

    const getOrCreatePeerConnection = () => {
        if (peerConnectionRef.current) return peerConnectionRef.current;

        const pc = new RTCPeerConnection(rtcConfiguration);

        // Add local tracks
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => {
                pc.addTrack(track, localStreamRef.current!);
            });
        }

        pc.onnegotiationneeded = async () => {
            try {
                makingOfferRef.current = true;
                await pc.setLocalDescription();
                if (pc.localDescription) {
                    socketRef.current?.emit('webrtc_offer', {
                        roomId,
                        offer: pc.localDescription
                    });
                }
            } catch (err) {
                console.error('Negotiation failed:', err);
            } finally {
                makingOfferRef.current = false;
            }
        };

        pc.onicecandidate = ({ candidate }) => {
            if (candidate && socketRef.current) {
                socketRef.current.emit('webrtc_ice_candidate', { roomId, candidate });
            }
        };

        pc.ontrack = (event) => {
            logger.info("Remote track received");
            if (event.streams && event.streams[0]) {
                setRemoteStream(event.streams[0]);
                if (remoteVideoRef.current) {
                    remoteVideoRef.current.srcObject = event.streams[0];
                }
            }
        };

        pc.onconnectionstatechange = () => {
            logger.info(`Connection state: ${pc.connectionState}`);
            if (pc.connectionState === 'connected') {
                setIsRemoteUserConnected(true);
            } else if (['disconnected', 'failed', 'closed'].includes(pc.connectionState)) {
                setIsRemoteUserConnected(false);
            }
        };

        peerConnectionRef.current = pc;
        return pc;
    };

    const toggleVideo = () => {
        if (localStreamRef.current) {
            const track = localStreamRef.current.getVideoTracks()[0];
            if (track) {
                track.enabled = !track.enabled;
                setIsVideoEnabled(track.enabled);
            }
        }
    };

    const toggleAudio = () => {
        if (localStreamRef.current) {
            const track = localStreamRef.current.getAudioTracks()[0];
            if (track) {
                track.enabled = !track.enabled;
                setIsAudioEnabled(track.enabled);
            }
        }
    };

    const cleanup = async () => {
        try {
            await API.post(`/video-call/room/${roomId}/leave`);
        } catch (e) {}

        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop());
            localStreamRef.current = null;
        }

        if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
            peerConnectionRef.current = null;
        }

        if (socketRef.current) {
            socketRef.current.emit('leave_video_room', { roomId });
            socketRef.current.disconnect();
            socketRef.current = null;
        }

        isInitializingRef.current = false;
    };

    const handleEndCall = () => {
        if (isTrainer) {
            setIsFeedbackModalOpen(true);
        } else {
            cleanup();
            onLeave();
        }
    };

    const handleSubmitFeedback = async () => {
        if (rating === 0) {
            toast.error("A professional rating is required to close the session.");
            return;
        }

        try {
            setIsSubmittingFeedback(true);
            await API.post(`/video-call/room/${roomId}/feedback`, {
                rating,
                feedback
            });
            toast.success("Session concluded and feedback stored.");
            cleanup();
            onLeave();
        } catch (error) {
            toast.error("Failed to submit session evaluation.");
        } finally {
            setIsSubmittingFeedback(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-[#050505] text-white font-outfit">
                <motion.div 
                    animate={{ scale: [1, 1.1, 1], opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mb-8"
                >
                    <Signal className="w-8 h-8 text-white/20" />
                </motion.div>
                <h2 className="text-xl font-black tracking-widest uppercase opacity-20">Secure Uplink Initializing</h2>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-[#050505] text-white px-6 font-outfit">
                <div className="bg-red-500/5 p-12 rounded-[3rem] border border-red-500/10 text-center max-w-md backdrop-blur-3xl">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
                    <h2 className="text-3xl font-black mb-3 tracking-tighter">System Error</h2>
                    <p className="text-neutral-500 mb-10 leading-relaxed italic">{error}</p>
                    <Button variant="outline" onClick={onLeave} className="w-full h-16 rounded-3xl border-white/5 hover:bg-white/5 text-white font-black uppercase tracking-widest text-xs">Terminate Session</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="relative w-full h-screen bg-[#030303] overflow-hidden flex flex-col font-outfit selection:bg-white/10">
            
            {/* Session Metadata Overlay */}
            <div className="absolute top-0 left-0 right-0 z-50 p-8 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-between pointer-events-none">
                <div className="flex items-center gap-4 pointer-events-auto">
                    <div className="flex items-center gap-3 px-6 py-3 bg-white/5 backdrop-blur-3xl rounded-2xl border border-white/10">
                        <div className="relative flex items-center justify-center w-2 h-2">
                            <div className="absolute w-full h-full bg-red-500 rounded-full animate-ping opacity-75" />
                            <div className="w-2 h-2 bg-red-500 rounded-full" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">Live session</span>
                        <div className="h-4 w-[1px] bg-white/10 mx-2" />
                        <span className="text-sm font-bold font-mono text-white/90">{formatDuration(callDuration)}</span>
                    </div>
                    
                    <div className="flex items-center gap-3 px-6 py-3 bg-white/5 backdrop-blur-3xl rounded-2xl border border-white/10">
                        <Users className="w-4 h-4 text-white/40" />
                        <span className="text-sm font-black text-white/90">{participantCount}</span>
                    </div>
                </div>

                <div className="flex items-center gap-4 pointer-events-auto">
                    <Badge variant="outline" className="h-12 px-6 rounded-2xl border-white/5 bg-black/40 backdrop-blur-3xl text-neutral-500 font-bold tracking-tighter text-sm">
                        Room: {roomId}
                    </Badge>
                </div>
            </div>

            {/* Stage: Remote Participant */}
            <div className="flex-1 relative bg-black flex items-center justify-center">
                <AnimatePresence mode="wait">
                    {remoteStream ? (
                        <motion.video
                            key="remote-video"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            ref={remoteVideoRef}
                            autoPlay
                            playsInline
                            className="w-full h-full object-contain"
                        />
                    ) : (
                        <motion.div 
                            key="waiting-state"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center justify-center text-center px-6"
                        >
                            <div className="w-40 h-40 rounded-[3.5rem] bg-white/[0.02] flex items-center justify-center mb-10 relative">
                                <div className="absolute inset-0 rounded-[3.5rem] border border-white/5 animate-pulse" />
                                <UserIcon className="w-16 h-16 text-white/10" />
                            </div>
                            <h3 className="text-4xl font-black text-white/20 tracking-tighter italic">Awaiting participant...</h3>
                            <p className="text-[10px] text-white/5 mt-6 uppercase tracking-[0.3em] font-black">Connection status: Nominal</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* PIP: Local Participant */}
            <motion.div 
                drag
                dragConstraints={{ left: -1000, right: 0, top: 0, bottom: 500 }}
                className="absolute right-10 bottom-36 w-56 md:w-96 aspect-video bg-neutral-900 rounded-[2.5rem] overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.8)] border border-white/10 z-50 cursor-move group"
            >
                <video
                    ref={el => {
                        localVideoRef.current = el;
                        if (el && localStreamRef.current) el.srcObject = localStreamRef.current;
                    }}
                    autoPlay
                    playsInline
                    muted
                    className={cn(
                        "w-full h-full object-cover transform -scale-x-100 transition-all duration-700",
                        (!isVideoEnabled || isCameraDenied) ? 'opacity-0 scale-110' : 'opacity-100 scale-100'
                    )}
                />
                {(!isVideoEnabled || isCameraDenied) && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-900">
                        <VideoOff className="w-12 h-12 text-white/5" />
                        <span className="text-[10px] font-black text-white/10 uppercase tracking-widest mt-4">Camera Off</span>
                    </div>
                )}
                <div className="absolute bottom-5 left-5 flex items-center gap-3 bg-black/60 px-4 py-2 rounded-2xl backdrop-blur-3xl border border-white/10">
                    <div className={cn("w-2 h-2 rounded-full", (!isVideoEnabled || isCameraDenied) ? 'bg-red-500/50' : 'bg-green-500/50 animate-pulse')} />
                    <span className="text-[10px] font-black text-white/80 uppercase tracking-widest">Self view</span>
                </div>
            </motion.div>

            {/* Control Dashboard */}
            <div className="absolute bottom-0 left-0 right-0 z-[60] p-12 bg-gradient-to-t from-black to-transparent flex justify-center">
                <div className="flex items-center gap-6 px-10 py-6 bg-white/5 backdrop-blur-3xl rounded-[3rem] border border-white/10 shadow-2xl">
                    <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                            "h-16 w-16 rounded-[1.8rem] border transition-all duration-500",
                            !isAudioEnabled ? 'bg-red-500 border-red-500 text-white' : 'bg-white/5 border-white/5 text-white hover:bg-white/10'
                        )}
                        onClick={toggleAudio}
                    >
                        {isAudioEnabled ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
                    </Button>

                    <Button
                        variant="destructive"
                        size="icon"
                        className="h-24 w-24 rounded-[2.5rem] bg-red-600 hover:bg-red-700 shadow-[0_20px_50px_rgba(220,38,38,0.3)] hover:scale-110 active:scale-95 transition-all mx-4"
                        onClick={handleEndCall}
                    >
                        <PhoneOff className="w-8 h-8" />
                    </Button>

                    <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                            "h-16 w-16 rounded-[1.8rem] border transition-all duration-500",
                            (!isVideoEnabled || isCameraDenied) ? 'bg-red-500 border-red-500 text-white' : 'bg-white/5 border-white/5 text-white hover:bg-white/10'
                        )}
                        onClick={toggleVideo}
                    >
                        {isVideoEnabled && !isCameraDenied ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
                    </Button>
                </div>
            </div>

            {/* Professional Feedback Modal */}
            <Dialog open={isFeedbackModalOpen} onOpenChange={setIsFeedbackModalOpen}>
                <DialogContent className="bg-[#0A0A0A] border-white/10 text-white max-w-xl rounded-[3rem] p-12 font-outfit shadow-[0_30px_100px_rgba(0,0,0,0.9)]">
                    <DialogHeader className="space-y-6">
                        <div className="w-20 h-20 rounded-[2rem] bg-white/5 flex items-center justify-center border border-white/10 mb-2">
                            <Star className="w-10 h-10 text-white/40" />
                        </div>
                        <DialogTitle className="text-4xl font-black tracking-tighter">Session Debrief.</DialogTitle>
                        <DialogDescription className="text-neutral-500 text-lg leading-relaxed italic">
                            Evaluate the client's progress and record your professional observations for this training window.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-12 py-10">
                        <div className="space-y-6">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-600">Performance Index (1-10)</label>
                            <div className="grid grid-cols-5 gap-3 bg-white/[0.02] p-4 rounded-[2rem] border border-white/5">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                                    <button
                                        key={num}
                                        onClick={() => setRating(num)}
                                        className={cn(
                                            "h-14 rounded-2xl font-black transition-all text-lg",
                                            rating === num 
                                                ? 'bg-white text-black scale-105 shadow-xl' 
                                                : 'text-neutral-600 hover:text-white hover:bg-white/5'
                                        )}
                                    >
                                        {num}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-600 flex items-center gap-3">
                                <MessageSquare className="w-4 h-4" /> Strategic Feedback
                            </label>
                            <Textarea
                                placeholder="Detail corrections, highlights, and objectives for the next interval..."
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                className="bg-white/[0.03] border-white/5 min-h-[180px] rounded-[2rem] p-8 focus:ring-1 focus:ring-white/20 resize-none text-lg font-medium placeholder:text-neutral-800"
                            />
                        </div>
                    </div>

                    <DialogFooter className="gap-4">
                        <Button
                            variant="ghost"
                            onClick={() => {
                                cleanup();
                                onLeave();
                            }}
                            className="h-16 px-10 rounded-2xl text-neutral-600 hover:bg-white/5 font-bold"
                        >
                            Skip
                        </Button>
                        <Button
                            onClick={handleSubmitFeedback}
                            disabled={isSubmittingFeedback || rating === 0}
                            className="h-16 px-12 rounded-2xl bg-white text-black font-black uppercase tracking-widest text-xs hover:bg-neutral-200 disabled:opacity-30 flex-1 shadow-2xl transition-all hover:scale-[1.02]"
                        >
                            {isSubmittingFeedback ? (
                                <Loader2 className="w-6 h-6 animate-spin" />
                            ) : (
                                "Commit Evaluation"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

const logger = {
    info: (...args: any[]) => console.log('%c[VIDEO_SYSTEM]', 'color: #00ff00; font-weight: bold;', ...args),
    error: (...args: any[]) => console.error('%c[VIDEO_SYSTEM_ERROR]', 'color: #ff0000; font-weight: bold;', ...args)
};
