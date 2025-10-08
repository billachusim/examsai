import { Brain, FileText, Trophy } from "lucide-react";
import { Card } from "@/components/ui/card";

const features = [
  {
    icon: Brain,
    title: "Chat to Learn",
    description: "Ask any topic and get clear, easy-to-understand explanations. Like having a personal tutor 24/7.",
    color: "from-primary/20 to-primary/5"
  },
  {
    icon: FileText,
    title: "Practice Past Questions",
    description: "Get real-time marking and detailed answers. Know exactly where you went wrong and how to improve.",
    color: "from-secondary/20 to-secondary/5"
  },
  {
    icon: Trophy,
    title: "Track Your Progress",
    description: "See your scores, identify weak areas, and watch yourself improve every day. Gamified learning!",
    color: "from-primary/20 to-secondary/20"
  }
];

export const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-20 px-4 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl md:text-5xl font-bold">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Three simple steps to exam success. No stress, just results! 💪
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={feature.title} 
              className="p-8 shadow-card hover:shadow-lg transition-smooth hover:-translate-y-2 border-2 group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-smooth`}>
                <feature.icon className="w-8 h-8 text-primary" />
              </div>
              
              <h3 className="text-2xl font-bold mb-3 group-hover:text-primary transition-smooth">
                {feature.title}
              </h3>
              
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
