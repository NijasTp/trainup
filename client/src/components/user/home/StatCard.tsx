// components/user/home/StatCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import GlareHover from "@/components/ui/GlareHover";
import { Progress } from "@/components/ui/progress";
import { type ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  progress?: number;
  color: "primary" | "green" | "blue";
}

const colorMap = {
  primary: "from-primary/10 to-primary/5 border-primary/20",
  green: "from-green-500/10 to-green-500/5 border-green-500/20 text-green-600",
  blue: "from-blue-500/10 to-blue-500/5 border-blue-500/20 text-blue-600",
};

export default function StatCard({ title, value, icon, progress, color }: StatCardProps) {
  const gradient = colorMap[color];

  return (
    <GlareHover
      width="100%"
      height="100%"
      glareColor="#ffffff"
      glareOpacity={0.2}
      glareAngle={-30}
      glareSize={300}
      transitionDuration={800}
      className={`h-full ${gradient} border rounded-xl`}
    >
      <Card className="h-full bg-transparent border-0 shadow-none">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {icon}
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${color === 'primary' ? 'text-primary' : color === 'green' ? 'text-green-600' : 'text-blue-600'}`}>
            {value}
          </div>
          {progress !== undefined && (
            <>
              <Progress value={progress} className="mt-2 h-2" />
              <p className="text-xs text-muted-foreground mt-1">{Math.round(progress)}% completed</p>
            </>
          )}
        </CardContent>
      </Card>
    </GlareHover>
  );
}