import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, MessageSquare, Video, Check, Crown, Star } from "lucide-react";
import { useEffect } from "react";
import API from "@/lib/axios";

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubscribe: (planType: string) => void;
  monthlyPrice: number;
  trainerName: string;
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  onSubscribe,
  monthlyPrice,
  trainerName,
}) => {
  const plans = [
    {
      type: "basic",
      title: "Basic Plan",
      icon: <Zap className="h-6 w-6 text-primary" />,
      price: monthlyPrice,
      features: [
        "Personalized workout plans",
        "Custom diet plans",
        "Progress tracking",
        "Basic support"
      ],
      color: "from-blue-500 to-blue-600",
      popular: false
    },
    {
      type: "premium",
      title: "Premium Plan",
      icon: <MessageSquare className="h-6 w-6 text-amber-400" />,
      price: Math.round(monthlyPrice * 1.25),
      features: [
        "Everything in Basic",
        "Limited chat (200 messages/month)",
        "Priority support",
        "Weekly check-ins"
      ],
      color: "from-amber-500 to-amber-600",
      popular: true
    },
    {
      type: "pro",
      title: "Pro Plan",
      icon: <Video className="h-6 w-6 text-purple-400" />,
      price: Math.round(monthlyPrice * 1.5),
      features: [
        "Everything in Premium",
        "Unlimited chat",
        "Video calls (5 per month)",
        "24/7 priority support"
      ],
      color: "from-purple-500 to-purple-600",
      popular: false
    }
  ];

  // Handle modal close - cleanup pending transactions
  const handleModalClose = async () => {
    try {
      // Mark any pending transactions as failed when modal is closed
      await API.post("/payment/cleanup-pending");
    } catch (error) {
      console.error("Failed to cleanup pending transactions:", error);
    }
    onClose();
  };

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      // Cleanup when component unmounts (user navigates away)
      if (isOpen) {
        API.post("/payment/cleanup-pending").catch(console.error);
      }
    };
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={handleModalClose}>
      <DialogContent className="max-w-5xl bg-card/90 backdrop-blur-md border border-border/50 rounded-2xl p-8">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-foreground bg-clip-text text-transparent text-center">
            Choose Your Training Plan with {trainerName}
          </DialogTitle>
        </DialogHeader>
        <div className="py-6">
          <p className="text-muted-foreground text-lg mb-8 text-center">
            Select the perfect plan to achieve your fitness goals with expert guidance
          </p>
          <div className="grid gap-6 md:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.type}
                className={`relative group rounded-2xl border p-6 transition-all duration-300 ${
                  plan.popular 
                    ? 'border-amber-400 bg-gradient-to-br from-amber-50/50 via-amber-25/25 to-transparent shadow-lg transform scale-105' 
                    : 'border-border/50 bg-gradient-to-br from-primary/5 via-primary/3 to-accent/5 hover:border-primary/30'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-4 py-1">
                      <Star className="h-3 w-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
                
                <div className="relative flex flex-col items-center space-y-6">
                  <div className={`p-4 rounded-full bg-gradient-to-r ${plan.color}/10`}>
                    {plan.icon}
                  </div>
                  
                  <div className="text-center space-y-2">
                    <h3 className="text-xl font-bold text-foreground">{plan.title}</h3>
                    <div className="flex items-center justify-center">
                      <span className="text-3xl font-bold text-primary">₹{plan.price.toLocaleString()}</span>
                      <span className="text-muted-foreground ml-2">/month</span>
                    </div>
                  </div>

                  <div className="space-y-3 w-full">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={() => onSubscribe(plan.type)}
                    className={`w-full bg-gradient-to-r ${plan.color} hover:opacity-90 shadow-lg hover:shadow-xl transition-all duration-300 text-white`}
                  >
                    {plan.popular && <Crown className="h-4 w-4 mr-2" />}
                    Choose {plan.title}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleModalClose}
            className="border-border/50 hover:bg-primary/5 hover:border-primary/30 transition-all duration-300"
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SubscriptionModal;