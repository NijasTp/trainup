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
} from "lucide-react";
import io, { Socket } from 'socket.io-client';
import { toast } from "sonner";
import API from "@/lib/axios";

interface VideoCallProps {
    roomId: string;
    onLeave: () => void;
}

interface VideoCallSession {
    _id: string;
    roomId: string;
    status: 'scheduled' | 'active' | 'ended';
    participants: Array<{
        userId: string;
        userType: 'user' | 'trainer';
        isActive: boolean;
    }>;
    scheduledStartTime: string;
    scheduledEndTime: string;
}

export default function VideoCall({ roomId, onLeave }: VideoCallProps) {
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);
    const [isAudioEnabled, setIsAudioEnabled] = useState(true);
    const [isConnected, setIsConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [callSession, setCallSession] = useState<VideoCallSession | null>(null);
    const [participants, setParticipants] = useState<string[]>([]);
    const [callDuration, setCallDuration] = useState(0);
    const [retryCount, setRetryCount] = useState(0);
    const [isInitializing, setIsInitializing] = useState(false);
    
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const socketRef = useRef<Socket | null>(null);
    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
    const localStreamRef = useRef<MediaStream | null>(null);
    const callStartTimeRef = useRef<Date | null>(null);
    const initializationRef = useRef<boolean>(false);

    const rtcConfiguration = {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' }
        ]
    };

    useEffect(() => {
        if (!isInitializing) {
            setIsInitializing(true);
            initializeVideoCall();
        }
        return () => {
            cleanup();
        };
    }, [roomId]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (callStartTimeRef.current) {
            interval = setInterval(() => {
                const now = new Date().getTime();
                const startTime = callStartTimeRef.current!.getTime();
                setCallDuration(Math.floor((now - startTime) / 1000));
            }, 1000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [callStartTimeRef.current]);

    const joinCallWithRetry = async (attempt = 1): Promise<void> => {
        try {
            await API.post(`/video-call/room/${roomId}/join`);
        } catch (error: any) {
            console.error(`Join call attempt ${attempt} failed:`, error);
            
            if (attempt < 3 && error.response?.status !== 403) {
                console.log(`Retrying join call... (${attempt + 1}/3)`);
                setRetryCount(attempt);
                await new Promise(resolve => setTimeout(resolve, 2000));
                return joinCallWithRetry(attempt + 1);
            }
            throw error;
        }
    };

    const setupMediaAndPeerConnection = async () => {
        try {
            // Clean up any existing stream first
            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach(track => track.stop());
                localStreamRef.current = null;
            }

            // Get user media with error handling
            let stream: MediaStream;
            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: true
                });
            } catch (mediaError: any) {
                console.error('Media access error:', mediaError);
                if (mediaError.name === 'NotReadableError') {
                    throw new Error('Camera or microphone is already in use by another application');
                }
                throw new Error('Failed to access camera/microphone');
            }

            localStreamRef.current = stream;
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }

            // Clean up existing peer connection
            if (peerConnectionRef.current) {
                peerConnectionRef.current.close();
                peerConnectionRef.current = null;
            }

            // Create new peer connection
            peerConnectionRef.current = new RTCPeerConnection(rtcConfiguration);

            // Add local stream tracks to peer connection
            stream.getTracks().forEach(track => {
                if (peerConnectionRef.current && localStreamRef.current) {
                    peerConnectionRef.current.addTrack(track, localStreamRef.current);
                }
            });

            // Handle remote stream
            peerConnectionRef.current.ontrack = (event) => {
                console.log('Received remote stream');
                if (remoteVideoRef.current && event.streams[0]) {
                    remoteVideoRef.current.srcObject = event.streams[0];
                }
            };

            // Handle ICE candidates
            peerConnectionRef.current.onicecandidate = (event) => {
                if (event.candidate && socketRef.current) {
                    console.log('Sending ICE candidate');
                    socketRef.current.emit('webrtc_ice_candidate', {
                        roomId,
                        candidate: event.candidate
                    });
                }
            };

            // Handle connection state changes
            peerConnectionRef.current.onconnectionstatechange = () => {
                if (peerConnectionRef.current) {
                    console.log('Connection state:', peerConnectionRef.current.connectionState);
                }
            };

            console.log('Media and peer connection setup completed');

        } catch (error) {
            console.error('Error setting up media and peer connection:', error);
            throw error;
        }
    };

    const handleOffer = async (offer: RTCSessionDescriptionInit) => {
        if (!peerConnectionRef.current) {
            console.log('No peer connection available for offer');
            return;
        }

        try {
            console.log('Handling offer, current state:', peerConnectionRef.current.signalingState);
            
            // Only set remote description if we're in the right state
            if (peerConnectionRef.current.signalingState === 'stable') {
                await peerConnectionRef.current.setRemoteDescription(offer);
                
                const answer = await peerConnectionRef.current.createAnswer();
                await peerConnectionRef.current.setLocalDescription(answer);

                if (socketRef.current) {
                    socketRef.current.emit('webrtc_answer', {
                        roomId,
                        answer
                    });
                }
            } else {
                console.log('Peer connection not in correct state for offer:', peerConnectionRef.current.signalingState);
            }
        } catch (error) {
            console.error('Error handling offer:', error);
        }
    };

    const handleAnswer = async (answer: RTCSessionDescriptionInit) => {
        if (!peerConnectionRef.current) {
            console.log('No peer connection available for answer');
            return;
        }

        try {
            console.log('Handling answer, current state:', peerConnectionRef.current.signalingState);
            
            // Only set remote description if we're in the right state
            if (peerConnectionRef.current.signalingState === 'have-local-offer') {
                await peerConnectionRef.current.setRemoteDescription(answer);
            } else {
                console.log('Peer connection not in correct state for answer:', peerConnectionRef.current.signalingState);
            }
        } catch (error) {
            console.error('Error handling answer:', error);
        }
    };

    const handleIceCandidate = async (candidate: RTCIceCandidateInit) => {
        if (!peerConnectionRef.current || 
            peerConnectionRef.current.signalingState === 'closed' ||
            !peerConnectionRef.current.remoteDescription) {
            console.log('Peer connection not ready for ICE candidate');
            return;
        }

        try {
            console.log('Adding ICE candidate');
            await peerConnectionRef.current.addIceCandidate(candidate);
        } catch (error) {
            console.error('Error handling ICE candidate:', error);
        }
    };

    const initializeVideoCall = async () => {
        if (initializationRef.current) return;
        initializationRef.current = true;
        
        try {
            setIsLoading(true);
            setError(null);
            
            // Clean up any existing connections first
            cleanup();
            
            // Get call info and join the call
            const callResponse = await API.get(`/video-call/room/${roomId}`);
            setCallSession(callResponse.data.videoCall);
            
            await joinCallWithRetry();
            
            // Initialize socket connection with proper error handling
            await initializeSocket();
            
            // Get user media and set up peer connection
            await setupMediaAndPeerConnection();
            
            setIsLoading(false);
        } catch (error) {
            console.error('Error initializing video call:', error);
            setError(error instanceof Error ? error.message : 'Failed to initialize video call');
            setIsLoading(false);
            initializationRef.current = false;
        }
    };

    const initializeSocket = async (): Promise<void> => {
        return new Promise((resolve, reject) => {
            // Clean up existing socket
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }

            // Initialize socket connection with authentication
            socketRef.current = io(import.meta.env.VITE_API_URL, {
                withCredentials: true,
                transports: ['websocket', 'polling'],
                autoConnect: true,
                forceNew: true,
                timeout: 10000,
                auth: {
                    // This will send cookies automatically
                }
            });

            // Handle connection success
            socketRef.current.on('connect', () => {
                console.log('Socket connected successfully');
                setIsConnected(true);
                callStartTimeRef.current = new Date();
                
                // Join the video room after successful connection
                socketRef.current!.emit('join_video_room', { roomId });
                resolve();
            });

            socketRef.current.on('connect_error', (error) => {
                console.error('Socket connection error:', error);
                setIsConnected(false);
                reject(new Error('Failed to connect to video server'));
            });

            setupSocketListeners();
        });
    };

    const setupSocketListeners = () => {
        if (!socketRef.current) return;

        socketRef.current.on('user_joined', ({ userId }) => {
            console.log('User joined:', userId);
            setParticipants(prev => [...prev, userId]);
        });

        socketRef.current.on('webrtc_offer', async ({ offer, fromUserId }) => {
            console.log('Received offer from:', fromUserId);
            await handleOffer(offer);
        });

        socketRef.current.on('webrtc_answer', async ({ answer, fromUserId }) => {
            console.log('Received answer from:', fromUserId);
            await handleAnswer(answer);
        });

        socketRef.current.on('webrtc_ice_candidate', async ({ candidate, fromUserId }) => {
            console.log('Received ICE candidate from:', fromUserId);
            await handleIceCandidate(candidate);
        });

        socketRef.current.on('user_left', ({ userId }) => {
            console.log('User left:', userId);
            setParticipants(prev => prev.filter(p => p !== userId));
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = null;
            }
        });

        socketRef.current.on('disconnect', () => {
            setIsConnected(false);
        });
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

    const leaveCall = async () => {
        try {
            await API.post(`/video-call/room/${roomId}/leave`);
        } catch (error) {
            console.error('Error leaving call:', error);
        }
        cleanup();
        onLeave();
    };

    const retryConnection = () => {
        cleanup();
        setRetryCount(0);
        setIsInitializing(false);
        initializationRef.current = false;
        setTimeout(() => {
            initializeVideoCall();
        }, 1000);
    };

    const cleanup = () => {
        console.log('Cleaning up video call resources');
        
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
        
        // Clear video elements
        if (localVideoRef.current) {
            localVideoRef.current.srcObject = null;
        }
        if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = null;
        }
    };

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto"></div>
                    <p className="text-white text-lg">
                        {retryCount > 0 ? `Retrying connection... (${retryCount}/3)` : 'Connecting to video call...'}
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center space-y-6 max-w-md mx-auto px-4">
                    <AlertCircle className="h-16 w-16 text-red-500 mx-auto" />
                    <h2 className="text-2xl font-bold text-white">Connection Failed</h2>
                    <p className="text-white/80 text-lg">{error}</p>
                    
                    <div className="space-y-3">
                        {retryCount < 3 && (
                            <Button 
                                onClick={retryConnection}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
                            >
                                Try Again
                            </Button>
                        )}
                        <Button 
                            onClick={onLeave}
                            variant="outline"
                            className="border-white/30 text-white hover:bg-white/10 px-6 py-2"
                        >
                            Go Back
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black relative overflow-hidden">
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-10 bg-black/50 backdrop-blur-sm p-4">
                <div className="flex items-center justify-between text-white">
                    <div className="flex items-center space-x-4">
                        <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/50">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                            Live
                        </Badge>
                        <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4" />
                            <span className="font-mono">{formatDuration(callDuration)}</span>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4" />
                        <span>{participants.length + 1}</span>
                    </div>
                </div>
            </div>

            {/* Video Grid */}
            <div className="relative w-full h-full flex">
                {/* Remote Video (Main) */}
                <div className="flex-1 relative">
                    <video
                        ref={remoteVideoRef}
                        autoPlay
                        playsInline
                        className="w-full h-full object-cover"
                    />
                    {!remoteVideoRef.current?.srcObject && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                            <div className="text-center text-white">
                                <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
                                <p className="text-lg">Waiting for other participant...</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Local Video (Picture-in-picture) */}
                <div className="absolute top-20 right-4 w-64 h-48 bg-gray-800 rounded-lg overflow-hidden border-2 border-white/20">
                    <video
                        ref={localVideoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                    />
                    {!isVideoEnabled && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                            <VideoOff className="h-8 w-8 text-white/50" />
                        </div>
                    )}
                </div>
            </div>

            {/* Controls */}
            <div className="absolute bottom-0 left-0 right-0 z-10 bg-black/50 backdrop-blur-sm p-6">
                <div className="flex items-center justify-center space-x-4">
                    <Button
                        variant={isAudioEnabled ? "secondary" : "destructive"}
                        size="lg"
                        onClick={toggleAudio}
                        className="rounded-full w-12 h-12 p-0"
                    >
                        {isAudioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                    </Button>

                    <Button
                        variant={isVideoEnabled ? "secondary" : "destructive"}
                        size="lg"
                        onClick={toggleVideo}
                        className="rounded-full w-12 h-12 p-0"
                    >
                        {isVideoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                    </Button>

                    <Button
                        variant="destructive"
                        size="lg"
                        onClick={leaveCall}
                        className="rounded-full w-12 h-12 p-0"
                    >
                        <PhoneOff className="h-5 w-5" />
                    </Button>
                </div>

                {/* Connection Status */}
                <div className="text-center mt-4">
                    <Badge 
                        variant={isConnected ? "secondary" : "destructive"}
                        className={isConnected ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}
                    >
                        {isConnected ? "Connected" : "Connecting..."}
                    </Badge>
                </div>
            </div>
        </div>
    );
}