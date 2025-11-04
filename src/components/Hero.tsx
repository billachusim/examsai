import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

const examHeroes = [
  {
    exam: "JAMB",
    title: "Chat with JAMB AI",
    subtitle: "Your Smart UTME Exam Coach",
    description: "Practice real JAMB questions, get instant feedback, and prepare smarter. It's like chatting with a senior who already passed! 🎓",
    stat1: "2,547+ students practicing",
    stat2: "10,000+ questions answered",
    color: "from-primary/20 to-secondary/20"
  },
  {
    exam: "WAEC",
    title: "Chat with WAEC AI",
    subtitle: "Your Smart WASSCE Exam Coach",
    description: "Master WAEC questions with AI guidance. Get detailed explanations and practice like never before! 📚",
    stat1: "1,800+ students preparing",
    stat2: "8,500+ questions solved",
    color: "from-blue-500/20 to-purple-500/20"
  },
  {
    exam: "NECO",
    title: "Chat with NECO AI",
    subtitle: "Your Smart SSCE Exam Coach",
    description: "Ace your NECO exams with personalized AI tutoring. Study smarter, not harder! 🚀",
    stat1: "1,200+ active learners",
    stat2: "6,000+ practice questions",
    color: "from-green-500/20 to-teal-500/20"
  },
  {
    exam: "NABTEB",
    title: "Chat with NABTEB AI",
    subtitle: "Your Smart Technical Exam Coach",
    description: "Excel in your NABTEB exams with AI-powered practice and instant feedback! 💡",
    stat1: "900+ students enrolled",
    stat2: "5,000+ questions mastered",
    color: "from-orange-500/20 to-red-500/20"
  }
];

export const Hero = () => {
  const navigate = useNavigate();
  const [isSignedIn, setIsSignedIn] = useState(false);
  
  const [emblaRef] = useEmblaCarousel(
    { loop: true },
    [Autoplay({ delay: 5000, stopOnInteraction: false })]
  );

  useEffect(() => {
    // Check initial auth state
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsSignedIn(!!session);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsSignedIn(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);
  
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: "smooth" });
  };

  const handleStartChat = () => {
    if (isSignedIn) {
      navigate("/chat");
    } else {
      navigate("/auth");
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 pt-20 pb-16">
      {/* Animated gradient background */}
      <div className="absolute inset-0 gradient-hero opacity-10 animate-pulse" />
      
      {/* Carousel */}
      <div className="overflow-hidden w-full" ref={emblaRef}>
        <div className="flex">
          {examHeroes.map((hero, index) => (
            <div key={index} className="flex-[0_0_100%] min-w-0">
              <div className="relative z-10 max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center px-4">
                <div className="space-y-6 text-center md:text-left">
                  <div className="inline-block">
                    <span className="bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold animate-fade-in">
                      🇳🇬 Made for Nigerian Students
                    </span>
                  </div>
                  
                  <h1 className="text-4xl md:text-6xl font-bold leading-tight animate-fade-in">
                    {hero.title.split(" ").slice(0, 2).join(" ")} <span className="text-primary">{hero.title.split(" ").slice(2).join(" ")}</span>
                  </h1>
                  
                  <p className="text-xl md:text-2xl font-semibold text-muted-foreground">
                    {hero.subtitle}
                  </p>
                  
                  <p className="text-lg md:text-xl text-muted-foreground animate-fade-in">
                    {hero.description}
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start animate-scale-in">
                    <Button 
                      size="lg" 
                      className="text-lg px-8 py-6 shadow-card hover:shadow-lg transition-smooth group"
                      onClick={handleStartChat}
                    >
                      <MessageCircle className="mr-2 group-hover:scale-110 transition-smooth" />
                      Start Chatting with {hero.exam} AI
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
                  
                  <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 justify-center md:justify-start text-sm text-muted-foreground animate-fade-in">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                      <span>{hero.stat1}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
                      <span>{hero.stat2}</span>
                    </div>
                  </div>
                </div>
                
                <div 
                  className="relative animate-float cursor-pointer"
                  onClick={() => scrollToSection("testimonials")}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${hero.color} rounded-3xl blur-3xl`} />
                  <div className="relative bg-gradient-to-br from-primary to-secondary rounded-3xl p-8 shadow-card hover:shadow-xl transition-all">
                    <div className="text-white text-center space-y-4">
                      <div className="text-6xl font-bold">{hero.exam}</div>
                      <div className="text-2xl font-semibold">AI Exam Coach</div>
                      <div className="text-lg opacity-90">Personalized Learning</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};