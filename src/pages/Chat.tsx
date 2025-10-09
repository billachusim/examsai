import { useState } from "react";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { ChatTopNav } from "@/components/chat/ChatTopNav";
import { StatsPanel } from "@/components/chat/StatsPanel";
import { PaymentModal } from "@/components/chat/PaymentModal";

export type ChatMode = "learn" | "test" | "mock";
export type Subject = "English" | "Mathematics" | "Physics" | "Chemistry" | "Biology" | 
  "Government" | "Economics" | "Literature" | "Commerce" | "CRS/IRS" | "Geography";

const Chat = () => {
  const [selectedSubject, setSelectedSubject] = useState<Subject>("English");
  const [chatMode, setChatMode] = useState<ChatMode>("learn");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="h-screen flex flex-col bg-background">
      <ChatTopNav onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex-1 flex overflow-hidden">
        <ChatSidebar
          isOpen={sidebarOpen}
          selectedSubject={selectedSubject}
          onSelectSubject={setSelectedSubject}
          chatMode={chatMode}
          onModeChange={setChatMode}
        />
        
        <ChatWindow
          subject={selectedSubject}
          mode={chatMode}
          onShowPaywall={() => setShowPaymentModal(true)}
        />
        
        <StatsPanel onUpgrade={() => setShowPaymentModal(true)} />
      </div>

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
      />
    </div>
  );
};

export default Chat;
