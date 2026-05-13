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
    Mic,
    Play
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
import type { Client, Message } from "@/interfaces/trainer/ITrainerChat";
import io, { Socket } from 'socket.io-client';
import { debounce } from 'lodash';
import ImageCropper from "@/components/common/ImageCropper";

export default function TrainerChatPage() {
    const { clientId } = useParams<{ clientId: string }>();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [client, setClient] = useState<Client | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
    const [userPlan, setUserPlan] = useState<any>(null);
    const isExpired = userPlan ? new Date(userPlan.expiryDate) < new Date() : false;
    const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const socketRef = useRef<Socket | null>(null);

    // Media State
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [imageCaption, setImageCaption] = useState('');
    const [isCropping, setIsCropping] = useState(false);
    const [imageToCrop, setImageToCrop] = useState<string | null>(null);
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
    const shouldSendRef = useRef(false);

    useEffect(() => {
        document.title = "TrainUp - Chat with Client";
        initializeChat();
        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [clientId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOtherUserTyping]);



    const initializeChat = async () => {
        try {
            const clientResponse = await API.get(`/trainer/client/${clientId}`);
            const clientData = clientResponse.data.client;

            if (!clientData?.trainerPlan || clientData.trainerPlan === 'basic') {
                setError("This client doesn't have chat access. They need Premium or Pro plan.");
                setIsLoading(false);
                return;
            }

            setClient(clientData);

            try {
                const planResponse = await API.get(`/trainer/user-plan/${clientId}`);
                setUserPlan(planResponse.data.plan);
            } catch (planErr) {
                // Silently handle plan fetch error
            }

            // Fetch messages, but handle 402 (payment required/expired) specifically
            try {
                const messagesResponse = await API.get(`/trainer/chat/messages/${clientId}`);
                setMessages(messagesResponse.data.messages);
            } catch (msgErr: any) {
                if (msgErr.response?.status === 402) {
                    setMessages([]); // Ensure messages are cleared or kept empty
                } else {
                    throw msgErr; // Re-throw other errors to be caught by main catch
                }
            }

            // Mark messages as read
            try {
                await API.put(`/trainer/chat/read/${clientId}`);
            } catch (readErr) {
                // Silently handle read marking error
            }

            socketRef.current = io(import.meta.env.VITE_API_URL, {
                withCredentials: true,
                transports: ['websocket', 'polling']
            });

            socketRef.current.emit('join_chat', { clientId });

            socketRef.current.on('new_message', (message: Message) => {
                setMessages(prev => {
                    if (prev.some(m => m._id === message._id)) {
                        return prev;
                    }
                    return [...prev, message];
                });
            });

            socketRef.current.on('typing', ({ userId, isTyping }) => {
                if (userId === clientId) {
                    setIsOtherUserTyping(isTyping);
                }
            });

            socketRef.current.on('connect', () => {
                socketRef.current?.emit('join_chat', { clientId }); // Re-join room on reconnect
            });

            socketRef.current.on('connect_error', () => {
                toast.error('Chat connection failed');
            });

            socketRef.current.on('error', ({ message }: { message: string }) => {
                toast.error(message);
            });

            setIsLoading(false);
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to load chat");
            setIsLoading(false);
        }
    };

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
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorderRef.current.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm;codecs=opus' });
                setAudioBlob(blob);
                if (shouldSendRef.current) {
                    sendMessage(blob);
                    shouldSendRef.current = false;
                }
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
            setRecordingDuration(0);
            timerRef.current = setInterval(() => {
                setRecordingDuration(prev => prev + 1);
            }, 1000);
        } catch (err) {
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
        }
    }, 500);

    const handleStopTyping = debounce(() => {
        if (socketRef.current) {
            socketRef.current.emit('typing', { clientId, isTyping: false });
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
                clientId: client._id,
                message: (selectedFile ? imageCaption : newMessage).trim(),
                messageType,
                fileUrl
            };

            socketRef.current.emit('send_message_trainer', messageData);

            // Reset state
            setNewMessage('');
            setSelectedFile(null);
            setPreviewUrl(null);
            setIsPreviewOpen(false);
            setImageCaption('');
            setAudioBlob(null);
            handleStopTyping();
        } catch (err: any) {
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
                          <div className="flex items-center gap-2">
                              <Badge className={`${getPlanColor(client.trainerPlan)}`}>
                                  {client.trainerPlan.charAt(0).toUpperCase() + client.trainerPlan.slice(1)}
                              </Badge>
                              {isExpired && (
                                  <Badge className="bg-red-500 hover:bg-red-600 text-white border-red-500/20 animate-pulse">
                                      Expired
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
                                                  <div className={`mb-2 min-w-[200px] w-full flex items-center gap-2 p-2 rounded-xl ${isTrainer ? 'bg-primary-foreground/10' : 'bg-background/10'}`}>
                                                      <Button 
                                                          variant="ghost" 
                                                          size="icon" 
                                                          className="h-8 w-8 rounded-full"
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
                                                      <div className="flex-1 h-1 bg-current/20 rounded-full" />
                                                      <audio controls src={message.fileUrl} className="hidden" onPlay={(e) => {
                                                          const audio = e.currentTarget;
                                                          const others = document.querySelectorAll('audio');
                                                          others.forEach(a => { if (a !== audio) a.pause(); });
                                                      }} />
                                                  </div>
                                              )}
  
                                              {message.messageType === 'file' && message.fileUrl && (
                                                  <div className={`mb-2 min-w-[200px] w-full flex items-center gap-3 p-3 rounded-xl border ${isTrainer ? 'bg-primary-foreground/10 border-primary-foreground/20' : 'bg-background/10 border-foreground/10'}`}>
                                                      <Paperclip className="h-5 w-5" />
                                                      <div className="flex-1 overflow-hidden">
                                                          <p className="text-xs font-bold truncate">
                                                              {message.fileUrl.split('/').pop()?.split('?')[0] || 'Document'}
                                                          </p>
                                                          <p className="text-[10px] opacity-70">PDF Document</p>
                                                      </div>
                                                      <Button 
                                                          variant="ghost" 
                                                          size="sm" 
                                                          className="h-8 rounded-lg"
                                                          onClick={() => window.open(message.fileUrl, '_blank')}
                                                      >
                                                          View
                                                      </Button>
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
                      <div className="flex items-center space-x-4 bg-red-500/10 p-3 rounded-2xl mb-2 border border-red-500/20 animate-in fade-in slide-in-from-bottom-2 duration-300">
                          <div className="relative flex items-center justify-center">
                              <div className="absolute w-4 h-4 bg-red-500 rounded-full animate-ping opacity-75" />
                              <div className="relative w-3 h-3 bg-red-500 rounded-full" />
                          </div>
                          <span className="text-sm font-bold font-mono text-red-500">{formatDuration(recordingDuration)}</span>
                          <div className="flex-1" />
                          <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={cancelRecording}
                              className="text-muted-foreground hover:text-white hover:bg-white/5"
                          >
                              Cancel
                          </Button>
                          <Button 
                              size="sm" 
                              onClick={() => {
                                  shouldSendRef.current = true;
                                  stopRecording();
                              }}
                              className="bg-red-500 hover:bg-red-600 text-white font-bold px-4"
                          >
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
                              disabled={isSending || isExpired}
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
                              placeholder={isExpired ? "Subscription expired - cannot send messages" : "Type your message..."}
                              className="flex-1"
                              disabled={isExpired}
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
                                  disabled={isSending || isExpired}
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
                                  disabled={isSending || isExpired}
                              >
                                  <Mic className="h-4 w-4" />
                              </Button>
                          )}
                      </div>
                  )}
  
                  {client?.trainerPlan === 'premium' && (
                      <p className={`text-xs mt-2 ${isExpired ? 'text-red-500 font-semibold' : 'text-muted-foreground'}`}>
                          {isExpired ? "Subscription Expired" : `Chatting with ${client?.name || "Client"} (${client?.trainerPlan} plan)`}
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
                              <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-muted flex items-center justify-center">
                                  {selectedFile?.type.startsWith('image/') ? (
                                      <img
                                          src={previewUrl}
                                          alt="Preview"
                                          className="h-full w-full object-contain"
                                      />
                                  ) : (
                                      <div className="flex flex-col items-center gap-3">
                                          {selectedFile?.type === 'application/pdf' ? (
                                              <Paperclip className="h-12 w-12 text-primary" />
                                          ) : (
                                              <Mic className="h-12 w-12 text-primary" />
                                          )}
                                          <p className="text-sm font-medium text-muted-foreground">{selectedFile?.name}</p>
                                      </div>
                                  )}
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
                                  alt="View image"
                                  className="max-w-full max-h-full object-contain rounded-lg"
                              />
                          )}
                      </div>
                  </DialogContent>
              </Dialog>
  
              {/* Image Cropper */}
              <ImageCropper
                  image={imageToCrop}
                  isOpen={isCropping}
                  onClose={() => {
                      setIsCropping(false);
                      setImageToCrop(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  onCropComplete={(croppedFile) => {
                      setSelectedFile(croppedFile);
                      setPreviewUrl(URL.createObjectURL(croppedFile));
                      setIsCropping(false);
                      setImageToCrop(null);
                      setIsPreviewOpen(true);
                  }}
              />
          </div>
      );
  }