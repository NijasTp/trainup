import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";
import { useState } from "react";

export function InfoModal({ modalMessage }: { modalMessage: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="icon"
        className="bg-card/80 backdrop-blur-sm border-border/50 hover:bg-primary/5"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        <Info className="h-4 w-4 text-primary" />
      </Button>
      {open && (
        <div className="absolute top-12 right-0 w-64 p-4 bg-card/90 backdrop-blur-sm border border-border/50 rounded-lg shadow-lg z-10 animate-fade-in">
          <p className="text-sm text-muted-foreground">
            {modalMessage}
          </p>
        
        </div>
      )}
    </div>
  );
}