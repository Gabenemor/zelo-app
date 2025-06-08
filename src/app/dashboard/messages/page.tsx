import { PageHeader } from "@/components/ui/page-header";
import { ChatInterface } from "@/components/messaging/chat-interface";
import { MessageSquare } from "lucide-react";

export default function MessagesPage() {
  return (
    <div className="space-y-6 flex flex-col h-full">
      <PageHeader
        title="My Messages"
        description="Communicate directly with clients and service providers on Zelo."
        icon={MessageSquare}
      />
      <div className="flex-grow">
        <ChatInterface />
      </div>
    </div>
  );
}
