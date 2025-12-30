import { useChatStore } from "../store/useChatStore";

function ActiveTabSwitch() {
  const {
    activeTab,
    setActiveTab,
    chats = [],
    unseenCounts = {},
  } = useChatStore();

  if (activeTab === "chats") {
    const { getMyChatPartners } = useChatStore.getState();

    // If no chats loaded OR chats contain invalid entries → refetch
    if (!Array.isArray(chats) || chats.some((c) => !c || !c._id)) {
      getMyChatPartners();
    }
  }

  // Compute total unseen count:
  // Prefer counts from chats (if any chats have unseenCount defined).
  const totalFromChats = Array.isArray(chats)
    ? chats.reduce((sum, c) => sum + (Number(c?.unseenCount) || 0), 0)
    : 0;
  const totalFromMap = Object.values(unseenCounts || {}).reduce(
    (sum, v) => sum + (Number(v) || 0),
    0
  );
  const totalUnseen = totalFromChats > 0 ? totalFromChats : totalFromMap;

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
          aria-pressed={activeTab === "chats"}
        >
          <span>Chats</span>

          {/* Total unseen badge (top-right corner) */}
          {totalUnseen > 0 && (
            <span
              aria-hidden
              className="absolute -top-1 -left-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-cyan-500/95 text-black min-w-5 flex items-center justify-center shadow-md"
            >
              {totalUnseen > 99 ? "99+" : totalUnseen}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("contacts")}
          className={`relative z-10 w-1/2 py-2 text-sm font-medium rounded-lg transition-colors duration-300 ${
            activeTab === "contacts"
              ? "text-cyan-400"
              : "text-slate-400 hover:text-slate-300"
          }`}
          aria-pressed={activeTab === "contacts"}
        >
          Users
        </button>
      </div>
    </div>
  );
}

export default ActiveTabSwitch;
