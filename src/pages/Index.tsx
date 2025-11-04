import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { Pricing } from "@/components/Pricing";
import { Testimonials } from "@/components/Testimonials";
import { GetStarted } from "@/components/GetStarted";
import { Footer } from "@/components/Footer";
import { BottomNav } from "@/components/BottomNav";
import { FloatingChat } from "@/components/FloatingChat";
import heroImage from "@/assets/hero-image.jpg";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Hero />
      
      {/* Motivational Section with Hero Image */}
      <section className="py-16 px-4 bg-gradient-to-b from-background to-primary/5">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold">
                Study Smarter, Not Harder 📚
              </h2>
              <p className="text-lg text-muted-foreground">
                Join thousands of Nigerian students who are transforming their exam preparation 
                with AI-powered learning. Get personalized practice, instant feedback, and 
                expert guidance - all at your fingertips.
              </p>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span>Available 24/7</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-secondary rounded-full" />
                  <span>Instant Feedback</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-accent rounded-full" />
                  <span>Track Progress</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl blur-3xl" />
              <img 
                src={heroImage} 
                alt="Student studying with AI assistance" 
                className="relative rounded-3xl shadow-card hover:shadow-xl transition-shadow"
              />
            </div>
          </div>
        </div>
      </section>
      
      <HowItWorks />
      <Testimonials />
      <Pricing />
      <GetStarted />
      <Footer />
      <BottomNav />
      <FloatingChat />
      
      {/* Padding for bottom nav on mobile */}
      <div className="h-16 md:hidden" />
    </div>
  );
};

export default Index;
