import { useChatStore } from "../store/useChatStore";
import { useProfileStore } from "../store/useProfileStore";
import ProfileHeader from "../components/ProfileHeader";
import ActiveTabSwitch from "../components/ActiveTabSwitch";
import ChatsList from "../components/ChatsList";
import ContactList from "../components/ContactList";
import ChatContainer from "../components/ChatContainer";
import NoConversationPlaceholder from "../components/NoConversationPlaceholder";
import SideNavBar from "../components/SideNavBar";
import SelectedUserChatProfile from "../components/SelectedUserChatProfile";

function ChatPage() {
  const { activeTab, selectedUser } = useChatStore();

  const { isVisitingProfile } = useProfileStore();

  return (
    // ensure it occupies the full viewport
    <div className="min-h-screen w-full bg-slate-900 md:pl-20 ">
      <div className="flex flex-col md:flex-row h-screen md:pb-0">
        {/* LEFT SIDE (Contacts/Chats) */}
        {/* - On mobile: hidden when a chat is open (selectedUser exists). 
            - On md+: always visible. */}
        <div
          className={`w-full min-h-0 md:w-95 h-full bg-slate-800 backdrop-blur-sm flex flex-col md:rounded-l-2xl
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
          {selectedUser && isVisitingProfile ? (
            <SelectedUserChatProfile />
          ) : selectedUser ? (
            <ChatContainer />
          ) : (
            <NoConversationPlaceholder />
          )}
        </div>
      </div>

      <SideNavBar />
    </div>
  );
}

export default ChatPage;
