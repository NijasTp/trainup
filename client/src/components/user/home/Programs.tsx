import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, Target, Zap } from "lucide-react";

const Programs = () => {
  const programs = [
    {
      title: "Fat Loss Bootcamp",
      duration: "6 Weeks",
      intensity: "High",
      groupSize: "8-12 people",
      icon: Zap,
      description: "High-intensity program designed to burn fat and build lean muscle through circuit training and cardio.",
      features: ["HIIT Workouts", "Nutrition Guidance", "Body Composition Tracking", "Group Support"],
      price: "$199",
      color: "bg-gradient-hero"
    },
    {
      title: "Strength Builder",
      duration: "12 Weeks",
      intensity: "Medium",
      groupSize: "4-6 people",
      icon: Target,
      description: "Progressive strength training program focusing on compound movements and muscle building.",
      features: ["Progressive Overload", "Form Correction", "Strength Testing", "Personalized Plans"],
      price: "$299",
      color: "bg-gradient-accent"
    },
    {
      title: "Athletic Performance",
      duration: "16 Weeks",
      intensity: "High",
      groupSize: "6-8 people",
      icon: Users,
      description: "Elite training program for athletes looking to improve speed, agility, and sport-specific skills.",
      features: ["Sport-Specific Training", "Agility Drills", "Performance Testing", "Recovery Protocols"],
      price: "$399",
      color: "bg-secondary"
    }
  ];

  return (
    <section id="programs" className="py-20 bg-gradient-card">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-slide-up">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Proven
            <span className="bg-gradient-hero bg-clip-text text-transparent"> Training Programs</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Choose from our scientifically-designed programs that deliver real results. 
            Each program is crafted by experts and tested by thousands of successful members.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {programs.map((program, index) => (
            <Card key={index} className="relative overflow-hidden hover:shadow-elegant transition-smooth hover:-translate-y-2 animate-scale-in" style={{ animationDelay: `${index * 0.2}s` }}>
              <div className={`h-2 ${program.color}`}></div>
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <program.icon className="h-8 w-8 text-primary" />
                  <Badge variant="outline">{program.intensity} Intensity</Badge>
                </div>
                <CardTitle className="text-xl">{program.title}</CardTitle>
                <CardDescription>{program.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{program.duration}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{program.groupSize}</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">What's Included:</h4>
                  <ul className="space-y-2">
                    {program.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center text-sm text-muted-foreground">
                        <div className="h-1.5 w-1.5 bg-primary rounded-full mr-3"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border-t pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-bold">{program.price}</span>
                    <span className="text-muted-foreground">per program</span>
                  </div>
                  <Button className="w-full" variant="default">
                    Join Program
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">Not sure which program is right for you?</p>
          <Button variant="outline" size="lg">
            Get Free Consultation
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Programs;