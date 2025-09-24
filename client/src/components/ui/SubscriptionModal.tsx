import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Zap, Trophy, Crown } from "lucide-react";
import { useEffect } from "react";
import API from "@/lib/axios";

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubscribe: (months: number) => void;
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
    { months: 1, title: "Monthly Plan", icon: <Zap className="h-6 w-6 text-primary" /> },
    { months: 3, title: "Quarterly Plan", icon: <Trophy className="h-6 w-6 text-amber-400" /> },
    { months: 6, title: "Half-Yearly Plan", icon: <Crown className="h-6 w-6 text-yellow-500" /> },
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
      <DialogContent className="max-w-3xl bg-card/90 backdrop-blur-md border border-border/50 rounded-2xl p-8">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-foreground bg-clip-text text-transparent">
            Subscribe to {trainerName}'s Training Program
          </DialogTitle>
        </DialogHeader>
        <div className="py-6">
          <p className="text-muted-foreground text-lg mb-6 text-center">
            Choose a plan to start your fitness journey with {trainerName}. Unlock personalized training and expert guidance!
          </p>
          <div className="grid gap-6 sm:grid-cols-3">
            {plans.map((plan) => {
              const totalPrice = monthlyPrice * plan.months;
              return (
                <div
                  key={plan.months}
                  className="relative group bg-gradient-to-br from-primary/5 via-primary/3 to-accent/5 rounded-xl border border-primary/10 p-6 hover:border-primary/30 transition-all duration-300"
                >
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex flex-col items-center space-y-4">
                    <div className="p-3 bg-primary/10 rounded-full">{plan.icon}</div>
                    <h3 className="text-xl font-semibold text-foreground">{plan.title}</h3>
                    <div className="text-center">
                      <span className="text-3xl font-bold text-primary">₹{totalPrice.toLocaleString()}</span>
                      <span className="text-muted-foreground ml-2"> {plan.months} months</span>
                    </div>
                    <p className="text-sm text-muted-foreground text-center">
                      ₹{monthlyPrice.toLocaleString()} per month
                    </p>
                    <Button
                      onClick={() => onSubscribe(plan.months)}
                      className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                     {plan.months} Month{plan.months > 1 ? 's' : ''}
                    </Button>
                  </div>
                </div>
              );
            })}
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