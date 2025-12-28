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
    Settings
} from "lucide-react";
import io, { Socket } from 'socket.io-client';
import API from "@/lib/axios";

interface VideoCallProps {
    roomId: string;
    onLeave: () => void;
}



export default function VideoCall({ roomId, onLeave }: VideoCallProps) {
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);
    const [isAudioEnabled, setIsAudioEnabled] = useState(true);
    const [isConnected, setIsConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [participants, setParticipants] = useState<string[]>([]);
    const [callDuration, setCallDuration] = useState(0);
    const [retryCount, setRetryCount] = useState(0);
    const [hasPermissions, setHasPermissions] = useState(false);
    const [streamReady, setStreamReady] = useState(false);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

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
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' }
        ]
    };

    useEffect(() => {
        checkMediaPermissions();
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

    const checkMediaPermissions = async () => {
        try {
            const permissions = await Promise.all([
                navigator.permissions.query({ name: 'camera' as PermissionName }),
                navigator.permissions.query({ name: 'microphone' as PermissionName })
            ]);

            const cameraGranted = permissions[0].state === 'granted';
            const micGranted = permissions[1].state === 'granted';

            if (cameraGranted && micGranted) {
                setHasPermissions(true);
                if (!initializationRef.current) {
                    initializeVideoCall();
                }
            } else {
                await requestMediaPermissions();
            }
        } catch (error) {
            console.error('Error checking permissions:', error);
            await requestMediaPermissions();
        }
    };

    const requestMediaPermissions = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });

            stream.getTracks().forEach(track => track.stop());

            setHasPermissions(true);
            if (!initializationRef.current) {
                initializeVideoCall();
            }
        } catch (error: any) {
            console.error('Media permission denied:', error);
            if (error.name === 'NotAllowedError') {
                setError('Camera and microphone permissions are required for video calls. Please allow access and refresh the page.');
            } else if (error.name === 'NotFoundError') {
                setError('No camera or microphone found. Please check your devices.');
            } else {
                setError('Failed to access camera and microphone. Please check your permissions.');
            }
            setIsLoading(false);
        }
    };

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
            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach(track => track.stop());
                localStreamRef.current = null;
            }

            let stream: MediaStream;
            try {
                stream = await navigator.mediaDevices.getUserMedia({
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
            } catch (mediaError: any) {
                console.error('Media access error:', mediaError);
                if (mediaError.name === 'NotReadableError') {
                    throw new Error('Camera or microphone is being used by another application');
                } else if (mediaError.name === 'NotAllowedError') {
                    throw new Error('Please allow camera and microphone access');
                }
                throw new Error('Failed to access camera/microphone');
            }

            localStreamRef.current = stream;

            if (localVideoRef.current) {
                console.log('Assigning local stream to video element', stream.id);
                localVideoRef.current.srcObject = stream;
                localVideoRef.current.muted = true;
                setStreamReady(true);

                try {
                    await localVideoRef.current.play();
                    console.log('Local video playing successfully');
                } catch (e) {
                    console.error('Failed to play local video:', e);
                }
            } else {
                console.error('localVideoRef.current is null when assigning stream');
            }

            if (peerConnectionRef.current) {
                peerConnectionRef.current.close();
                peerConnectionRef.current = null;
            }

            peerConnectionRef.current = new RTCPeerConnection(rtcConfiguration);

            stream.getTracks().forEach(track => {
                if (peerConnectionRef.current && localStreamRef.current) {
                    peerConnectionRef.current.addTrack(track, localStreamRef.current);
                }
            });

            peerConnectionRef.current.ontrack = (event) => {
                console.log('Received remote stream');
                if (event.streams[0]) {
                    setRemoteStream(event.streams[0]);
                    if (remoteVideoRef.current) {
                        remoteVideoRef.current.srcObject = event.streams[0];
                        remoteVideoRef.current.play().catch(e => console.error('Remote play error:', e));
                    }
                }
            };

            peerConnectionRef.current.onicecandidate = (event) => {
                if (event.candidate && socketRef.current) {
                    console.log('Sending ICE candidate');
                    socketRef.current.emit('webrtc_ice_candidate', {
                        roomId,
                        candidate: event.candidate
                    });
                }
            };

            peerConnectionRef.current.onconnectionstatechange = () => {
                if (peerConnectionRef.current) {
                    console.log('Connection state:', peerConnectionRef.current.connectionState);

                    if (peerConnectionRef.current.connectionState === 'failed') {
                        console.log('Connection failed, attempting to restart ICE');
                        peerConnectionRef.current.restartIce();
                    }
                }
            };

            peerConnectionRef.current.oniceconnectionstatechange = () => {
                if (peerConnectionRef.current) {
                    console.log('ICE connection state:', peerConnectionRef.current.iceConnectionState);
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

    const createOffer = async () => {
        if (!peerConnectionRef.current) return;

        try {
            const offer = await peerConnectionRef.current.createOffer();
            await peerConnectionRef.current.setLocalDescription(offer);

            if (socketRef.current) {
                socketRef.current.emit('webrtc_offer', {
                    roomId,
                    offer
                });
            }
        } catch (error) {
            console.error('Error creating offer:', error);
        }
    };

    const initializeVideoCall = async () => {
        if (initializationRef.current) return;
        initializationRef.current = true;

        try {
            setIsLoading(true);
            setError(null);

            cleanup();


            await joinCallWithRetry();

            await initializeSocket();

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
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }

            socketRef.current = io(import.meta.env.VITE_API_URL, {
                withCredentials: true,
                transports: ['websocket', 'polling'],
                autoConnect: true,
                forceNew: true,
                timeout: 10000
            });

            socketRef.current.on('connect', () => {
                console.log('Socket connected successfully');
                setIsConnected(true);
                callStartTimeRef.current = new Date();

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
            setTimeout(createOffer, 1000);
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
            setRemoteStream(null);
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
        setIsLoading(false);
        initializationRef.current = false;
        setHasPermissions(false);
        setTimeout(() => {
            checkMediaPermissions();
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

        if (localVideoRef.current) {
            localVideoRef.current.srcObject = null;
        }
        if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = null;
        }

        setIsConnected(false);
        setParticipants([]);
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
                        {!hasPermissions
                            ? 'Requesting camera and microphone access...'
                            : retryCount > 0
                                ? `Retrying connection... (${retryCount}/3)`
                                : 'Connecting to video call...'
                        }
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
                        {error.includes('permission') && (
                            <div className="p-4 bg-amber-500/20 border border-amber-500/40 rounded-lg">
                                <div className="flex items-start space-x-2">
                                    <Settings className="h-5 w-5 text-amber-400 mt-0.5" />
                                    <div className="text-left">
                                        <p className="text-amber-400 font-medium text-sm">To fix this:</p>
                                        <ul className="text-amber-300 text-xs mt-1 space-y-1">
                                            <li>• Click the camera icon in your address bar</li>
                                            <li>• Allow camera and microphone access</li>
                                            <li>• Refresh the page</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}

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
            <div className="absolute top-0 left-0 right-0 z-10 bg-black/50 backdrop-blur-sm p-4">
                <div className="flex items-center justify-between text-white">
                    <div className="flex items-center space-x-4">
                        <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/50">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
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

            <div className="relative w-full h-full flex bg-gray-900">
                <div className="flex-1 relative">
                    {remoteStream ? (
                        <video
                            ref={remoteVideoRef}
                            autoPlay
                            playsInline
                            className="w-full h-full object-cover border-2 border-red-500" // Debug border
                            // Re-assign srcObject on render if ref is current
                            onLoadedMetadata={(e) => {
                                console.log('Remote video metadata loaded');
                                const video = e.target as HTMLVideoElement;
                                video.play().catch(e => console.error('Remote video play failed on metadata load:', e));
                            }}
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center text-white/50 bg-black/40 p-6 rounded-xl backdrop-blur-sm">
                                <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
                                <p className="text-lg font-medium">Waiting for other participant...</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Local Video - Bottom Right Positioning */}
                {/* Local Video - Fixed Positioning */}
                <div className="absolute top-24 right-4 w-32 h-24 md:w-64 md:h-48 z-50 bg-gray-800 rounded-xl overflow-hidden border-2 border-white/20 shadow-2xl transition-all hover:scale-105">
                    <video
                        ref={localVideoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover border-2 border-green-500" // Debug border
                        style={{ transform: 'scaleX(-1)' }}
                        onLoadedMetadata={() => console.log('Local video metadata loaded')}
                    />
                    {!isVideoEnabled && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-800/90 backdrop-blur-sm">
                            <VideoOff className="h-10 w-10 text-white/50" />
                        </div>
                    )}
                </div>
            </div>

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