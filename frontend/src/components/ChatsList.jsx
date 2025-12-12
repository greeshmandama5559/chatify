import { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import UsersLoadingSkeleton from "./UsersLoadingSkeleton";
import NoChatsFound from "./NoChatsFound";
import { useAuthStore } from "../store/useAuthStore";

function ChatsList() {
  const {
    getMyChatPartners,
    chats = [],
    isUsersLoading,
    selectedUser,
    setSelectedUser,
    unseenCounts = {},
    lastUnseenMessageId = {},
    typingStatuses = {},
  } = useChatStore();

  // onlineUsers might be undefined until auth store initializes — default to []
  const { onlineUsers = [], authUser = {} } = useAuthStore();

  useEffect(() => {
    getMyChatPartners();
  }, [getMyChatPartners]);

  if (isUsersLoading) return <UsersLoadingSkeleton />;
  if (!Array.isArray(chats) || chats.length === 0) return <NoChatsFound />;

  // helper to normalise ids to strings for consistent lookup
  const toId = (v) => String(v ?? "");

  const meId = toId(authUser._id);

  return (
    <div className="px-3 pb-4 space-y-1">
      {chats
        .filter(Boolean)
        .map((chat) => {
          if (!chat || !chat._id) return null;

          const chatId = toId(chat._id);
          const isSelected = toId(selectedUser?._id) === chatId;
          const isOnline = onlineUsers.map(toId).includes(chatId);
          const isMeSender = toId(chat.lastMessageSender) === meId;
          const isTyping = !!typingStatuses?.[chatId];

          // Show typing if other user is typing, not the current user, and chat isn't currently selected.
          const showTyping = isTyping && chatId !== meId && !isSelected;

          // unseenCount: prefer chat.unseenCount (if present) else fall back to unseenCounts map
          const unseenCountRaw =
            chat.unseenCount !== undefined
              ? Number(chat.unseenCount) || 0
              : Number(unseenCounts?.[chatId]) || 0;
          const hasUnseen = unseenCountRaw > 0;

          // lastUnseenMessageId might be stored keyed by chatId (string)
          const isLastUnseenForThisChat = !!(lastUnseenMessageId && lastUnseenMessageId[chatId]);

          // Prefer explicit plain text fields (store sets plainText). Fallback to lastMessageText.
          const previewValue = chat.plainText ?? chat.lastMessagePlain ?? chat.lastMessageText ?? "";

          return (
            <button
              key={chatId}
              onClick={() => {
                if (!isSelected) {
                  setSelectedUser(chat);
                  window.history.pushState({ chat: chat._id }, "", `#/chat/${chat._id}`);
                }
              }}
              aria-pressed={isSelected}
              className={`w-full p-3 flex items-center gap-3 rounded-xl transition-all duration-200 group
                ${
                  isSelected
                    ? "bg-slate-800/80 ring-1 ring-cyan-500/50 shadow-lg shadow-black/20"
                    : "hover:bg-slate-800/50 hover:pl-4"
                }
              `}
            >
              {/* Avatar */}
              <div className="relative">
                <div className="w-12 h-12 rounded-full overflow-hidden border border-slate-700 group-hover:border-slate-600 transition-colors">
                  <img
                    src={chat.profilePic || "/avatar.png"}
                    alt={chat.fullName || "avatar"}
                    className="w-full h-full object-cover"
                  />
                </div>
                {isOnline && (
                  <span className="absolute mb-0.5 mr-0.5 bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-slate-900 rounded-full shadow-sm" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 text-left min-w-0">
                <div className="flex justify-between items-baseline">
                  <h4
                    className={`font-medium text-sm truncate transition-colors ${
                      isSelected ? "text-cyan-100" : "text-slate-300 group-hover:text-white"
                    }`}
                  >
                    {chat.fullName || "Unknown"}
                  </h4>

                  {/* Unseen badge */}
                  {hasUnseen && (
                    <div className="ml-2 flex items-center">
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-green-500/95 text-black min-w-[20px] text-center">
                        {unseenCountRaw > 9 ? "9+" : unseenCountRaw}
                      </span>
                    </div>
                  )}
                </div>

                <p
                  className={`text-xs truncate mt-0.5 flex items-center ${
                    isSelected ? "text-cyan-200/60" : "text-slate-500 group-hover:text-slate-400"
                  }`}
                >
                  {showTyping && (
                    <span
                      className={`flex-1 truncate inline-flex items-center gap-2 ${
                        isSelected ? "text-cyan-400/80" : hasUnseen ? "text-green-200 font-semibold" : "text-slate-400"
                      }`}
                    >
                      <span className="truncate">Typing...</span>
                    </span>
                  )}

                  {!showTyping && previewValue ? (
                    <>
                      {isMeSender && (
                        <span className={isSelected ? "text-cyan-400/80" : "text-slate-400"}>
                          You:{" "}
                          <span className="truncate">
                            {previewValue}
                          </span>
                        </span>
                      )}

                      {!isMeSender && (
                        <span
                          className={`flex-1 truncate inline-flex items-center gap-2 ${
                            isSelected ? "text-cyan-400/80" : hasUnseen ? "text-green-200 font-semibold" : "text-slate-400"
                          }`}
                        >
                          {isLastUnseenForThisChat && (
                            <span aria-hidden className="inline-block w-1 h-4 rounded-full bg-green-400 flex-shrink-0" />
                          )}
                          <span className="truncate">{previewValue}</span>
                          {isLastUnseenForThisChat && (
                            <span className="ml-2 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-500 text-black">
                              new
                            </span>
                          )}
                        </span>
                      )}
                    </>
                  ) : (
                    !showTyping && (
                      // If there's a cipher but no plainText, indicate encrypted message
                      (chat.cipherText || chat.lastMessageText) ? (
                        <span className="text-xs italic text-slate-400">Encrypted message</span>
                      ) : (
                        <span className="text-slate-500 italic">No messages</span>
                      )
                    )
                  )}
                </p>
              </div>
            </button>
          );
        })}
    </div>
  );
}

export default ChatsList;
