import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-image.jpg";

export const Hero = () => {
  const navigate = useNavigate();
  
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 pt-20 pb-16">
      {/* Animated gradient background */}
      <div className="absolute inset-0 gradient-hero opacity-10 animate-pulse" />
      
      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6 text-center md:text-left">
          <div className="inline-block">
            <span className="bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold animate-fade-in">
              🇳🇬 Made for Nigerian Students
            </span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold leading-tight animate-fade-in">
            Chat with <span className="text-primary">JAMB AI</span> — Your Smart Exam Coach
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground animate-fade-in">
            Practice real JAMB questions, get instant feedback, and prepare smarter. 
            It's like chatting with a senior who already passed! 🎓
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start animate-scale-in">
            <Button 
              size="lg" 
              className="text-lg px-8 py-6 shadow-card hover:shadow-lg transition-smooth group"
              onClick={() => navigate("/auth")}
            >
              <MessageCircle className="mr-2 group-hover:scale-110 transition-smooth" />
              Start Chatting with JAMB AI
            </Button>
            
            <Button 
              size="lg" 
              variant="outline"
              className="text-lg px-8 py-6 border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-smooth"
              onClick={() => scrollToSection("how-it-works")}
            >
              See How It Works
            </Button>
          </div>
          
          <div className="flex items-center gap-6 justify-center md:justify-start text-sm text-muted-foreground animate-fade-in">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span>2,547+ students practicing</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
              <span>10,000+ questions answered</span>
            </div>
          </div>
        </div>
        
        <div className="relative animate-float">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl blur-3xl" />
          <img 
            src={heroImage} 
            alt="Student using JAMB AI" 
            className="relative rounded-3xl shadow-card w-full"
          />
        </div>
      </div>
    </section>
  );
};
