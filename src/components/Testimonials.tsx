import { Card } from "@/components/ui/card";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Chioma O.",
    school: "Federal Government College, Lagos",
    exam: "JAMB",
    score: "270",
    prevScore: "180",
    text: "ExamsAI.NG helped me jump from 180 to 270 in JAMB 😭🔥. The explanations are so clear and the practice questions are exactly like the real exam!",
    avatar: "CO"
  },
  {
    name: "Ibrahim K.",
    school: "King's College, Lagos",
    exam: "WAEC",
    score: "A1",
    prevScore: "B3",
    text: "The WAEC AI coach is incredible! Went from B3 to A1 in Mathematics. Feels like having a private tutor 24/7! 🚀",
    avatar: "IK"
  },
  {
    name: "Blessing A.",
    school: "Queen's College, Yaba",
    exam: "NECO",
    score: "Distinction",
    prevScore: "Credit",
    text: "NECO Chemistry was my worst subject, but ExamsAI.NG broke everything down so simply. Now it's my strongest subject! 💚",
    avatar: "BA"
  },
  {
    name: "David M.",
    school: "Government College, Ibadan",
    exam: "NABTEB",
    score: "Outstanding",
    prevScore: "Good",
    text: "The technical questions practice helped me ace NABTEB! Best exam prep tool ever! 🎯",
    avatar: "DM"
  }
];

export const Testimonials = () => {
  return (
    <section className="py-20 px-4 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl md:text-5xl font-bold">
            Students Are Getting Results! 🎯
          </h2>
          <p className="text-lg text-muted-foreground">
            Real students, real scores, real success stories
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={testimonial.name} 
              className="p-6 shadow-card hover:shadow-lg transition-smooth hover:-translate-y-2"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-secondary text-secondary" />
                ))}
              </div>
              
              {/* Testimonial */}
              <p className="text-foreground mb-6 leading-relaxed">
                "{testimonial.text}"
              </p>
              
              {/* Score improvement */}
              <div className="flex items-center gap-4 mb-4 p-3 bg-primary/5 rounded-lg">
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">Before</div>
                  <div className="text-xl font-bold text-destructive">{testimonial.prevScore}</div>
                </div>
                <div className="text-2xl">→</div>
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">After</div>
                  <div className="text-xl font-bold text-primary">{testimonial.score}</div>
                </div>
              </div>
              
              {/* Student info */}
              <div className="flex items-center gap-3 pt-4 border-t">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.school}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
