import ProfileHeader from "./ProfileHeader";
import ActiveTabSwitch from "./ActiveTabSwitch";
import ChatsList from "./ChatsList";
import ContactList from "./ContactList";
import { useChatStore } from "../store/useChatStore";

export default function LeftChatPortion({ selectedUser, isMobile,  }) {
    const { activeTab } = useChatStore();
  return (
    <div
      className={`w-full min-h-screen md:w-96 bg-slate-800 flex flex-col transition-all duration-300
            ${selectedUser && isMobile ? "hidden" : "flex"}`}
    >
      <ProfileHeader />
      <ActiveTabSwitch />
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {activeTab === "chats" ? <ChatsList /> : <ContactList />}
      </div>
    </div>
  );
}
