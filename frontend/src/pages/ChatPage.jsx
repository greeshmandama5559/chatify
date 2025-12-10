import { useChatStore } from "../store/useChatStore";

import BorderAnimatedContainer from "../components/BorderAnimatedContainer";
import ProfileHeader from "../components/ProfileHeader";
import ActiveTabSwitch from "../components/ActiveTabSwitch";
import ChatsList from "../components/ChatsList";
import ContactList from "../components/ContactList";
import ChatContainer from "../components/ChatContainer";
import NoConversationPlaceholder from "../components/NoConversationPlaceholder";
import { ArrowLeft } from "lucide-react"; // optional icon, install lucide-react if not present

function ChatPage() {
  const { activeTab, selectedUser } = useChatStore();

  return (
    // ensure it occupies the full viewport
    <div className="min-h-screen min-w-screen bg-slate-900">
      <div className="flex flex-col md:flex-row h-screen">
        {/* LEFT SIDE (Contacts/Chats) */}
        {/* - On mobile: hidden when a chat is open (selectedUser exists). 
            - On md+: always visible. */}
        <div
          className={`w-full md:w-90 h-full bg-slate-800 backdrop-blur-sm flex flex-col md:rounded-l-2xl
            ${selectedUser ? "hidden md:flex" : "flex"}`}
        >
          <ProfileHeader />
          <ActiveTabSwitch />
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {activeTab === "chats" ? <ChatsList /> : <ContactList />}
          </div>
        </div>

        {/* RIGHT SIDE (Chat / Placeholder) */}
        {/* - On mobile: shown fullscreen when a chat is selected, hidden otherwise.
            - On md+: always visible as the right column. */}
        <div
          className={`flex-1 h-full min-h-0 flex flex-col bg-slate-900 backdrop-blur-sm md:rounded-r-2xl
            ${selectedUser ? "flex w-full" : "hidden md:flex flex-1"}`}
        >

          {/* Chat content or placeholder */}
          {selectedUser ? <ChatContainer /> : <NoConversationPlaceholder />}
        </div>
      </div>
    </div>
  );
}

export default ChatPage;
