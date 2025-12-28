
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "@/lib/axios";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, MessageSquare, ArrowRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import TrainerSiteHeader from "@/components/trainer/general/TrainerHeader";
import { SiteFooter } from "@/components/user/home/UserSiteFooter";

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
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background/95 to-secondary/20">
            <TrainerSiteHeader />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent"></div>

            <main className="relative container max-w-4xl mx-auto py-12 flex-1 space-y-8">
                <h1 className="text-2xl font-bold mb-6">Client Messages</h1>

                {conversations.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-10">
                            <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-medium">No conversations yet</h3>
                            <p className="text-muted-foreground mb-6 text-center">
                                Start chatting with clients from your <Link to="/trainer/clients" className="text-primary hover:underline">Client List</Link>.
                            </p>
                            <Button onClick={() => navigate('/trainer/clients')}>
                                View Clients
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
                                    className="block"
                                >
                                    <Card className="hover:bg-accent/5 transition-colors">
                                        <CardContent className="p-4 flex items-center gap-4">
                                            <Avatar className="h-12 w-12">
                                                <AvatarImage src={partner.profileImage} />
                                                <AvatarFallback>{partner.name?.charAt(0) || 'U'}</AvatarFallback>
                                            </Avatar>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start mb-1">
                                                    <h3 className="font-semibold truncate">{partner.name}</h3>
                                                    <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                                                        {chat.lastMessage.createdAt && formatDistanceToNow(new Date(chat.lastMessage.createdAt), { addSuffix: true })}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <p className="text-sm text-muted-foreground truncate pr-4">
                                                        {chat.lastMessage.messageType === 'image' ? 'Sent an image' :
                                                            chat.lastMessage.messageType === 'audio' ? 'Sent an audio message' :
                                                                chat.lastMessage.messageType === 'payment_request' ? 'Payment Request' :
                                                                    chat.lastMessage.message}
                                                    </p>
                                                    {chat.unreadCount > 0 && (
                                                        <Badge className="h-5 w-5 rounded-full p-0 flex items-center justify-center">
                                                            {chat.unreadCount}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                            <ArrowRight className="h-4 w-4 text-muted-foreground/50" />
                                        </CardContent>
                                    </Card>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </main>
            <SiteFooter />
        </div >
    );
}
