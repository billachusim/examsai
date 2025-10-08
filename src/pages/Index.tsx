import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { Pricing } from "@/components/Pricing";
import { Testimonials } from "@/components/Testimonials";
import { GetStarted } from "@/components/GetStarted";
import { Footer } from "@/components/Footer";
import { BottomNav } from "@/components/BottomNav";
import { FloatingChat } from "@/components/FloatingChat";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Hero />
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
