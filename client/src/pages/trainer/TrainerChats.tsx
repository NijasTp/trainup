import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "@/lib/axios";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, MessageSquare, ArrowRight, Sparkles } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import TrainerSiteHeader from "@/components/trainer/general/TrainerHeader";
import { SiteFooter } from "@/components/user/home/UserSiteFooter";
import Aurora from "@/components/ui/Aurora";

interface Conversation {
    partnerId: string;
    lastMessage: {
        message: string;
        createdAt: string;
        senderId: string;
        readStatus: boolean;
        messageType: string;
    };
    unreadCount: number;
    userDetails?: {
        name: string;
        profileImage: string;
    };
}

export default function TrainerChats() {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        document.title = "TrainUp - Messages";
        fetchConversations();
    }, []);

    const fetchConversations = async () => {
        try {
            const response = await API.get("/trainer/chats");
            setConversations(response.data.conversations);
        } catch (error) {
            console.error("Failed to fetch conversations:", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col justify-center items-center bg-[#050505] text-white">
                <div className="space-y-4 text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-cyan-500 mx-auto" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 italic">Accessing secure channel...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-[#050505] text-white overflow-hidden relative">
            {/* Ambient Aurora Canvas Background */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
                <Aurora colorStops={["#00f2fe", "#4facfe", "#00f2fe"]} />
            </div>

            {/* Glowing radial background accent */}
            <div className="absolute -left-[10%] top-[-10%] w-[50%] h-[50%] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none z-0" />
            <div className="absolute -right-[10%] bottom-[10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none z-0" />

            <div className="relative z-10 flex flex-col min-h-screen">
                <TrainerSiteHeader />

                <main className="flex-1 container max-w-4xl mx-auto py-16 px-6 space-y-12">
                    {/* Header */}
                    <div className="space-y-2">
                        <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase flex items-center gap-4">
                            <MessageSquare className="w-10 h-10 text-cyan-500" /> Client <span className="text-cyan-400">Messages</span>
                        </h1>
                        <p className="text-gray-500 font-bold uppercase tracking-[0.2em] text-[10px] italic">
                            Secure Client Comms Portal
                        </p>
                    </div>

                    {conversations.length === 0 ? (
                        <Card className="bg-white/[0.02] backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-12 text-center overflow-hidden relative group">
                            <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/[0.02] to-transparent pointer-events-none" />
                            <CardContent className="flex flex-col items-center justify-center p-0 space-y-6">
                                <div className="h-20 w-20 rounded-3xl bg-cyan-500/5 flex items-center justify-center text-cyan-400 border border-cyan-500/10 shadow-2xl relative">
                                    <div className="absolute inset-0 rounded-3xl bg-cyan-500/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <MessageSquare className="h-10 w-10 relative z-10" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-black text-white italic uppercase tracking-tight">No conversations yet</h3>
                                    <p className="text-gray-500 font-medium max-w-md text-xs uppercase tracking-wider leading-relaxed">
                                        Commence communication with your trainees from your{" "}
                                        <Link to="/trainer/clients" className="text-cyan-400 hover:text-cyan-300 underline font-black">
                                            Client Directory
                                        </Link>.
                                    </p>
                                </div>
                                <Button 
                                    onClick={() => navigate('/trainer/clients')}
                                    className="bg-cyan-500 hover:bg-cyan-400 text-black font-black italic uppercase rounded-2xl h-14 px-8 shadow-lg shadow-cyan-500/20 hover:scale-[1.02] transition-all text-xs"
                                >
                                    Launch Client Directory
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {conversations.map((chat) => {
                                const partner = chat.userDetails;
                                if (!partner) return null;

                                return (
                                    <Link
                                        key={chat.partnerId}
                                        to={`/trainer/chat/${chat.partnerId}`}
                                        className="block group"
                                    >
                                        <Card className="bg-white/[0.02] backdrop-blur-xl border border-white/5 hover:border-cyan-500/20 group-hover:bg-white/[0.04] transition-all duration-300 rounded-[2.5rem] overflow-hidden relative shadow-2xl">
                                            {/* Glowing gradient indicator on active hover */}
                                            <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-cyan-500 scale-y-0 group-hover:scale-y-100 transition-transform origin-center duration-300" />
                                            
                                            <CardContent className="p-6 flex items-center gap-6">
                                                <div className="relative">
                                                    <Avatar className="h-16 w-16 border-2 border-white/10 group-hover:border-cyan-500/40 transition-colors shadow-2xl">
                                                        <AvatarImage src={partner.profileImage} className="object-cover" />
                                                        <AvatarFallback className="bg-white/5 text-gray-500 font-black italic text-xl">
                                                            {partner.name?.charAt(0) || 'U'}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    {chat.unreadCount > 0 && (
                                                        <div className="absolute -top-1 -right-1 h-4 w-4 bg-cyan-500 rounded-full animate-ping" />
                                                    )}
                                                </div>

                                                <div className="flex-1 min-w-0 space-y-1">
                                                    <div className="flex justify-between items-start">
                                                        <h3 className="text-lg font-black text-white italic uppercase tracking-tight group-hover:text-cyan-400 transition-colors">
                                                            {partner.name}
                                                        </h3>
                                                        <span className="text-[9px] text-gray-500 font-black italic uppercase tracking-wider whitespace-nowrap ml-2">
                                                            {chat.lastMessage.createdAt && formatDistanceToNow(new Date(chat.lastMessage.createdAt), { addSuffix: true })}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wide truncate pr-4">
                                                            {chat.lastMessage.messageType === 'image' ? (
                                                                <span className="text-cyan-500 flex items-center gap-1.5 font-black italic"><Sparkles className="w-3.5 h-3.5" /> Sent Image</span>
                                                            ) : chat.lastMessage.messageType === 'audio' ? (
                                                                <span className="text-cyan-500 flex items-center gap-1.5 font-black italic"><Sparkles className="w-3.5 h-3.5" /> Sent Audio Memo</span>
                                                            ) : chat.lastMessage.messageType === 'payment_request' ? (
                                                                <span className="text-amber-500 flex items-center gap-1.5 font-black italic">Payment Request Sent</span>
                                                            ) : (
                                                                chat.lastMessage.message
                                                            )}
                                                        </p>
                                                        {chat.unreadCount > 0 && (
                                                            <Badge className="bg-cyan-500 text-black font-black rounded-full h-6 min-w-6 px-1 flex items-center justify-center text-[10px] shadow-lg shadow-cyan-500/20">
                                                                {chat.unreadCount}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                                <ArrowRight className="h-5 w-5 text-gray-700 group-hover:text-cyan-400 group-hover:translate-x-1.5 transition-all" />
                                            </CardContent>
                                        </Card>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </main>
                <SiteFooter />
            </div>
        </div>
    );
}
