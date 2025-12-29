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
    Settings,
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
    const [isConnected, setIsConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [callDuration, setCallDuration] = useState(0);
    const [isRemoteUserConnected, setIsRemoteUserConnected] = useState(false);

    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const socketRef = useRef<Socket | null>(null);
    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
    const localStreamRef = useRef<MediaStream | null>(null);
    const callStartTimeRef = useRef<Date | null>(null);

    const rtcConfiguration = {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
        ]
    };

    useEffect(() => {
        initializeCall();
        return () => {
            cleanup();
        };
    }, [roomId]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isConnected && callStartTimeRef.current) {
            interval = setInterval(() => {
                const now = new Date();
                const diff = Math.floor((now.getTime() - callStartTimeRef.current!.getTime()) / 1000);
                setCallDuration(diff);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isConnected]);

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const initializeCall = async () => {
        try {
            setIsLoading(true);
            setError(null);

            // 1. Get User Media
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: { ideal: 1280 }, height: { ideal: 720 } },
                audio: true
            });
            localStreamRef.current = stream;

            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }

            // 2. Initialize Socket
            socketRef.current = io(import.meta.env.VITE_API_URL, {
                withCredentials: true,
                transports: ['websocket']
            });

            socketRef.current.on('connect', () => {
                console.log('Socket connected');
                setIsConnected(true);
                // Join the video room
                socketRef.current?.emit('join_video_room', { roomId });
            });

            socketRef.current.on('connect_error', (err) => {
                console.error('Socket connection error:', err);
                setError('Failed to connect to signaling server.');
                setIsLoading(false);
            });

            // 3. Setup Socket Listeners for WebRTC Signaling
            setupSocketListeners();

            // 4. API Call to join room (Backend Logic)
            try {
                await API.post(`/video-call/room/${roomId}/join`);
            } catch (err) {
                console.error("Failed to join call via API", err);
                // Determine if we should block or continue? 
                // Usually for tracking status in DB.
            }

            setIsLoading(false);

        } catch (err: any) {
            console.error('Error initializing call:', err);
            setError(err.message || 'Failed to access camera/microphone');
            setIsLoading(false);
        }
    };

    const setupSocketListeners = () => {
        if (!socketRef.current) return;

        socketRef.current.on('user_joined', async ({ userId }) => {
            console.log('User joined:', userId);
            setIsRemoteUserConnected(true);
            callStartTimeRef.current = new Date();
            // The existing user (initiator) creates the offer
            await createOffer();
        });

        socketRef.current.on('user_left', ({ userId }) => {
            console.log('User left:', userId);
            setIsRemoteUserConnected(false);
            setRemoteStream(null);
            if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
            closePeerConnection(); // Reset PC for potential reconnect? Or end call?
            // Usually we might want to keep local stream active or show "User disconnected"
            createPeerConnection(); // Re-prepare for potential reconnect
        });

        socketRef.current.on('webrtc_offer', async ({ offer, fromUserId }) => {
            console.log('Received offer from:', fromUserId);
            if (!isRemoteUserConnected) {
                setIsRemoteUserConnected(true);
                callStartTimeRef.current = new Date();
            }
            await handleOffer(offer);
        });

        socketRef.current.on('webrtc_answer', async ({ answer }) => {
            console.log('Received answer');
            await handleAnswer(answer);
        });

        socketRef.current.on('webrtc_ice_candidate', async ({ candidate }) => {
            console.log('Received ICE candidate');
            await handleIceCandidate(candidate);
        });
    };

    const createPeerConnection = () => {
        if (peerConnectionRef.current) { // prevent duplicates
            return peerConnectionRef.current;
        }

        const pc = new RTCPeerConnection(rtcConfiguration);

        // Add local tracks
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => {
                pc.addTrack(track, localStreamRef.current!);
            });
        }

        // Handle remote stream
        pc.ontrack = (event) => {
            console.log('Received remote track');
            // Check if we already have the stream set
            if (event.streams && event.streams[0]) {
                setRemoteStream(event.streams[0]);
                if (remoteVideoRef.current) {
                    remoteVideoRef.current.srcObject = event.streams[0];
                }
            }
        };

        // Handle ICE candidates
        pc.onicecandidate = (event) => {
            if (event.candidate && socketRef.current) {
                socketRef.current.emit('webrtc_ice_candidate', {
                    roomId,
                    candidate: event.candidate,
                    // targetUserId is handled by server room broadcast or explicit ID
                });
            }
        };

        pc.onconnectionstatechange = () => {
            console.log('Connection state:', pc.connectionState);
            if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
                setIsRemoteUserConnected(false);
                setRemoteStream(null);
            }
        }

        peerConnectionRef.current = pc;
        return pc;
    };

    const closePeerConnection = () => {
        if (peerConnectionRef.current) {
            peerConnectionRef.current.onicecandidate = null;
            peerConnectionRef.current.ontrack = null;
            peerConnectionRef.current.close();
            peerConnectionRef.current = null;
        }
    }

    const createOffer = async () => {
        const pc = createPeerConnection();
        try {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            socketRef.current?.emit('webrtc_offer', {
                roomId,
                offer
            });
        } catch (err) {
            console.error('Error creating offer:', err);
        }
    };

    const handleOffer = async (offer: RTCSessionDescriptionInit) => {
        const pc = createPeerConnection(); // Ensure PC exists
        try {
            await pc.setRemoteDescription(new RTCSessionDescription(offer));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            socketRef.current?.emit('webrtc_answer', {
                roomId,
                answer
            });
        } catch (err) {
            console.error('Error handling offer:', err);
        }
    };

    const handleAnswer = async (answer: RTCSessionDescriptionInit) => {
        const pc = peerConnectionRef.current;
        if (!pc) return;
        try {
            await pc.setRemoteDescription(new RTCSessionDescription(answer));
        } catch (err) {
            console.error('Error handling answer:', err);
        }
    };

    const handleIceCandidate = async (candidate: RTCIceCandidateInit) => {
        const pc = peerConnectionRef.current;
        if (!pc) return;
        try {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
            console.error('Error adding ICE candidate:', err);
        }
    };

    const toggleVideo = () => {
        if (localStreamRef.current) {
            const videoTrack = localStreamRef.current.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setIsVideoEnabled(videoTrack.enabled);
            }
        }
    };

    const toggleAudio = () => {
        if (localStreamRef.current) {
            const audioTrack = localStreamRef.current.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsAudioEnabled(audioTrack.enabled);
            }
        }
    };

    const cleanup = async () => {
        // Leave call in backend
        try {
            await API.post(`/video-call/room/${roomId}/leave`);
        } catch (e) { console.error('Error calling leave API', e) }

        // Stop tracks
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop());
        }

        // Close Peer Connection
        closePeerConnection();

        // Disconnect Socket
        if (socketRef.current) {
            socketRef.current.emit('leave_video_room', { roomId });
            socketRef.current.disconnect();
            socketRef.current = null;
        }
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
                <p className="text-neutral-400 mt-2">Please ensure camera and microphone permissions are granted.</p>
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
                    <Button variant="secondary" onClick={onLeave} className="w-full">go Back</Button>
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
                        <Badge variant={isRemoteUserConnected ? "default" : "secondary"} className={`${isRemoteUserConnected ? "bg-green-500 hover:bg-green-600" : "bg-neutral-600"} transition-colors`}>
                            {isRemoteUserConnected ? "Connected" : "Waiting for participant..."}
                        </Badge>
                        <div className="flex items-center px-3 py-1 bg-black/40 backdrop-blur-md rounded-full border border-white/10 text-white/90 font-mono text-sm">
                            <Clock className="w-3.5 h-3.5 mr-2 text-blue-400" />
                            {formatDuration(callDuration)}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Stage - Remote Video */}
            <div className="flex-1 relative flex items-center justify-center bg-black">
                {remoteStream ? (
                    <video
                        ref={remoteVideoRef}
                        autoPlay
                        playsInline
                        className="w-full h-full object-cover"
                        onLoadedMetadata={(e) => {
                            (e.target as HTMLVideoElement).play().catch(console.error);
                        }}
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center text-neutral-500">
                        <div className="w-24 h-24 rounded-full bg-neutral-800 flex items-center justify-center mb-6 animate-pulse">
                            <Users className="w-10 h-10 opacity-50" />
                        </div>
                        <p className="text-lg font-medium">Waiting for the other person to join...</p>
                        <p className="text-sm opacity-60 mt-1">Room ID: <span className="font-mono tracking-wider">{roomId}</span></p>
                    </div>
                )}
            </div>

            {/* PIP - Local Video */}
            <div className="absolute right-4 bottom-24 w-32 md:w-48 aspect-video bg-neutral-800 rounded-xl overflow-hidden shadow-2xl border-2 border-white/10 z-30 transition-all hover:scale-105 hover:border-blue-500/50">
                <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full h-full object-cover ${!isVideoEnabled ? 'hidden' : ''} transform -scale-x-100`}
                />
                {!isVideoEnabled && (
                    <div className="absolute inset-0 flex items-center justify-center bg-neutral-800 text-neutral-400">
                        <VideoOff className="w-8 h-8" />
                    </div>
                )}
                <div className="absolute bottom-2 left-2 text-[10px] font-bold text-white/80 bg-black/50 px-1.5 py-0.5 rounded backdrop-blur-sm">
                    YOU
                </div>
            </div>


            {/* Control Bar */}
            <div className="absolute bottom-0 left-0 right-0 z-40 p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
                <div className="flex items-center justify-center gap-4 md:gap-6">
                    <Button
                        variant="secondary"
                        size="lg"
                        className={`h-14 w-14 rounded-full border shadow-lg transition-all duration-300 ${!isAudioEnabled ? 'bg-red-500/10 border-red-500 text-red-500 hover:bg-red-500/20' : 'bg-white/10 border-white/10 text-white hover:bg-white/20 hover:scale-110'}`}
                        onClick={toggleAudio}
                    >
                        {isAudioEnabled ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
                    </Button>

                    <Button
                        variant="destructive"
                        size="lg"
                        className="h-16 w-16 rounded-full shadow-xl bg-red-600 hover:bg-red-700 hover:scale-110 transition-all duration-300 mx-2 md:mx-4"
                        onClick={handleEndCall}
                    >
                        <PhoneOff className="w-7 h-7 fill-current" />
                    </Button>

                    <Button
                        variant="secondary"
                        size="lg"
                        className={`h-14 w-14 rounded-full border shadow-lg transition-all duration-300 ${!isVideoEnabled ? 'bg-red-500/10 border-red-500 text-red-500 hover:bg-red-500/20' : 'bg-white/10 border-white/10 text-white hover:bg-white/20 hover:scale-110'}`}
                        onClick={toggleVideo}
                    >
                        {isVideoEnabled ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
                    </Button>

                </div>
            </div>

        </div>
    );
}
