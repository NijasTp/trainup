import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
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
    Mic
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import API from "@/lib/axios";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import io, { Socket } from 'socket.io-client';
import { debounce } from 'lodash';

interface Message {
    _id: string;
    senderId: string;
    receiverId: string;
    message: string;
    createdAt: string;
    senderType: 'user' | 'trainer';
    messageType: 'text' | 'image' | 'audio';
    fileUrl?: string;
}

interface Client {
    _id: string;
    name: string;
    profileImage?: string;
    trainerPlan: 'basic' | 'premium' | 'pro';
}

export default function TrainerChatPage() {
    const { clientId } = useParams<{ clientId: string }>();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [client, setClient] = useState<Client | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
    const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const socketRef = useRef<Socket | null>(null);

    // Media State
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [imageCaption, setImageCaption] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Lightbox State
    const [viewImageUrl, setViewImageUrl] = useState<string | null>(null);

    // Audio State
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const [recordingDuration, setRecordingDuration] = useState(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const [shouldSendAudio, setShouldSendAudio] = useState(false);

    useEffect(() => {
        document.title = "TrainUp - Chat with Client";
        console.log('Initializing chat with clientId:', clientId);
        initializeChat();
        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                console.log('Socket disconnected for client:', clientId);
            }
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [clientId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOtherUserTyping]);

    useEffect(() => {
        if (shouldSendAudio && audioBlob) {
            sendMessage(audioBlob);
            setShouldSendAudio(false);
        }
    }, [audioBlob, shouldSendAudio]);

    const initializeChat = async () => {
        try {
            const clientResponse = await API.get(`/trainer/client/${clientId}`);
            const clientData = clientResponse.data.client;
            console.log('Client Data:', clientData);

            if (!clientData?.trainerPlan || clientData.trainerPlan === 'basic') {
                setError("This client doesn't have chat access. They need Premium or Pro plan.");
                setIsLoading(false);
                return;
            }

            setClient(clientData);

            const messagesResponse = await API.get(`/trainer/chat/messages/${clientId}`);
            setMessages(messagesResponse.data.messages);

            socketRef.current = io(import.meta.env.VITE_API_URL, {
                withCredentials: true,
                transports: ['websocket', 'polling']
            });

            socketRef.current.emit('join_chat', { clientId });
            console.log('Emitted join_chat for client:', clientId);

            socketRef.current.on('new_message', (message: Message) => {
                console.log('Received new_message:', message);
                setMessages(prev => {
                    if (prev.some(m => m._id === message._id)) {
                        return prev;
                    }
                    return [...prev, message];
                });
            });

            socketRef.current.on('typing', ({ userId, isTyping }) => {
                console.log('Typing event received:', { userId, isTyping, clientId });
                if (userId === clientId) {
                    setIsOtherUserTyping(isTyping);
                    console.log(`Client ${clientId} ${isTyping ? 'is' : 'stopped'} typing`);
                } else {
                    console.log(`Ignoring typing event: userId ${userId} does not match clientId ${clientId}`);
                }
            });

            socketRef.current.on('connect', () => {
                console.log('Trainer socket connected successfully');
                socketRef.current?.emit('join_chat', { clientId }); // Re-join room on reconnect
            });

            socketRef.current.on('connect_error', (err) => {
                console.error('Trainer socket connect error:', err);
                toast.error('Chat connection failed');
            });

            socketRef.current.on('error', ({ message }: { message: string }) => {
                console.log('Socket error:', message);
                toast.error(message);
            });

            setIsLoading(false);
        } catch (err: any) {
            console.error("Failed to initialize chat:", err);
            setError(err.response?.data?.message || "Failed to load chat");
            setIsLoading(false);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                toast.error("File size should be less than 5MB");
                return;
            }
            if (!file.type.startsWith('image/')) {
                toast.error("Only image files are allowed");
                return;
            }
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setIsPreviewOpen(true);
        }
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            chunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorderRef.current.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                setAudioBlob(blob);
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
            setRecordingDuration(0);
            timerRef.current = setInterval(() => {
                setRecordingDuration(prev => prev + 1);
            }, 1000);
        } catch (err) {
            console.error("Error accessing microphone:", err);
            toast.error("Could not access microphone");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        }
    };

    const cancelRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
            setAudioBlob(null);
            chunksRef.current = [];
        }
    };

    const uploadFile = async (file: File | Blob): Promise<string> => {
        const formData = new FormData();
        // If it's a Blob (audio), give it a filename
        if (file instanceof Blob && !(file instanceof File)) {
            formData.append('file', file, 'audio.webm');
        } else {
            formData.append('file', file);
        }
        const response = await API.post('/trainer/chat/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data.fileUrl;
    };

    const handleTyping = debounce(() => {
        if (socketRef.current && newMessage.trim()) {
            socketRef.current.emit('typing', { clientId, isTyping: true });
            console.log('Emitted typing: true for client:', clientId);
        }
    }, 500);

    const handleStopTyping = debounce(() => {
        if (socketRef.current) {
            socketRef.current.emit('typing', { clientId, isTyping: false });
            console.log('Emitted typing: false for client:', clientId);
        }
    }, 1000);

    const sendMessage = async (blobToSend?: Blob) => {
        const audioToUpload = blobToSend || audioBlob;

        if ((!newMessage.trim() && !selectedFile && !audioToUpload) || !socketRef.current || !client) return;

        if (newMessage.length > 1000) {
            toast.error("Message cannot exceed 1000 characters");
            return;
        }

        setIsSending(true);
        try {
            let fileUrl = '';
            let messageType: 'text' | 'image' | 'audio' = 'text';

            if (selectedFile) {
                fileUrl = await uploadFile(selectedFile);
                messageType = 'image';
            } else if (audioToUpload) {
                fileUrl = await uploadFile(audioToUpload);
                messageType = 'audio';
            }

            const messageData = {
                clientId: client._id,
                message: (selectedFile ? imageCaption : newMessage).trim(),
                messageType,
                fileUrl
            };

            socketRef.current.emit('send_message_trainer', messageData);
            console.log('Emitted send_message_trainer:', messageData);

            // Reset state
            setNewMessage('');
            setSelectedFile(null);
            setPreviewUrl(null);
            setIsPreviewOpen(false);
            setImageCaption('');
            setAudioBlob(null);
            handleStopTyping();
        } catch (err: any) {
            console.error("Failed to send message:", err);
            toast.error("Failed to send message");
        } finally {
            setIsSending(false);
        }
    };

    const deleteMessage = async (messageId: string) => {
        try {
            await API.delete(`/trainer/chat/message/${messageId}`);
            setMessages(prev => prev.filter(m => m._id !== messageId));
            toast.success("Message deleted");
        } catch (err: any) {
            console.error("Failed to delete message:", err);
            toast.error("Failed to delete message");
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString('en-US', {
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

        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
        }
    };

    const getPlanColor = (plan: string) => {
        switch (plan) {
            case 'premium':
                return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
            case 'pro':
                return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
            default:
                return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
        }
    };

    if (isLoading) {
        return (
            <div className="h-screen flex flex-col bg-background">
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center space-y-4">
                        <div className="relative">
                            <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                        </div>
                        <p className="text-muted-foreground font-medium">Loading chat...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-screen flex flex-col bg-background">
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center space-y-6 p-8">
                        <AlertCircle className="h-16 w-16 mx-auto text-destructive/50" />
                        <div className="space-y-2">
                            <h3 className="text-2xl font-bold">Chat Unavailable</h3>
                            <p className="text-muted-foreground">{error}</p>
                        </div>
                        <Link to={`/trainer/user/${clientId}`}>
                            <Button>
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Client
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col bg-background">
            {/* Fixed Header */}
            <div className="border-b bg-card/50 backdrop-blur-sm">
                <div className="flex items-center justify-between p-4">
                    <div className="flex items-center space-x-3">
                        <Link to={`/trainer/user/${clientId}`}>
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <Avatar className="h-10 w-10">
                            <AvatarImage
                                src={client?.profileImage || "/placeholder.svg"}
                                alt={client?.name || "Client"}
                            />
                            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                {client?.name?.charAt(0) || "C"}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <h2 className="font-semibold">{client?.name || "Client"}</h2>
                            <p className="text-sm text-muted-foreground">Your Client</p>
                        </div>
                    </div>

                    {client && (
                        <Badge className={`${getPlanColor(client.trainerPlan)}`}>
                            {client.trainerPlan.charAt(0).toUpperCase() + client.trainerPlan.slice(1)}
                        </Badge>
                    )}
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-hidden">
                <div className="h-full overflow-y-auto p-4 space-y-4">
                    {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <MessageSquare className="h-16 w-16 text-muted-foreground/30 mb-4" />
                            <p className="text-muted-foreground">No messages yet</p>
                            <p className="text-sm text-muted-foreground/60 mt-1">
                                Start a conversation with your client!
                            </p>
                        </div>
                    ) : (
                        messages.map((message, index) => {
                            const isTrainer = message.senderType === 'trainer';
                            const showDate = index === 0 ||
                                formatDate(message.createdAt) !== formatDate(messages[index - 1].createdAt);

                            return (
                                <div
                                    key={message._id}
                                    className={`flex ${isTrainer ? 'justify-end' : 'justify-start'}`}
                                    onMouseEnter={() => isTrainer && setHoveredMessageId(message._id)}
                                    onMouseLeave={() => isTrainer && setHoveredMessageId(null)}
                                >
                                    {showDate && (
                                        <div className="text-center py-2 w-full">
                                            <Badge variant="outline" className="text-xs">
                                                {formatDate(message.createdAt)}
                                            </Badge>
                                        </div>
                                    )}

                                    <div className={`relative max-w-[70%] rounded-2xl p-3 break-words ${isTrainer
                                            ? 'bg-primary text-primary-foreground ml-auto'
                                            : 'bg-muted text-foreground mr-auto'
                                        }`}>

                                        <div className="flex flex-col items-center">
                                            {message.messageType === 'image' && message.fileUrl && (
                                                <div className="mb-2 w-full">
                                                    <img
                                                        src={message.fileUrl}
                                                        alt="Shared image"
                                                        className="rounded-lg max-h-60 w-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                                        onClick={() => setViewImageUrl(message.fileUrl || null)}
                                                    />
                                                </div>
                                            )}

                                            {message.messageType === 'audio' && message.fileUrl && (
                                                <div className="mb-2 min-w-[200px] w-full">
                                                    <audio controls src={message.fileUrl} className="w-full h-8" />
                                                </div>
                                            )}

                                            {message.message && (
                                                <p className="text-sm break-words w-full text-left">{message.message}</p>
                                            )}
                                        </div>

                                        <p className={`text-xs mt-1 text-right ${isTrainer ? 'text-primary-foreground/70' : 'text-muted-foreground'
                                            }`}>
                                            {formatTime(message.createdAt)}
                                        </p>

                                        {/* Three dots menu */}
                                        {hoveredMessageId === message._id && isTrainer && (
                                            <div className={`absolute top-2 ${isTrainer ? '-left-8' : '-right-8'}`}>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-6 w-6 bg-background/80 hover:bg-background shadow-sm"
                                                        >
                                                            <MoreHorizontal className="h-3 w-3" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem
                                                            onClick={() => deleteMessage(message._id)}
                                                            className="text-destructive focus:text-destructive"
                                                        >
                                                            <Trash2 className="h-4 w-4 mr-2" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Fixed Footer */}
            <div className="border-t bg-card/50 backdrop-blur-sm p-4">
                {isOtherUserTyping && (
                    <p className="text-xs text-muted-foreground mb-2 animate-pulse" style={{ minHeight: '1rem' }}>
                        {client?.name || "Client"} is typing...
                    </p>
                )}

                {/* Audio Recording UI */}
                {isRecording ? (
                    <div className="flex items-center space-x-4 bg-muted/50 p-2 rounded-lg mb-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                        <span className="text-sm font-medium">{formatDuration(recordingDuration)}</span>
                        <div className="flex-1" />
                        <Button variant="ghost" size="sm" onClick={cancelRecording}>
                            Cancel
                        </Button>
                        <Button size="sm" onClick={() => {
                            setShouldSendAudio(true);
                            stopRecording();
                        }}>
                            <Send className="h-4 w-4 mr-2" />
                            Send
                        </Button>
                    </div>
                ) : (
                    <div className="flex space-x-2">
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileSelect}
                        />
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isSending}
                        >
                            <Paperclip className="h-4 w-4" />
                        </Button>

                        <Input
                            value={newMessage}
                            onChange={(e) => {
                                setNewMessage(e.target.value);
                                handleTyping();
                            }}
                            onBlur={handleStopTyping}
                            placeholder="Type your message..."
                            className="flex-1"
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    sendMessage();
                                }
                            }}
                            maxLength={1000}
                        />

                        {newMessage.trim() ? (
                            <Button
                                onClick={() => sendMessage()}
                                disabled={isSending}
                                size="icon"
                            >
                                {isSending ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Send className="h-4 w-4" />
                                )}
                            </Button>
                        ) : (
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={startRecording}
                                disabled={isSending}
                            >
                                <Mic className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                )}

                {client?.trainerPlan === 'premium' && (
                    <p className="text-xs text-muted-foreground mt-2">
                        Chatting with {client?.name || "Client"} ({client?.trainerPlan} plan)
                    </p>
                )}
            </div>

            {/* Image Preview Modal */}
            <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Send Image</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        {previewUrl && (
                            <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-muted">
                                <img
                                    src={previewUrl}
                                    alt="Preview"
                                    className="h-full w-full object-contain"
                                />
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="caption">Caption (optional)</Label>
                            <Input
                                id="caption"
                                value={imageCaption}
                                onChange={(e) => setImageCaption(e.target.value)}
                                placeholder="Add a caption..."
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={() => sendMessage()} disabled={isSending}>
                            {isSending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <Send className="mr-2 h-4 w-4" />
                                    Send
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Image Lightbox (Viewing) */}
            <Dialog open={!!viewImageUrl} onOpenChange={(open) => !open && setViewImageUrl(null)}>
                <DialogContent className="max-w-4xl w-full h-[90vh] p-0 bg-transparent border-none shadow-none flex items-center justify-center">
                    <div className="relative w-full h-full flex items-center justify-center">
                        {viewImageUrl && (
                            <img
                                src={viewImageUrl}
                                alt="Full size"
                                className="max-w-full max-h-full object-contain rounded-lg"
                            />
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}