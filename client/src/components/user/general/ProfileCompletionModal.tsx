import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {type RootState} from "@/redux/store";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { User, AlertCircle, CheckCircle } from "lucide-react";

interface ProfileCompletionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ProfileCompletionModal({ open, onOpenChange }: ProfileCompletionModalProps) {
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.userAuth.user);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [missingFields, setMissingFields] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      calculateCompletion();
    }
  }, [user]);

  const calculateCompletion = () => {
    if (!user) return;

    const fields = [
      { key: 'name', label: 'Full Name', value: user.name },
      { key: 'phone', label: 'Phone Number', value: user.phone },
      { key: 'age', label: 'Age', value: user.age },
      { key: 'gender', label: 'Gender', value: user.gender },
      { key: 'height', label: 'Height', value: user.height },
      { key: 'weight', label: 'Current Weight', value: user.weight },
      { key: 'goals', label: 'Fitness Goals', value: user.goals?.length! > 0 },
      { key: 'activityLevel', label: 'Activity Level', value: user.activityLevel },
    ];

    const completedFields = fields.filter(field => field.value && field.value !== "").length;
    const totalFields = fields.length;
    const percentage = Math.round((completedFields / totalFields) * 100);
    
    const missing = fields
      .filter(field => !field.value || field.value === "")
      .map(field => field.label);

    setCompletionPercentage(percentage);
    setMissingFields(missing);
  };

  const handleCompleteProfile = () => {
    onOpenChange(false);
    navigate("/edit-profile");
  };

  const handleSkip = () => {
    onOpenChange(false);
    localStorage.setItem("profileCompletionSkipped", "true");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-sm border-border/50">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <User className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-xl font-semibold">
            Complete Your Profile
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Help us personalize your fitness journey by completing your profile
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Profile Completion</span>
              <span className="font-medium">{completionPercentage}%</span>
            </div>
            <Progress value={completionPercentage} className="h-2" />
          </div>

          {missingFields.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-amber-600">
                <AlertCircle className="h-4 w-4" />
                Missing Information
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                {missingFields.map((field, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-amber-500 rounded-full" />
                    {field}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-primary/5 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-primary">
              <CheckCircle className="h-4 w-4" />
              Benefits of completing your profile
            </div>
            <ul className="text-sm text-muted-foreground space-y-1 pl-6">
              <li>• Get personalized workout recommendations</li>
              <li>• Receive tailored nutrition guidance</li>
              <li>• Match with suitable trainers</li>
              <li>• Track your progress more effectively</li>
            </ul>
          </div>
        </div>

        <DialogFooter className="flex gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={handleSkip}
            className="flex-1 sm:flex-none"
          >
            Skip for now
          </Button>
          <Button
            onClick={handleCompleteProfile}
            className="flex-1 sm:flex-none bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
          >
            Complete Profile
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}