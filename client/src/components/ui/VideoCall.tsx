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
    Loader2
} from "lucide-react";
import io, { Socket } from 'socket.io-client';
import API from "@/lib/axios";

interface VideoCallProps {
    roomId: string;
    onLeave: () => void;
    slotId?: string;
}

export default function VideoCall({ roomId, onLeave }: VideoCallProps) {
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);
    const [isAudioEnabled, setIsAudioEnabled] = useState(true);
    const [isCameraDenied, setIsCameraDenied] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [callDuration, setCallDuration] = useState(0);
    const [isRemoteUserConnected, setIsRemoteUserConnected] = useState(false);

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

    // Callback ref for local video to ensure it attaches immediately upon mount
    const setLocalVideoRef = (el: HTMLVideoElement | null) => {
        localVideoRef.current = el;
        if (el && localStreamRef.current) {
            el.srcObject = localStreamRef.current;
            console.log("[DEBUG] Local stream attached to video element");
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
            console.log("[DEBUG] Initializing call for room:", roomId);
            setIsLoading(true);
            setError(null);

            // 1. Get User Media
            if (!localStreamRef.current) {
                try {
                    console.log("[DEBUG] Requesting user media...");
                    const stream = await navigator.mediaDevices.getUserMedia({
                        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
                        audio: true
                    });
                    localStreamRef.current = stream;
                    console.log("[DEBUG] User media obtained");
                    setIsVideoEnabled(true);
                    setIsAudioEnabled(true);
                    setIsCameraDenied(false);

                    // If video element already exists, attach stream
                    if (localVideoRef.current) {
                        localVideoRef.current.srcObject = stream;
                    }
                } catch (mediaErr: any) {
                    console.warn('[DEBUG] Camera/Mic access denied:', mediaErr);
                    setIsCameraDenied(true);
                    setIsVideoEnabled(false);
                    setIsAudioEnabled(false);
                }
            }

            // 2. Initialize Socket
            if (!socketRef.current) {
                socketRef.current = io(import.meta.env.VITE_API_URL, {
                    withCredentials: true,
                    transports: ['websocket', 'polling']
                });

                socketRef.current.on('connect', () => {
                    console.log('[DEBUG] Socket connected:', socketRef.current?.id);
                    setIsConnected(true);
                    socketRef.current?.emit('join_video_room', { roomId });
                });

                socketRef.current.on('connect_error', (err) => {
                    console.error('[DEBUG] Socket connection error:', err);
                    setError('Failed to connect to signaling server.');
                    setIsLoading(false);
                });

                setupSocketListeners();
            }

            // 3. API Call to join room
            try {
                await API.post(`/video-call/room/${roomId}/join`);
            } catch (err) {
                console.error("[DEBUG] Failed to join call via API", err);
            }

            setIsLoading(false);
        } catch (err: any) {
            console.error('[DEBUG] Error initializing call:', err);
            setError(err.message || 'Failed to initialize call');
            setIsLoading(false);
        }
    };

    const setupSocketListeners = () => {
        const socket = socketRef.current;
        if (!socket) return;

        socket.on('room_joined', ({ isInitiator }) => {
            console.log('[DEBUG] Room joined. Initiator?', isInitiator);
            isPoliteRef.current = !isInitiator;

            // The impolite peer (initiator) starts the connection
            if (isInitiator) {
                console.log("[DEBUG] I am the initiator (impolite). Waiting for participant...");
            } else {
                console.log("[DEBUG] I am the participant (polite). Creating PC...");
                createPeerConnection();
            }
        });

        socket.on('user_joined', async ({ userId }) => {
            console.log('[DEBUG] Remote user joined:', userId);
            setIsRemoteUserConnected(true);
            if (!callStartTimeRef.current) callStartTimeRef.current = new Date();

            // Both sides can ensure PC exists (if not already created by polite join)
            createPeerConnection();
        });

        socket.on('user_left', () => {
            console.log('[DEBUG] Remote user left');
            setIsRemoteUserConnected(false);
            setRemoteStream(null);
            if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
        });

        socket.on('webrtc_offer', async ({ offer }) => {
            console.log('[DEBUG] Received WebRTC offer');
            const pc = createPeerConnection();
            try {
                const offerCollision = (makingOfferRef.current || pc.signalingState !== 'stable');
                ignoreOfferRef.current = !isPoliteRef.current && offerCollision;

                if (ignoreOfferRef.current) {
                    console.log('[DEBUG] Collision: ignoring offer (I am impolite)');
                    return;
                }

                if (offerCollision) {
                    console.log("[DEBUG] Collision: rolling back (I am polite)");
                    await pc.setLocalDescription({ type: 'rollback' });
                }

                await pc.setRemoteDescription(new RTCSessionDescription(offer));
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);

                console.log("[DEBUG] Sending answer...");
                socket.emit('webrtc_answer', { roomId, answer });
            } catch (err) {
                console.error('[DEBUG] Error handling offer:', err);
            }
        });

        socket.on('webrtc_answer', async ({ answer }) => {
            console.log('[DEBUG] Received WebRTC answer');
            const pc = peerConnectionRef.current;
            if (!pc) {
                console.warn("[DEBUG] Received answer but PC is null");
                return;
            }
            try {
                await pc.setRemoteDescription(new RTCSessionDescription(answer));
                console.log("[DEBUG] Remote description set successfully");
            } catch (err) {
                console.error('[DEBUG] Error handling answer:', err);
            }
        });

        socket.on('webrtc_ice_candidate', async ({ candidate }) => {
            const pc = peerConnectionRef.current;
            if (!pc) return;
            try {
                await pc.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (err: any) {
                if (!ignoreOfferRef.current) {
                    // console.error('[DEBUG] Error adding ICE candidate:', err.message);
                }
            }
        });

        socket.on('error', (err) => {
            console.error('[DEBUG] Socket error event:', err);
        });
    };

    const createPeerConnection = () => {
        if (peerConnectionRef.current) return peerConnectionRef.current;

        console.log("[DEBUG] Creating new RTCPeerConnection");
        const pc = new RTCPeerConnection(rtcConfiguration);

        // Add tracks
        if (localStreamRef.current) {
            console.log("[DEBUG] Adding local tracks to PC");
            localStreamRef.current.getTracks().forEach(track => {
                pc.addTrack(track, localStreamRef.current!);
            });
        } else {
            console.warn("[DEBUG] Creating PC but localStream is null");
        }

        pc.onnegotiationneeded = async () => {
            try {
                console.log("[DEBUG] Negotiation needed, creating offer...");
                makingOfferRef.current = true;
                await pc.setLocalDescription();

                if (pc.localDescription) {
                    socketRef.current?.emit('webrtc_offer', {
                        roomId,
                        offer: pc.localDescription
                    });
                    console.log("[DEBUG] Offer sent");
                }
            } catch (err) {
                console.error('[DEBUG] onnegotiationneeded error:', err);
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
            console.log('[DEBUG] Remote track received:', event.track.kind);
            if (event.streams && event.streams[0]) {
                setRemoteStream(event.streams[0]);
                if (remoteVideoRef.current) {
                    remoteVideoRef.current.srcObject = event.streams[0];
                }
            }
        };

        pc.oniceconnectionstatechange = () => {
            console.log('[DEBUG] ICE Connection State:', pc.iceConnectionState);
        };

        pc.onconnectionstatechange = () => {
            console.log('[DEBUG] PC Connection State:', pc.connectionState);
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
        console.log("[DEBUG] Cleaning up video call session...");
        try {
            await API.post(`/video-call/room/${roomId}/leave`);
        } catch (e) {
            // Ignore error during cleanup
        }

        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => {
                track.stop();
                console.log("[DEBUG] Stopped local track:", track.kind);
            });
            localStreamRef.current = null;
        }

        if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
            peerConnectionRef.current = null;
            console.log("[DEBUG] Closed RTCPeerConnection");
        }

        if (socketRef.current) {
            socketRef.current.emit('leave_video_room', { roomId });
            socketRef.current.disconnect();
            socketRef.current = null;
            console.log("[DEBUG] Disconnected socket");
        }

        isInitializingRef.current = false;
    };

    const handleEndCall = () => {
        cleanup();
        onLeave();
    };


    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-950 text-white">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                <h2 className="text-xl font-semibold">Initializing secure connection...</h2>
                <p className="text-neutral-400 mt-2">Checking camera and audio devices...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-950 text-white px-4">
                <div className="bg-red-500/10 p-6 rounded-2xl border border-red-500/20 text-center max-w-md">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Connection Failed</h2>
                    <p className="text-neutral-300 mb-6">{error}</p>
                    <Button variant="secondary" onClick={onLeave} className="w-full">Go Back</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="relative w-full h-screen bg-neutral-900 overflow-hidden flex flex-col">

            {/* Header / Info Bar */}
            <div className="absolute top-0 left-0 right-0 z-20 p-4 bg-gradient-to-b from-black/80 to-transparent">
                <div className="flex items-center justify-between max-w-7xl mx-auto">
                    <div className="flex items-center gap-3">
                        <Badge variant={isRemoteUserConnected ? "default" : "secondary"} className={`${isRemoteUserConnected ? "bg-green-500 hover:bg-green-600 shadow-[0_0_15px_rgba(34,197,94,0.3)]" : "bg-neutral-600"} transition-all duration-300`}>
                            {isRemoteUserConnected ? "Active Session" : "Waiting for participant..."}
                        </Badge>
                        <div className="flex items-center px-3 py-1 bg-black/40 backdrop-blur-md rounded-full border border-white/10 text-white/90 font-mono text-sm">
                            <Clock className="w-3.5 h-3.5 mr-2 text-blue-400" />
                            {formatDuration(callDuration)}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Stage - Remote Video */}
            <div className="flex-1 relative flex items-center justify-center bg-neutral-950">
                {remoteStream ? (
                    <video
                        ref={remoteVideoRef}
                        autoPlay
                        playsInline
                        className="w-full h-full object-contain"
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center text-neutral-500 text-center px-6">
                        <div className="w-24 h-24 rounded-full bg-neutral-900/50 border border-white/5 flex items-center justify-center mb-6 animate-pulse">
                            <Users className="w-10 h-10 opacity-30" />
                        </div>
                        <h3 className="text-xl font-medium text-white/70">Connecting with participant...</h3>
                        <p className="text-sm opacity-50 mt-2 max-w-xs">The session will start as soon as the trainer or user joins this room.</p>
                        <Badge variant="outline" className="mt-6 border-white/10 text-white/40 font-mono">ROOM: {roomId}</Badge>
                    </div>
                )}

                {/* Remote Connection Loading State */}
                {isRemoteUserConnected && !remoteStream && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px] z-10">
                        <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
                        <p className="text-white/80 font-medium">Establishing video stream...</p>
                    </div>
                )}
            </div>

            {/* PIP - Local Video */}
            <div className="absolute right-4 bottom-24 w-40 md:w-64 aspect-video bg-neutral-800 rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-2 border-white/10 z-30 transition-all hover:scale-105 hover:border-blue-500 group">
                <video
                    ref={setLocalVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full h-full object-cover transform -scale-x-100 ${(!isVideoEnabled || isCameraDenied) ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
                />

                {/* Fallback for disabled/denied camera */}
                {(!isVideoEnabled || isCameraDenied) && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-800/90 text-neutral-400 p-4 text-center">
                        <div className="p-3 rounded-full bg-white/5 mb-2">
                            <VideoOff className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-medium uppercase tracking-wider">
                            {isCameraDenied ? 'Permission Denied' : 'Camera Off'}
                        </span>
                    </div>
                )}

                <div className="absolute bottom-2 left-2 flex items-center gap-1.5 text-[10px] font-bold text-white/90 bg-black/60 px-2 py-1 rounded-lg backdrop-blur-md border border-white/5 shadow-lg">
                    <div className={`w-1.5 h-1.5 rounded-full ${(!isVideoEnabled || isCameraDenied) ? 'bg-red-500' : 'bg-green-500'}`}></div>
                    YOU
                </div>
            </div>


            {/* Control Bar */}
            <div className="absolute bottom-0 left-0 right-0 z-40 p-8 pt-12 bg-gradient-to-t from-black via-black/80 to-transparent">
                <div className="flex items-center justify-center gap-4 md:gap-8">
                    <Button
                        variant="ghost"
                        size="icon"
                        className={`h-14 w-14 rounded-full border shadow-2xl transition-all duration-300 ${!isAudioEnabled ? 'bg-red-500 border-red-500 text-white hover:bg-red-600' : 'bg-white/10 border-white/10 text-white hover:bg-white/20 hover:scale-110'}`}
                        onClick={toggleAudio}
                        disabled={isCameraDenied && !localStreamRef.current}
                    >
                        {isAudioEnabled ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
                    </Button>

                    <Button
                        variant="destructive"
                        size="icon"
                        className="h-16 w-16 rounded-full shadow-[0_0_30px_rgba(220,38,38,0.4)] bg-red-600 hover:bg-red-700 hover:scale-110 active:scale-95 transition-all duration-300 mx-2 md:mx-4"
                        onClick={handleEndCall}
                    >
                        <PhoneOff className="w-7 h-7" />
                    </Button>

                    <Button
                        variant="ghost"
                        size="icon"
                        className={`h-14 w-14 rounded-full border shadow-2xl transition-all duration-300 ${(!isVideoEnabled || isCameraDenied) ? 'bg-red-500 border-red-500 text-white hover:bg-red-600' : 'bg-white/10 border-white/10 text-white hover:bg-white/20 hover:scale-110'}`}
                        onClick={toggleVideo}
                        disabled={isCameraDenied}
                    >
                        {isVideoEnabled && !isCameraDenied ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
                    </Button>
                </div>

                {isCameraDenied && (
                    <p className="text-center text-red-400 text-xs mt-4 font-medium animate-pulse">
                        Camera/Microphone access is restricted in your browser settings.
                    </p>
                )}
            </div>

        </div>
    );
}
