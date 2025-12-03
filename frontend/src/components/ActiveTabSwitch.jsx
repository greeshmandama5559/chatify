import { useChatStore } from "../store/useChatStore";

function ActiveTabSwitch() {
  const { activeTab, setActiveTab } = useChatStore();

  if (activeTab === "chats") {
    const { chats, getMyChatPartners } = useChatStore.getState();

    // If no chats loaded OR chats contain invalid entries → refetch
    if (!Array.isArray(chats) || chats.some((c) => !c || !c._id)) {
      getMyChatPartners();
    }
  }

  return (
    <div className="px-4 pt-4 pb-2">
      <div className="relative flex p-1 bg-slate-900 border border-slate-800 rounded-xl">
        {/* Sliding Background Pill */}
        <div
          className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-lg bg-slate-800 shadow-sm transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] ${
            activeTab === "chats" ? "left-1" : "translate-x-full left-0 ml-1"
          }`}
        />

        {/* Buttons */}
        <button
          onClick={() => setActiveTab("chats")}
          className={`relative z-10 w-1/2 py-2 text-sm font-medium rounded-lg transition-colors duration-300 ${
            activeTab === "chats"
              ? "text-cyan-400"
              : "text-slate-400 hover:text-slate-300"
          }`}
        >
          Chats
        </button>

        <button
          onClick={() => setActiveTab("contacts")}
          className={`relative z-10 w-1/2 py-2 text-sm font-medium rounded-lg transition-colors duration-300 ${
            activeTab === "contacts"
              ? "text-cyan-400"
              : "text-slate-400 hover:text-slate-300"
          }`}
        >
          Contacts
        </button>
      </div>
    </div>
  );
}

export default ActiveTabSwitch;
