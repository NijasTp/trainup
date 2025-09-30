import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Send,
    ArrowLeft,
    MessageSquare,
    AlertCircle,
    Loader2,
    MoreHorizontal,
    Trash2
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
}

interface Trainer {
    _id: string;
    name: string;
    profileImage?: string;
}

interface UserPlan {
    messagesLeft: number;
    planType: 'basic' | 'premium' | 'pro';
}

export default function ChatPage() {
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

    useEffect(() => {
        document.title = "TrainUp - Chat";
        initializeChat();
        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const initializeChat = async () => {
        try {
            // Check user plan first
            const planResponse = await API.get("/user/plan");
            const plan = planResponse.data.plan;

            if (!plan || plan.planType === 'basic') {
                setError("Chat is not available with Basic plan. Please upgrade to Premium or Pro");
                setIsLoading(false);
                return;
            }

            setUserPlan(plan);

            const trainerResponse = await API.get('/user/my-trainer');
            const trainerData = trainerResponse.data.trainer;

            if (!trainerData) {
                setError("No trainer assigned. Please contact support.");
                setIsLoading(false);
                return;
            }

            setTrainer(trainerData);
            const fetchedTrainerId = trainerData._id;

            const messagesResponse = await API.get(`/user/chat/messages/${fetchedTrainerId}`);
            setMessages(messagesResponse.data.messages);

            socketRef.current = io(import.meta.env.VITE_API_URL, {
                withCredentials: true,   
                transports: ["websocket"]
            });

            socketRef.current.emit('join_chat', { trainerId: fetchedTrainerId });

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
                console.log('Typing event received:', { userId, isTyping });
                if (userId === fetchedTrainerId) {
                    setIsOtherUserTyping(isTyping);
                }
            });

            socketRef.current.on('message_limit_reached', () => {
                toast.error("You've reached your monthly message limit. Upgrade to Pro for unlimited messages.");
            });

            socketRef.current.on('error', ({ message }: { message: string }) => {
                console.log('Socket error:', message);
                toast.error(message);
            });

            socketRef.current.on('connect_error', (err) => {
                console.error('Socket connect error:', err);
                toast.error('Chat connection failed');
            });
            setIsLoading(false);
        } catch (err: any) {
            console.error("Failed to initialize chat:", err);
            setError(err.response?.data?.message || "Failed to load chat. Please ensure you have an assigned trainer.");
            setIsLoading(false);
        }
    };

    const sendMessage = async () => {
        if (!newMessage.trim() || !socketRef.current || !trainer) return;

        if (userPlan?.planType === 'premium' && userPlan.messagesLeft <= 0) {
            toast.error("You've reached your monthly message limit. Upgrade to Pro for unlimited messages.");
            return;
        }

        setIsSending(true);
        try {
            const messageData = {
                trainerId: trainer._id,
                message: newMessage.trim()
            };

            socketRef.current.emit('send_message', messageData);
            setNewMessage('');
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
            await API.delete(`/user/chat/message/${messageId}`);
            setMessages(prev => prev.filter(m => m._id !== messageId));
            toast.success("Message deleted");
        } catch (err: any) {
            console.error("Failed to delete message:", err);
            toast.error("Failed to delete message");
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
                        <Link to="/my-trainer/profile">
                            <Button>
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Trainer Profile
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
                        <Link to="/my-trainer/profile">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <Avatar className="h-10 w-10">
                            <AvatarImage
                                src={trainer?.profileImage || "/placeholder.svg"}
                                alt={trainer?.name}
                            />
                            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                {trainer?.name?.charAt(0)}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <h2 className="font-semibold">{trainer?.name}</h2>
                            <p className="text-sm text-muted-foreground">Your Trainer</p>
                        </div>
                    </div>

                    {userPlan && (
                        <div className="flex items-center space-x-2">
                            <Badge variant={userPlan.planType === 'premium' ? 'secondary' : 'default'}>
                                {userPlan.planType.charAt(0).toUpperCase() + userPlan.planType.slice(1)}
                            </Badge>
                            {userPlan.planType === 'premium' && (
                                <Badge variant="outline" className="text-xs">
                                    {userPlan.messagesLeft} left
                                </Badge>
                            )}
                        </div>
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
                                Start a conversation with your trainer!
                            </p>
                        </div>
                    ) : (
                        messages.map((message, index) => {
                            const isUser = message.senderType === 'user';
                            const showDate = index === 0 ||
                                formatDate(message.createdAt) !== formatDate(messages[index - 1].createdAt);

                            return (
                                <div 
                                    key={message._id}
                                    className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                                    onMouseEnter={() => isUser && setHoveredMessageId(message._id)}
                                    onMouseLeave={() => isUser && setHoveredMessageId(null)}
                                >
                                    {showDate && (
                                        <div className="text-center py-2 w-full">
                                            <Badge variant="outline" className="text-xs">
                                                {formatDate(message.createdAt)}
                                            </Badge>
                                        </div>
                                    )}

                                    <div className={`relative max-w-[70%] rounded-2xl p-3 ${isUser
                                        ? 'bg-primary text-primary-foreground ml-auto'
                                        : 'bg-muted text-foreground mr-auto'
                                    }`}>
                                        <p className="text-sm break-words">{message.message}</p>
                                        <p className={`text-xs mt-1 ${isUser ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                                            {formatTime(message.createdAt)}
                                        </p>
                                        
                                        {/* Three dots menu */}
                                        {hoveredMessageId === message._id && isUser && (
                                            <div className={`absolute top-2 ${isUser ? '-left-8' : '-right-8'}`}>
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
                    <p className="text-xs text-muted-foreground mb-2 animate-pulse">
                        {trainer?.name} is typing...
                    </p>
                )}
                <div className="flex space-x-2">
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
                        disabled={userPlan?.planType === 'premium' && userPlan.messagesLeft <= 0}
                    />
                    <Button
                        onClick={sendMessage}
                        disabled={!newMessage.trim() || isSending || (userPlan?.planType === 'premium' && userPlan.messagesLeft <= 0)}
                        size="icon"
                    >
                        {isSending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Send className="h-4 w-4" />
                        )}
                    </Button>
                </div>
                {userPlan?.planType === 'premium' && (
                    <p className="text-xs text-muted-foreground mt-2">
                        {userPlan.messagesLeft > 0
                            ? `${userPlan.messagesLeft} messages remaining this month`
                            : "Message limit reached. Upgrade to Pro for unlimited messages."
                        }
                    </p>
                )}
            </div>
        </div>
    );
}