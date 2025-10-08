import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Zap } from "lucide-react";

const features = [
  "Unlimited chat with JAMB AI",
  "Access to 10,000+ past questions",
  "Real-time answer marking",
  "Progress tracking & analytics",
  "Study reminders & tips",
  "WhatsApp support"
];

export const Pricing = () => {
  return (
    <section id="pricing" className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl md:text-5xl font-bold">
            Simple, Affordable Pricing
          </h2>
          <p className="text-lg text-muted-foreground">
            Less than the price of one lesson. More value than 100 textbooks! 📚
          </p>
        </div>
        
        <Card className="relative overflow-hidden shadow-card border-2 border-primary/20">
          {/* Popular badge */}
          <div className="absolute top-0 right-0 bg-gradient-to-r from-primary to-secondary text-white px-6 py-2 rounded-bl-2xl font-semibold flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Most Popular
          </div>
          
          <div className="p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-12">
              {/* Pricing Info */}
              <div className="space-y-6">
                <div>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-5xl md:text-6xl font-bold text-primary">₦2,000</span>
                    <span className="text-2xl text-muted-foreground">/ month</span>
                  </div>
                  <p className="text-muted-foreground">Unlimited Practice & Chat Access</p>
                </div>
                
                <div className="space-y-4">
                  <Button size="lg" className="w-full text-lg py-6 shadow-lg hover:shadow-xl transition-smooth">
                    Pay & Start Now
                  </Button>
                  
                  <p className="text-center text-sm text-muted-foreground">
                    Or get a <span className="font-semibold text-secondary">₦500 Day Pass</span> to try it out
                  </p>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground pt-4 border-t">
                  <Check className="w-4 h-4 text-primary" />
                  <span>Secure payment via Paystack</span>
                </div>
              </div>
              
              {/* Features List */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold mb-6">Everything you need to succeed:</h3>
                
                {features.map((feature) => (
                  <div key={feature} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-foreground">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
        
        <p className="text-center text-muted-foreground mt-8">
          🎉 Special Launch Offer: First 1,000 students get <span className="font-semibold text-primary">3 months for ₦5,000</span>
        </p>
      </div>
    </section>
  );
};
