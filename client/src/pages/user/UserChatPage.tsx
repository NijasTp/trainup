import { useEffect, useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
    Send,
    ArrowLeft,
    MessageSquare,
    AlertCircle,
    Loader2,
    MoreHorizontal,
    Trash2,
    Paperclip,
    Mic,
    X,
    Play,
    StopCircle,
    CheckCircle2
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import API from "@/lib/axios";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import io, { Socket } from 'socket.io-client';
import { debounce } from 'lodash';
import Aurora from "@/components/ui/Aurora";
import { motion, AnimatePresence } from "framer-motion";
import ImageCropper from "@/components/common/ImageCropper";

import type { Message, ChatTrainer as Trainer, UserPlan } from "@/interfaces/user/IUserChat";

export default function ChatPage() {
    const navigate = useNavigate();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [trainer, setTrainer] = useState<Trainer | null>(null);
    const [userPlan, setUserPlan] = useState<UserPlan | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
    const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const socketRef = useRef<Socket | null>(null);

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [imageCaption, setImageCaption] = useState('');
    const [isCropping, setIsCropping] = useState(false);
    const [imageToCrop, setImageToCrop] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [viewImageUrl, setViewImageUrl] = useState<string | null>(null);

    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const [recordingDuration, setRecordingDuration] = useState(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const initializeChat = useCallback(async () => {
        try {
            const planResponse = await API.get("/user/plan");
            const plan = planResponse.data.plan;

            if (!plan || plan.planType === 'basic') {
                setError("Messaging is reserved for Premium & Pro members. Elevate your training to unlock direct access.");
                setIsLoading(false);
                return;
            }

            setUserPlan(plan);

            const trainerResponse = await API.get('/user/my-trainer');
            const trainerData = trainerResponse.data.trainer;

            if (!trainerData) {
                setError("No trainer assigned. Connect with a professional to begin your journey.");
                setIsLoading(false);
                return;
            }

            setTrainer(trainerData);
            const fetchedTrainerId = trainerData._id;

            const messagesResponse = await API.get(`/user/chat/messages/${fetchedTrainerId}`);
            setMessages(messagesResponse.data.messages);

            await API.put(`/user/chat/read/${fetchedTrainerId}`);

            socketRef.current = io(import.meta.env.VITE_API_URL, {
                withCredentials: true,
                transports: ["websocket", "polling"]
            });

            socketRef.current.emit('join_chat', { trainerId: fetchedTrainerId });

            socketRef.current.on('new_message', (message: Message) => {
                setMessages(prev => {
                    if (prev.some(m => m._id === message._id)) return prev;
                    return [...prev, message];
                });
            });

            socketRef.current.on('typing', ({ userId, isTyping }) => {
                if (userId === fetchedTrainerId) {
                    setIsOtherUserTyping(isTyping);
                }
            });

            socketRef.current.on('message_limit_reached', () => {
                toast.error("Message Limit Reached", {
                    description: "Upgrade to Pro for unlimited strategic communication."
                });
            });

            setIsLoading(false);
        } catch (_err: unknown) {
            const errorMessage = _err instanceof Error ? _err.message : "Secure connection failed. Please try again.";
            setError(errorMessage);
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        document.title = "TrainUp - Private Messaging";
        initializeChat();
        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [initializeChat, previewUrl]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const isImage = file.type.startsWith('image/');
            const maxSize = isImage ? 5 * 1024 * 1024 : 25 * 1024 * 1024;
            
            if (file.size > maxSize) {
                toast.error(`File oversized. Limit is ${isImage ? '5MB' : '25MB'}.`);
                return;
            }

            if (!isImage && file.type !== 'application/pdf' && !file.type.startsWith('audio/')) {
                toast.error("Format not supported. Use images, PDFs, or audio.");
                return;
            }

            setSelectedFile(file);

            if (isImage) {
                const reader = new FileReader();
                reader.onload = () => {
                    setImageToCrop(reader.result as string);
                    setIsCropping(true);
                };
                reader.readAsDataURL(file);
            } else {
                // For PDF or Audio (from file picker), show the preview/caption dialog
                setPreviewUrl(file.type === 'application/pdf' ? 'pdf-placeholder' : 'audio-placeholder');
                setIsPreviewOpen(true);
            }
        }
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            chunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            mediaRecorderRef.current.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm;codecs=opus' });
                setAudioBlob(blob);
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
            setRecordingDuration(0);
            timerRef.current = setInterval(() => {
                setRecordingDuration(prev => prev + 1);
            }, 1000);
        } catch (_err: unknown) {
            toast.error("Microphone access required for audio memos.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (timerRef.current) clearInterval(timerRef.current);
        }
    };

    const discardAudio = () => {
        setAudioBlob(null);
        chunksRef.current = [];
        if (isRecording) {
            mediaRecorderRef.current?.stop();
            setIsRecording(false);
            if (timerRef.current) clearInterval(timerRef.current);
        }
    };

    const uploadFile = async (file: File | Blob): Promise<string> => {
        const formData = new FormData();
        if (file instanceof Blob && !(file instanceof File)) {
            formData.append('file', file, 'memo.webm');
        } else {
            formData.append('file', file);
        }

        const response = await API.post('/user/chat/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data.fileUrl;
    };

    const sendMessage = async (blobToSend?: Blob) => {
        const audioToUpload = blobToSend || audioBlob;

        if ((!newMessage.trim() && !selectedFile && !audioToUpload) || !socketRef.current || !trainer) return;

        if (userPlan?.planType === 'premium' && userPlan.messagesLeft <= 0) {
            toast.error("Monthly quota exhausted.");
            return;
        }

        setIsSending(true);
        try {
            let fileUrl = '';
            let messageType: 'text' | 'image' | 'audio' | 'file' = 'text';

            if (selectedFile) {
                fileUrl = await uploadFile(selectedFile);
                if (selectedFile.type.startsWith('image/')) messageType = 'image';
                else if (selectedFile.type.startsWith('audio/')) messageType = 'audio';
                else messageType = 'file';
            } else if (audioToUpload) {
                fileUrl = await uploadFile(audioToUpload);
                messageType = 'audio';
            }

            const messageData = {
                trainerId: trainer._id,
                message: (selectedFile ? imageCaption : newMessage).trim(),
                messageType,
                fileUrl
            };

            socketRef.current.emit('send_message', messageData);

            if (userPlan?.planType === 'premium') {
                setUserPlan(prev => prev ? { ...prev, messagesLeft: Math.max(0, prev.messagesLeft - 1) } : null);
            }

            setNewMessage('');
            setSelectedFile(null);
            setPreviewUrl(null);
            setIsPreviewOpen(false);
            setImageCaption('');
            setAudioBlob(null);
            handleStopTyping();
        } catch (_err: unknown) {
            toast.error("Encryption error. Message not delivered.");
        } finally {
            setIsSending(false);
        }
    };

    const deleteMessage = async (messageId: string) => {
        try {
            await API.delete(`/user/chat/message/${messageId}`);
            setMessages(prev => prev.filter(m => m._id !== messageId));
        } catch (_err: unknown) {
            toast.error("Recall failed.");
        }
    };

    const handleTyping = debounce(() => {
        if (socketRef.current && newMessage.trim()) {
            socketRef.current.emit('typing', { trainerId: trainer?._id, isTyping: true });
        }
    }, 500);

    const handleStopTyping = debounce(() => {
        if (socketRef.current) {
            socketRef.current.emit('typing', { trainerId: trainer?._id, isTyping: false });
        }
    }, 1000);


    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString('en-IN', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) return 'Today';
        if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
        return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    if (isLoading) {
        return (
            <div className="relative h-screen flex flex-col bg-[#030303] text-white overflow-hidden font-outfit">
                <div className="absolute inset-0 z-0">
                    <Aurora colorStops={["#020617", "#0f172a", "#020617"]} amplitude={1.1} blend={0.6} />
                </div>
                <div className="flex-1 flex flex-col items-center justify-center relative z-10 space-y-4">
                    <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                    <p className="text-gray-400 font-bold uppercase tracking-widest animate-pulse">Establishing Secure Uplink...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="relative h-screen flex flex-col bg-[#030303] text-white overflow-hidden font-outfit">
                <div className="absolute inset-0 z-0">
                    <Aurora colorStops={["#020617", "#0f172a", "#020617"]} amplitude={1.1} blend={0.6} />
                </div>
                <div className="flex-1 flex items-center justify-center relative z-10">
                    <div className="text-center space-y-8 p-8 max-w-md">
                        <AlertCircle className="h-20 w-20 mx-auto text-red-500/50" />
                        <div className="space-y-2">
                            <h3 className="text-3xl font-black italic uppercase">Access Denied</h3>
                            <p className="text-gray-400 font-medium leading-relaxed">{error}</p>
                        </div>
                        <Button onClick={() => navigate("/my-trainer")} className="bg-white text-black hover:bg-gray-200 px-8 h-12 rounded-xl font-black italic uppercase tracking-widest text-xs shadow-2xl">
                            <ArrowLeft className="h-4 w-4 mr-2" /> Trainer Portal
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="relative h-screen flex flex-col bg-[#030303] text-white overflow-hidden font-outfit">
            <div className="absolute inset-0 z-0">
                <Aurora colorStops={["#020617", "#0f172a", "#020617"]} amplitude={1.1} blend={0.6} />
            </div>

            {/* Premium Header */}
            <header className="relative z-20 bg-white/5 backdrop-blur-3xl border-b border-white/10 px-4 py-4 md:px-8 shadow-2xl">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => navigate("/my-trainer")} className="hover:bg-white/10 rounded-xl">
                            <ArrowLeft className="h-6 w-6" />
                        </Button>
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <Avatar className="h-12 w-12 ring-2 ring-primary/20 border border-white/10">
                                    <AvatarImage src={trainer?.profileImage} alt={trainer?.name} className="object-cover" />
                                    <AvatarFallback className="bg-primary/20 text-primary font-black italic">{trainer?.name?.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-4 border-[#030303] shadow-lg" />
                            </div>
                            <div>
                                <h2 className="text-lg font-black italic uppercase tracking-tight leading-none">{trainer?.name}</h2>
                                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-1">Personal Strategic Coach</p>
                            </div>
                        </div>
                    </div>

                    <div className="hidden md:flex items-center gap-4">
                        {userPlan && (
                            <div className="flex items-center gap-3">
                                <Badge className={`${userPlan.planType === 'pro' ? 'bg-purple-500/20 text-purple-400 border-purple-500/20' : 'bg-amber-500/20 text-amber-400 border-amber-500/20'} font-black italic uppercase text-[10px] px-3 py-1 rounded-full border`}>
                                    {userPlan.planType} ACCESS
                                </Badge>
                                {userPlan.planType === 'premium' && (
                                    <Badge variant="outline" className="border-white/10 text-gray-400 text-[10px] font-bold py-1 px-3">
                                        {userPlan.messagesLeft} REMAINING
                                    </Badge>
                                )}
                            </div>
                        )}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="hover:bg-white/10 rounded-xl">
                                    <MoreHorizontal className="h-5 w-5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-[#0f172a]/95 backdrop-blur-xl border-white/10 rounded-2xl p-2 min-w-[200px]">
                                <DropdownMenuItem onClick={() => navigate("/my-trainer")} className="rounded-xl hover:bg-white/10 font-bold uppercase text-[10px] tracking-widest py-3">
                                    Coach Profile
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => navigate("/my-trainer/sessions")} className="rounded-xl hover:bg-white/10 font-bold uppercase text-[10px] tracking-widest py-3">
                                    My Training Sessions
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </header>

            {/* Chat Messages */}
            <main className="flex-1 overflow-hidden relative z-10">
                <div className="h-full overflow-y-auto px-4 py-8 md:px-8 space-y-6">
                    {messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-6 p-8 opacity-50">
                            <div className="p-8 bg-white/5 rounded-[3rem] border border-dashed border-white/10">
                                <MessageSquare className="h-16 w-16 mx-auto text-primary mb-4" />
                                <h3 className="text-xl font-black italic uppercase">Initialize Dialogue</h3>
                                <p className="text-gray-400 text-sm font-medium mt-2 max-w-xs">Direct communication with your personal trainer is active. Start sharing your progress.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="max-w-5xl mx-auto space-y-8">
                            {messages.map((message, index) => {
                                const isUser = message.senderType === 'user';
                                const showDate = index === 0 || formatDate(message.createdAt) !== formatDate(messages[index - 1].createdAt);

                                return (
                                    <AnimatePresence key={message._id}>
                                        {showDate && (
                                            <div className="flex justify-center my-8">
                                                <Badge className="bg-white/5 text-gray-400 border-white/10 font-black italic uppercase text-[10px] px-4 py-1.5 rounded-full">
                                                    {formatDate(message.createdAt)}
                                                </Badge>
                                            </div>
                                        )}
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            className={`flex ${isUser ? 'justify-end' : 'justify-start'} group items-end gap-3`}
                                            onMouseEnter={() => isUser && setHoveredMessageId(message._id)}
                                            onMouseLeave={() => isUser && setHoveredMessageId(null)}
                                        >
                                            {!isUser && (
                                                <Avatar className="h-8 w-8 ring-1 ring-white/10 mb-1">
                                                    <AvatarImage src={trainer?.profileImage} />
                                                    <AvatarFallback className="bg-primary/20 text-primary text-[10px] font-black">{trainer?.name?.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                            )}

                                            <div className={`relative flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[85%] md:max-w-[70%]`}>
                                                <div className={`relative overflow-hidden p-4 rounded-3xl shadow-2xl border ${isUser
                                                    ? 'bg-gradient-to-br from-primary to-accent text-black border-transparent rounded-br-[4px]'
                                                    : 'bg-white/5 backdrop-blur-2xl text-white border-white/10 rounded-bl-[4px]'
                                                    }`}>
                                                    
                                                    {message.messageType === 'image' && message.fileUrl && (
                                                        <div className="mb-3 rounded-2xl overflow-hidden border border-black/10">
                                                            <img
                                                                src={message.fileUrl}
                                                                alt="Media"
                                                                className="max-h-72 w-full object-cover cursor-zoom-in hover:scale-105 transition-transform duration-500"
                                                                onClick={() => setViewImageUrl(message.fileUrl || null)}
                                                            />
                                                        </div>
                                                    )}

                                                    {message.messageType === 'audio' && message.fileUrl && (
                                                        <div className={`mb-3 p-4 rounded-2xl flex items-center gap-4 min-w-[240px] ${isUser ? 'bg-black/10' : 'bg-white/5'}`}>
                                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isUser ? 'bg-black/20' : 'bg-primary/20'}`}>
                                                                 <Button 
                                                                variant="ghost" 
                                                                size="icon" 
                                                                className="rounded-full"
                                                                onClick={(e) => {
                                                                    const audio = e.currentTarget.parentElement?.querySelector('audio');
                                                                    if (audio) {
                                                                        if (audio.paused) audio.play();
                                                                        else audio.pause();
                                                                    }
                                                                }}
                                                            >
                                                                <Play className="h-4 w-4" />
                                                            </Button>
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className={`h-1.5 w-full rounded-full ${isUser ? 'bg-black/10' : 'bg-white/10'}`}>
                                                                    <div className={`h-full w-1/3 rounded-full ${isUser ? 'bg-black/40' : 'bg-primary'}`} />
                                                                </div>
                                                                <p className={`text-[10px] mt-2 font-black uppercase tracking-widest ${isUser ? 'text-black/60' : 'text-gray-400'}`}>Audio memo</p>
                                                            </div>
                                                            <audio controls preload="auto" className="hidden" src={message.fileUrl} onPlay={(e) => {
                                                                const audio = e.currentTarget;
                                                                const others = document.querySelectorAll('audio');
                                                                others.forEach(a => { if (a !== audio) a.pause(); });
                                                            }} />
                                                           
                                                        </div>
                                                    )}

                                                    {message.messageType === 'file' && message.fileUrl && (
                                                        <div className={`mb-3 p-4 rounded-2xl flex items-center gap-4 min-w-[240px] ${isUser ? 'bg-black/10' : 'bg-white/5'}`}>
                                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isUser ? 'bg-black/20' : 'bg-primary/20'}`}>
                                                                <Paperclip className={`h-4 w-4 ${isUser ? 'text-black' : 'text-primary'}`} />
                                                            </div>
                                                            <div className="flex-1 overflow-hidden">
                                                                <p className={`text-xs font-bold truncate ${isUser ? 'text-black' : 'text-white'}`}>
                                                                    {message.fileUrl.split('/').pop()?.split('?')[0] || 'Document'}
                                                                </p>
                                                                <p className={`text-[10px] mt-1 font-black uppercase tracking-widest ${isUser ? 'text-black/60' : 'text-gray-400'}`}>PDF Document</p>
                                                            </div>
                                                            <Button 
                                                                variant="ghost" 
                                                                size="sm" 
                                                                className={`rounded-xl ${isUser ? 'hover:bg-black/10' : 'hover:bg-white/10'}`}
                                                                onClick={() => window.open(message.fileUrl, '_blank')}
                                                            >
                                                                View
                                                            </Button>
                                                        </div>
                                                    )}

                                                    {message.message && (
                                                        <p className={`text-sm md:text-base font-bold tracking-tight leading-relaxed italic ${isUser ? 'font-black' : 'font-medium'}`}>
                                                            {message.message}
                                                        </p>
                                                    )}
                                                </div>
                                                
                                                <div className="flex items-center gap-2 mt-2 px-1">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{formatTime(message.createdAt)}</span>
                                                    {isUser && <CheckCircle2 className="h-3 w-3 text-primary opacity-50" />}
                                                </div>

                                                {hoveredMessageId === message._id && isUser && (
                                                    <div className={`absolute -left-10 top-2 opacity-0 group-hover:opacity-100 transition-opacity`}>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10 rounded-full">
                                                                    <MoreHorizontal className="h-4 w-4 text-gray-500" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent className="bg-[#0f172a]/95 backdrop-blur-xl border-white/10 rounded-xl">
                                                                <DropdownMenuItem onClick={() => deleteMessage(message._id)} className="text-red-500 hover:text-red-400 font-bold uppercase text-[10px] tracking-widest">
                                                                    <Trash2 className="h-3 w-3 mr-2" /> Recall Message
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    </AnimatePresence>
                                );
                            })}
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </main>

            {/* Premium Input Bar */}
            <div className="relative z-20 bg-white/5 backdrop-blur-3xl border-t border-white/10 p-4 md:p-8">
                <div className="max-w-5xl mx-auto">
                    {isOtherUserTyping && (
                        <div className="flex items-center gap-2 mb-4 px-2">
                            <div className="flex gap-1">
                                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
                            </div>
                            <span className="text-[10px] font-black italic uppercase tracking-widest text-primary">{trainer?.name} is strategizing...</span>
                        </div>
                    )}

                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileSelect} />
                            <Button 
                                variant="outline" 
                                size="icon" 
                                onClick={() => fileInputRef.current?.click()} 
                                disabled={isSending}
                                className="h-12 w-12 rounded-2xl bg-white/5 border-white/10 hover:bg-white/10 hover:border-primary/30 transition-all"
                            >
                                <Paperclip className="h-5 w-5" />
                            </Button>
                        </div>

                        <div className="flex-1 relative">
                            <Input
                                value={newMessage}
                                onChange={(e) => {
                                    setNewMessage(e.target.value);
                                    handleTyping();
                                }}
                                onBlur={handleStopTyping}
                                onKeyDownCapture={(e) => e.key === 'Enter' && sendMessage()}
                                placeholder="Consult with your strategic coach..."
                                className="h-14 bg-white/5 border-white/10 rounded-2xl px-6 focus:ring-primary/20 focus:border-primary/30 font-bold italic transition-all"
                                disabled={userPlan?.planType === 'premium' && userPlan.messagesLeft <= 0}
                                maxLength={1000}
                            />
                        </div>

                        {newMessage.trim() || audioBlob ? (
                            <Button
                                onClick={() => sendMessage()}
                                disabled={isSending || (userPlan?.planType === 'premium' && userPlan.messagesLeft <= 0)}
                                className="h-14 px-8 rounded-2xl bg-white text-black hover:bg-gray-200 font-black italic uppercase tracking-widest shadow-2xl flex gap-2"
                            >
                                {isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                                    <>
                                        <Send className="h-5 w-5 fill-black" />
                                        {audioBlob && <span className="text-[10px] font-black">SEND VOICE</span>}
                                    </>
                                )}
                            </Button>
                        ) : (
                            <Button
                                variant={isRecording ? "destructive" : "outline"}
                                size="icon"
                                onMouseDown={startRecording}
                                onMouseUp={stopRecording}
                                className={`h-14 w-14 rounded-2xl transition-all shadow-xl ${isRecording ? 'animate-pulse scale-110' : 'bg-primary text-black hover:bg-primary/80 border-transparent'}`}
                            >
                                {isRecording ? <StopCircle className="h-6 w-6" /> : <Mic className={`h-6 w-6 ${!isRecording && 'fill-black'}`} />}
                            </Button>
                        )}
                    </div>

                    {audioBlob && !isRecording && (
                        <div className="flex items-center justify-between mt-4 p-4 bg-primary/10 rounded-2xl border border-primary/20 animate-in fade-in slide-in-from-bottom-1">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                                    <Mic className="h-4 w-4 text-primary fill-primary" />
                                </div>
                                <span className="text-xs font-black uppercase tracking-widest text-primary">Voice Memo Prepared</span>
                            </div>
                            <Button variant="ghost" size="sm" onClick={discardAudio} className="text-red-400 hover:text-red-300 hover:bg-red-500/10 font-bold uppercase text-[10px] tracking-tighter">
                                <Trash2 className="h-4 w-4 mr-2" /> Discard
                            </Button>
                        </div>
                    )}

                    {isRecording && (
                        <div className="absolute inset-0 bg-red-500/95 backdrop-blur-3xl flex items-center justify-between px-8 z-30 animate-in fade-in slide-in-from-bottom-2 duration-300 rounded-t-[3rem]">
                            <div className="flex items-center gap-4">
                                <div className="w-3 h-3 bg-white rounded-full animate-ping" />
                                <span className="font-mono text-xl font-black text-white">{formatDuration(recordingDuration)}</span>
                                <span className="text-xs font-black uppercase tracking-[0.2em] text-white/50">Recording Audio Memo...</span>
                            </div>
                            <Button variant="ghost" onClick={discardAudio} className="text-white hover:bg-white/10 font-black uppercase tracking-widest text-[10px]">
                                <X className="h-4 w-4 mr-2" /> Discard memo
                            </Button>
                        </div>
                    )}

                    {userPlan?.planType === 'premium' && (
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mt-4 text-center">
                            {userPlan.messagesLeft > 0
                                ? `Strategic Uplink: ${userPlan.messagesLeft} TRANSMISSIONS REMAINING`
                                : "ENCRYPTION LIMIT REACHED. UPGRADE TO PRO FOR UNLIMITED STRATEGIC COMMS."
                            }
                        </p>
                    )}
                </div>
            </div>

            {/* Image Preview / Caption Modal */}
            <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                <DialogContent className="bg-[#030303] border-white/10 rounded-[2.5rem] p-8 max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black italic uppercase">Share Performance Media</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6">
                        {previewUrl && (
                            <div className="relative aspect-video w-full overflow-hidden rounded-3xl border border-white/10 bg-white/5 flex items-center justify-center">
                                {selectedFile?.type.startsWith('image/') ? (
                                    <img src={previewUrl} alt="Preview" className="h-full w-full object-contain" />
                                ) : (
                                    <div className="flex flex-col items-center gap-4">
                                        {selectedFile?.type === 'application/pdf' ? (
                                            <Paperclip className="h-16 w-16 text-primary" />
                                        ) : (
                                            <Mic className="h-16 w-16 text-primary" />
                                        )}
                                        <p className="text-sm font-bold text-gray-400">{selectedFile?.name}</p>
                                    </div>
                                )}
                                <Button variant="ghost" size="icon" onClick={() => setIsPreviewOpen(false)} className="absolute top-4 right-4 bg-black/50 backdrop-blur-lg hover:bg-black/70 rounded-full">
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="caption" className="text-[10px] font-black uppercase tracking-widest text-gray-500">Contextual Caption</Label>
                            <Input
                                id="caption"
                                value={imageCaption}
                                onChange={(e) => setImageCaption(e.target.value)}
                                placeholder="Describe this development..."
                                className="h-14 bg-white/5 border-white/10 rounded-2xl px-6 focus:ring-primary/20 focus:border-primary/30 font-bold italic"
                            />
                        </div>
                    </div>
                    <DialogFooter className="gap-4 pt-4">
                        <Button variant="outline" onClick={() => setIsPreviewOpen(false)} className="h-12 flex-1 rounded-xl font-black uppercase text-[10px] border-white/10">Abort</Button>
                        <Button onClick={() => sendMessage()} disabled={isSending} className="h-12 flex-1 bg-white text-black hover:bg-gray-200 rounded-xl font-black italic uppercase tracking-widest text-[10px]">
                            {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Transmit Media"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Image Full Size Viewer */}
            <Dialog open={!!viewImageUrl} onOpenChange={(open) => !open && setViewImageUrl(null)}>
                <DialogContent className="max-w-7xl w-[95vw] h-[90vh] p-0 bg-black/95 border-none shadow-none flex items-center justify-center overflow-hidden rounded-[3rem]">
                    <div className="relative w-full h-full flex items-center justify-center p-8">
                        {viewImageUrl && (
                            <img src={viewImageUrl} alt="Full Resolution" className="max-w-full max-h-full object-contain shadow-2xl" />
                        )}
                        <Button onClick={() => setViewImageUrl(null)} variant="ghost" size="icon" className="absolute top-8 right-8 bg-white/10 backdrop-blur-3xl hover:bg-white/20 rounded-full w-12 h-12">
                            <X className="h-6 w-6" />
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {isCropping && imageToCrop && (
                <ImageCropper
                    image={imageToCrop}
                    aspectRatio={4 / 4}
                    onCropComplete={(croppedBlob) => {
                        const croppedFile = new File([croppedBlob], selectedFile?.name || 'cropped.jpg', { type: 'image/jpeg' });
                        setSelectedFile(croppedFile);
                        setPreviewUrl(URL.createObjectURL(croppedBlob));
                        setIsCropping(false);
                        setImageToCrop(null);
                        setIsPreviewOpen(true);
                    }}
                    onCancel={() => {
                        setIsCropping(false);
                        setImageToCrop(null);
                        setSelectedFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                />
            )}
        </div>
    );
}