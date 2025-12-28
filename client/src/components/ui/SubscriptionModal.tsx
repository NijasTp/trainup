import { Dialog, DialogContent, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Zap, Check, Crown, Star, Shield } from "lucide-react";
import { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import API from "@/lib/axios";

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubscribe: (planType: string, duration: number) => void;
  prices: {
    basic: number;
    premium: number;
    pro: number;
  };
  trainerName: string;
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  onSubscribe,
  prices,
  trainerName,
}) => {
  const [duration, setDuration] = useState<number>(1);

  const durations = [
    { label: "1 Month", value: 1, discount: 0 },
    { label: "3 Months", value: 3, discount: 10 },
    { label: "6 Months", value: 6, discount: 15 },
    { label: "12 Months", value: 12, discount: 20 },
  ];

  const calculatePrice = (basePrice: number, months: number) => {
    return basePrice * months;
  };

  const plans = [
    {
      type: "basic",
      title: "Basic",
      subtitle: "Kickstart your journey",
      icon: <Zap className="h-6 w-6 text-blue-500" />,
      basePrice: prices.basic,
      features: [
        "Personal workout plans",
        "Custom diet plans",
        "Progress tracking",
        "Basic support"
      ],
      styles: {
        border: "border-blue-500/50",
        bg: "bg-blue-500/5",
        iconBg: "bg-blue-500/10",
        featureBg: "bg-blue-500/20",
        checkColor: "text-blue-600",
        button: "bg-blue-600 hover:bg-blue-700 shadow-blue-500/25",
        badge: "bg-blue-500"
      },
      popular: false
    },
    {
      type: "premium",
      title: "Premium",
      subtitle: "Most popular choice",
      icon: <Crown className="h-6 w-6 text-amber-500" />,
      basePrice: prices.premium,
      features: [
        "Everything in Basic",
        "Limited chat (200 msgs/mo)",
        "Priority support",
        "Weekly check-ins"
      ],
      styles: {
        border: "border-amber-500/50",
        bg: "bg-amber-500/5",
        iconBg: "bg-amber-500/10",
        featureBg: "bg-amber-500/20",
        checkColor: "text-amber-600",
        button: "bg-amber-600 hover:bg-amber-700 shadow-amber-500/25",
        badge: "bg-amber-500"
      },
      popular: true
    },
    {
      type: "pro",
      title: "Pro",
      subtitle: "Ultimate experience",
      icon: <Star className="h-6 w-6 text-purple-500" />,
      basePrice: prices.pro,
      features: [
        "Everything in Premium",
        "Unlimited chat access",
        "Video calls (5/month)",
        "24/7 VIP support"
      ],
      styles: {
        border: "border-purple-500/50",
        bg: "bg-purple-500/5",
        iconBg: "bg-purple-500/10",
        featureBg: "bg-purple-500/20",
        checkColor: "text-purple-600",
        button: "bg-purple-600 hover:bg-purple-700 shadow-purple-500/25",
        badge: "bg-purple-500"
      },
      popular: false
    }
  ];

  // Handle modal close - cleanup pending transactions
  const handleModalClose = async () => {
    try {
      if (isOpen) {
        await API.post("/payment/cleanup-pending");
      }
    } catch (error) {
      console.error("Failed to cleanup pending transactions:", error);
    }
    onClose();
  };

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (isOpen) {
        API.post("/payment/cleanup-pending").catch(console.error);
      }
    };
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleModalClose()}>
      <DialogContent className="max-w-5xl bg-background/95 backdrop-blur-xl border-border/50 p-0 overflow-y-auto max-h-[85vh] gap-0">
        <div className="p-6 pb-2 text-center space-y-2">
          <DialogTitle className="text-2xl font-bold">
            Choose Your Plan with <span className="text-primary">{trainerName}</span>
          </DialogTitle>
          <p className="text-muted-foreground">
            Select the perfect plan to achieve your fitness goals
          </p>
        </div>

        <div className="flex justify-center py-4">
          <Tabs
            value={duration.toString()}
            onValueChange={(val) => setDuration(parseInt(val))}
            className="w-auto"
          >
            <TabsList className="grid grid-cols-4 w-[400px]">
              {durations.map((d) => (
                <TabsTrigger
                  key={d.value}
                  value={d.value.toString()}
                  className="px-4"
                >
                  {d.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        <div className="grid md:grid-cols-3 gap-6 p-6 pt-2 items-stretch">
          {plans.map((plan) => (
            <div
              key={plan.type}
              className={`relative flex flex-col rounded-xl border-2 transition-all duration-300 ${plan.popular
                ? `${plan.styles.border} ${plan.styles.bg} shadow-xl scale-105 z-10`
                : "border-border bg-card/50 hover:border-primary/50 hover:bg-card/80"
                }`}
            >
              {plan.popular && (
                <div className={`absolute -top-4 left-1/2 -translate-x-1/2 ${plan.styles.badge} bg-gradient-to-r from-amber-500 to-amber-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg uppercase tracking-wide flex items-center gap-1`}>
                  <Crown className="h-3 w-3" /> Most Popular
                </div>
              )}

              <div className="p-6 flex-1 flex flex-col">
                <div className="flex flex-col items-center text-center mb-6">
                  <div className={`p-3 rounded-xl ${plan.styles.iconBg} mb-3`}>
                    {plan.icon}
                  </div>
                  <h3 className="font-bold text-xl">{plan.title}</h3>
                  <p className="text-sm text-muted-foreground">{plan.subtitle}</p>
                </div>

                <div className="mb-6 text-center">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-3xl font-bold">
                      ₹{calculatePrice(plan.basePrice, duration).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Equivalent to ₹{plan.basePrice.toLocaleString()}
                  </p>
                </div>

                <div className="space-y-3 flex-1">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className={`mt-1 rounded-full p-0.5 ${plan.styles.featureBg}`}>
                        <Check className={`h-3 w-3 ${plan.styles.checkColor}`} strokeWidth={3} />
                      </div>
                      <span className="text-sm text-muted-foreground text-left">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t border-border/50">
                  <Button
                    onClick={() => onSubscribe(plan.type, duration)}
                    className={`w-full font-semibold shadow-lg transition-all duration-300 ${plan.popular
                      ? `${plan.styles.button} text-white`
                      : ""
                      }`}
                    variant={plan.popular ? "default" : "secondary"}
                    size="lg"
                  >
                    Choose
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <DialogFooter className="p-4 bg-muted/20 border-t border-border/50 justify-center sm:justify-center">
          <p className="text-xs text-muted-foreground flex items-center gap-2">
            <Shield className="h-3 w-3" /> Secure payment via Razorpay
          </p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SubscriptionModal;