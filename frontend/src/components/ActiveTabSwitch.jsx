import { useChatStore } from "../store/useChatStore";

function ActiveTabSwitch() {
  const { activeTab, setActiveTab } = useChatStore();

  return (
    <div className="relative flex justify-around p-1 rounded-full w-full mx-auto mt-2">

      {/* Sliding Highlight */}
      <div
        className={`absolute top-1 bottom-1 w-1/2 rounded-full bg-cyan-500/20 transition-all duration-400 ease-in-out ${
          activeTab === "chats" ? "left-1" : "left-1/2"
        }`}
      />

      <button
        onClick={() => setActiveTab("chats")}
        className={`relative z-10 px-4 py-2 w-full rounded-full transition-colors duration-400 ${
          activeTab === "chats"
            ? "text-cyan-400"
            : "text-slate-400"
        }`}
      >
        Chats
      </button>

      <button
        onClick={() => setActiveTab("contacts")}
        className={`relative z-10 px-4 py-2 w-full rounded-full transition-colors duration-400 ${
          activeTab === "contacts"
            ? "text-cyan-400"
            : "text-slate-400"
        }`}
      >
        Contacts
      </button>
    </div>
  );
}

export default ActiveTabSwitch;
