import { useEffect, useRef, useState } from 'react';
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
    MessageSquare
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
import {type RootState } from '@/redux/store';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface VideoCallProps {
    roomId: string;
    onLeave: () => void;
    slotId?: string;
}

export default function VideoCall({ roomId, onLeave }: VideoCallProps) {
    const isTrainer = useSelector((state: RootState) => state.trainerAuth.isAuthenticated);
    
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);
    const [isAudioEnabled, setIsAudioEnabled] = useState(true);
    const [isCameraDenied, setIsCameraDenied] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [callDuration, setCallDuration] = useState(0);
    const [isRemoteUserConnected, setIsRemoteUserConnected] = useState(false);
    
    // Feedback State
    const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
    const [rating, setRating] = useState(0);
    const [feedback, setFeedback] = useState("");
    const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

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
        ],
        iceCandidatePoolSize: 10
    };

    const setLocalVideoRef = (el: HTMLVideoElement | null) => {
        localVideoRef.current = el;
        if (el && localStreamRef.current) {
            el.srcObject = localStreamRef.current;
        }
    };

    useEffect(() => {
        if (!isInitializingRef.current) {
            initializeCall();
        }
        return () => {
            cleanup();
        };
    }, [roomId]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isRemoteUserConnected && callStartTimeRef.current) {
            interval = setInterval(() => {
                const now = new Date();
                const diff = Math.floor((now.getTime() - callStartTimeRef.current!.getTime()) / 1000);
                setCallDuration(diff);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isRemoteUserConnected]);

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

            if (!localStreamRef.current) {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({
                        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
                        audio: true
                    });
                    localStreamRef.current = stream;
                    setIsVideoEnabled(true);
                    setIsAudioEnabled(true);
                    setIsCameraDenied(false);

                    if (localVideoRef.current) {
                        localVideoRef.current.srcObject = stream;
                    }
                } catch (mediaErr: any) {
                    setIsCameraDenied(true);
                    setIsVideoEnabled(false);
                    setIsAudioEnabled(false);
                }
            }

            if (!socketRef.current) {
                socketRef.current = io(import.meta.env.VITE_API_URL, {
                    withCredentials: true,
                    transports: ['websocket', 'polling']
                });

                socketRef.current.on('connect', () => {
                    setIsConnected(true);
                    socketRef.current?.emit('join_video_room', { roomId });
                });

                socketRef.current.on('connect_error', (err) => {
                    setError('Failed to connect to signaling server.');
                    setIsLoading(false);
                });

                setupSocketListeners();
            }

            try {
                await API.post(`/video-call/room/${roomId}/join`);
            } catch (err) {
                console.error("Failed to join call via API", err);
            }

            setIsLoading(false);
        } catch (err: any) {
            setError(err.message || 'Failed to initialize call');
            setIsLoading(false);
        }
    };

    const setupSocketListeners = () => {
        const socket = socketRef.current;
        if (!socket) return;

        socket.on('room_joined', ({ isInitiator }) => {
            isPoliteRef.current = !isInitiator;
            if (!isInitiator) {
                createPeerConnection();
            }
        });

        socket.on('user_joined', async ({ userId }) => {
            setIsRemoteUserConnected(true);
            if (!callStartTimeRef.current) callStartTimeRef.current = new Date();
            createPeerConnection();
        });

        socket.on('user_left', () => {
            setIsRemoteUserConnected(false);
            setRemoteStream(null);
            if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
        });

        socket.on('webrtc_offer', async ({ offer }) => {
            const pc = createPeerConnection();
            try {
                const offerCollision = (makingOfferRef.current || pc.signalingState !== 'stable');
                ignoreOfferRef.current = !isPoliteRef.current && offerCollision;

                if (ignoreOfferRef.current) return;

                if (offerCollision) {
                    await pc.setLocalDescription({ type: 'rollback' });
                }

                await pc.setRemoteDescription(new RTCSessionDescription(offer));
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                socket.emit('webrtc_answer', { roomId, answer });
            } catch (err) {
                console.error('Error handling offer:', err);
            }
        });

        socket.on('webrtc_answer', async ({ answer }) => {
            const pc = peerConnectionRef.current;
            if (!pc) return;
            try {
                await pc.setRemoteDescription(new RTCSessionDescription(answer));
            } catch (err) {
                console.error('Error handling answer:', err);
            }
        });

        socket.on('webrtc_ice_candidate', async ({ candidate }) => {
            const pc = peerConnectionRef.current;
            if (!pc) return;
            try {
                await pc.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (err: any) {}
        });
    };

    const createPeerConnection = () => {
        if (peerConnectionRef.current) return peerConnectionRef.current;

        const pc = new RTCPeerConnection(rtcConfiguration);

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
                console.error('onnegotiationneeded error:', err);
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
            if (event.streams && event.streams[0]) {
                setRemoteStream(event.streams[0]);
                if (remoteVideoRef.current) {
                    remoteVideoRef.current.srcObject = event.streams[0];
                }
            }
        };

        pc.onconnectionstatechange = () => {
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
            toast.error("Please provide a rating");
            return;
        }

        try {
            setIsSubmittingFeedback(true);
            await API.post(`/video-call/room/${roomId}/feedback`, {
                rating,
                feedback
            });
            toast.success("Evaluation submitted successfully");
            cleanup();
            onLeave();
        } catch (error) {
            console.error("Error submitting feedback:", error);
            toast.error("Failed to submit evaluation");
        } finally {
            setIsSubmittingFeedback(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-950 text-white font-outfit">
                <Loader2 className="w-12 h-12 text-white/20 animate-spin mb-4" />
                <h2 className="text-xl font-medium">Initializing secure connection...</h2>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-950 text-white px-4 font-outfit">
                <div className="bg-red-500/10 p-8 rounded-[32px] border border-red-500/20 text-center max-w-md">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Connection Failed</h2>
                    <p className="text-neutral-400 mb-6">{error}</p>
                    <Button variant="secondary" onClick={onLeave} className="w-full h-12 rounded-full">Go Back</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="relative w-full h-screen bg-neutral-950 overflow-hidden flex flex-col font-outfit">
            
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-20 p-6 bg-gradient-to-b from-black to-transparent">
                <div className="flex items-center justify-between max-w-7xl mx-auto">
                    <div className="flex items-center gap-4">
                        <Badge variant={isRemoteUserConnected ? "default" : "secondary"} className={`${isRemoteUserConnected ? "bg-white text-black" : "bg-white/5 text-white/40"} px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest`}>
                            {isRemoteUserConnected ? "Live Session" : "Waiting for participant"}
                        </Badge>
                        <div className="flex items-center px-4 py-1.5 bg-white/5 backdrop-blur-xl rounded-full border border-white/10 text-white/70 font-mono text-sm">
                            <Clock className="w-4 h-4 mr-2 text-white/40" />
                            {formatDuration(callDuration)}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Video Area */}
            <div className="flex-1 relative flex items-center justify-center">
                {remoteStream ? (
                    <video
                        ref={remoteVideoRef}
                        autoPlay
                        playsInline
                        className="w-full h-full object-contain"
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center text-center px-6">
                        <div className="w-32 h-32 rounded-[40px] bg-white/5 flex items-center justify-center mb-8 animate-pulse border border-white/5">
                            <Users className="w-12 h-12 text-white/10" />
                        </div>
                        <h3 className="text-2xl font-bold text-white/50 tracking-tight">Establishing connection...</h3>
                        <p className="text-sm text-white/20 mt-3 max-w-xs uppercase tracking-widest font-bold">Room ID: {roomId}</p>
                    </div>
                )}
            </div>

            {/* PIP - Local Video */}
            <div className="absolute right-8 bottom-32 w-48 md:w-80 aspect-video bg-neutral-900 rounded-3xl overflow-hidden shadow-2xl border border-white/10 z-30 transition-all hover:scale-105 group">
                <video
                    ref={setLocalVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full h-full object-cover transform -scale-x-100 ${(!isVideoEnabled || isCameraDenied) ? 'opacity-0' : 'opacity-100'} transition-opacity duration-500`}
                />
                {(!isVideoEnabled || isCameraDenied) && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-900">
                        <VideoOff className="w-8 h-8 text-white/10" />
                    </div>
                )}
                <div className="absolute bottom-3 left-3 flex items-center gap-2 text-[10px] font-bold text-white/90 bg-black/60 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/10">
                    <div className={`w-1.5 h-1.5 rounded-full ${(!isVideoEnabled || isCameraDenied) ? 'bg-red-500' : 'bg-green-500'}`} />
                    PERSONAL VIEW
                </div>
            </div>

            {/* Controls */}
            <div className="absolute bottom-0 left-0 right-0 z-40 p-10 bg-gradient-to-t from-black to-transparent">
                <div className="flex items-center justify-center gap-6">
                    <Button
                        variant="ghost"
                        size="icon"
                        className={`h-16 w-16 rounded-[24px] border transition-all ${!isAudioEnabled ? 'bg-red-500 border-red-500 text-white' : 'bg-white/5 border-white/10 text-white hover:bg-white/10'}`}
                        onClick={toggleAudio}
                    >
                        {isAudioEnabled ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
                    </Button>

                    <Button
                        variant="destructive"
                        size="icon"
                        className="h-20 w-20 rounded-[32px] bg-red-600 hover:bg-red-700 shadow-2xl hover:scale-110 transition-all mx-4"
                        onClick={handleEndCall}
                    >
                        <PhoneOff className="w-8 h-8" />
                    </Button>

                    <Button
                        variant="ghost"
                        size="icon"
                        className={`h-16 w-16 rounded-[24px] border transition-all ${(!isVideoEnabled || isCameraDenied) ? 'bg-red-500 border-red-500 text-white' : 'bg-white/5 border-white/10 text-white hover:bg-white/10'}`}
                        onClick={toggleVideo}
                    >
                        {isVideoEnabled && !isCameraDenied ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
                    </Button>
                </div>
            </div>

            {/* Feedback Modal for Trainers */}
            <Dialog open={isFeedbackModalOpen} onOpenChange={setIsFeedbackModalOpen}>
                <DialogContent className="bg-neutral-900 border-white/10 text-white max-w-lg rounded-[32px] p-8 font-outfit">
                    <DialogHeader className="space-y-4">
                        <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 mb-2">
                            <Star className="w-8 h-8 text-white/50" />
                        </div>
                        <DialogTitle className="text-3xl font-bold">Session Evaluation</DialogTitle>
                        <DialogDescription className="text-neutral-400 text-lg">
                            Please rate the user's performance and provide your professional feedback for this session.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-10 py-8">
                        {/* Rating Selection */}
                        <div className="space-y-6">
                            <label className="text-sm font-bold uppercase tracking-widest text-neutral-500">Performance Rating (0-10)</label>
                            <div className="flex items-center justify-between gap-2 bg-white/5 p-4 rounded-3xl border border-white/5">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                                    <button
                                        key={num}
                                        onClick={() => setRating(num)}
                                        className={`w-10 h-10 rounded-xl font-bold transition-all ${
                                            rating === num 
                                                ? 'bg-white text-black scale-110 shadow-lg' 
                                                : 'text-neutral-500 hover:text-white hover:bg-white/10'
                                        }`}
                                    >
                                        {num}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Feedback Textarea */}
                        <div className="space-y-4">
                            <label className="text-sm font-bold uppercase tracking-widest text-neutral-500 flex items-center gap-2">
                                <MessageSquare className="w-4 h-4" /> Professional Feedback
                            </label>
                            <Textarea
                                placeholder="Share your observations, corrections, and next steps for the user..."
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                className="bg-white/5 border-white/10 min-h-[160px] rounded-3xl p-6 focus:ring-1 focus:ring-white/20 resize-none text-lg"
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
                            className="h-14 px-8 rounded-full text-neutral-500 hover:bg-white/5"
                        >
                            Skip Evaluation
                        </Button>
                        <Button
                            onClick={handleSubmitFeedback}
                            disabled={isSubmittingFeedback || rating === 0}
                            className="h-14 px-10 rounded-full bg-white text-black font-bold hover:bg-white/90 disabled:opacity-50 flex-1 shadow-2xl"
                        >
                            {isSubmittingFeedback ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                "Complete Session"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
