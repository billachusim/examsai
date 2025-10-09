import { MessageCircle, X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const FloatingChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  
  return (
    <>
      {/* Chat Preview Card */}
      {isOpen && (
        <Card className="fixed bottom-24 right-4 md:bottom-8 md:right-8 w-80 shadow-card border-2 border-primary/20 animate-scale-in z-50">
          <div className="p-4 border-b bg-gradient-to-r from-primary to-secondary text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold">JAMB AI</h3>
                  <p className="text-xs opacity-90">Ready to help you!</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/20 p-1 rounded transition-smooth"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div className="p-4 space-y-4">
            <div className="bg-muted rounded-2xl rounded-tl-none p-3">
              <p className="text-sm">
                👋 Hi! I'm JAMB AI — ready to test you? Let's ace that exam together! 🚀
              </p>
            </div>
            
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Quick actions:</p>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  📝 Start Practice Test
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  🧠 Ask a Question
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  📊 View My Progress
                </Button>
              </div>
            </div>
            
            <Button className="w-full shadow-lg" onClick={() => navigate("/chat")}>
              Open Full Chat
            </Button>
          </div>
        </Card>
      )}
      
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-20 right-4 md:bottom-8 md:right-8 w-16 h-16 bg-gradient-to-br from-primary to-secondary text-white rounded-full shadow-card hover:shadow-lg transition-smooth hover:scale-110 flex items-center justify-center z-50 group"
      >
        {isOpen ? (
          <X className="w-8 h-8" />
        ) : (
          <>
            <MessageCircle className="w-8 h-8 group-hover:scale-110 transition-smooth" />
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-secondary rounded-full flex items-center justify-center text-xs font-bold animate-pulse">
              1
            </div>
          </>
        )}
      </button>
    </>
  );
};
