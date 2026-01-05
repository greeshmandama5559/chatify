// import { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import UsersLoadingSkeleton from "./UsersLoadingSkeleton";
import NoChatsFound from "./NoChatsFound";
import { useAuthStore } from "../store/useAuthStore";
import { useProfileStore } from "../store/useProfileStore";
import { useNavigate } from "react-router-dom";
import { formatTime } from "../utils/FormatTime";

function ChatsList() {
  const {
    // getMyChatPartners,
    chats = [],
    getMessagesByUserId,
    isUsersLoading,
    selectedUser,
    setSelectedUser,
    unseenCounts = {},
    // lastUnseenMessageId = {},
    typingStatuses = {},
    // hydrateFromServer,
  } = useChatStore();

  const { onlineUsers = [], authUser = {} } = useAuthStore();

  const { setIsVisitingProfile } = useProfileStore();

  const navigate = useNavigate();

  if (isUsersLoading) return <UsersLoadingSkeleton />;
  if (!Array.isArray(chats) || chats.length === 0) return <NoChatsFound />;

  // helper to normalise ids to strings for consistent lookup
  const toId = (v) => String(v ?? "");

  const meId = toId(authUser?._id);

  const onlineSet = new Set(onlineUsers.map(toId));

  return (
    <div className="px-3 pb-4 space-y-1 mb-15 md:mb-0">
      {chats.filter(Boolean).map((chat) => {
        if (!chat || !chat._id) return null;

        const chatId = toId(chat?._id);
        const isSelected = toId(selectedUser?._id) === chatId;
        const isOnline = onlineSet.has(chatId);
        const isMeSender = toId(chat.lastMessageSender) === meId;
        const isTyping = !!typingStatuses?.[chatId];
        const cached = useChatStore.getState().messagesCache[chatId] || [];
        const lastMessage =
          cached.length > 0 ? cached[cached.length - 1] : null;

        // Show typing if other user is typing, not the current user, and chat isn't currently selected.
        const showTyping = isTyping && !isSelected;

        // unseenCount: prefer chat.unseenCount (if present) else fall back to unseenCounts map
        const unseenCountRaw =
          chat.unseenCount !== undefined
            ? Number(chat.unseenCount) || 0
            : Number(unseenCounts?.[chatId]) || 0;
        const hasUnseen = unseenCountRaw > 0;

        // const isLastUnseenForThisChat =
        //   lastUnseenMessageId?.[chatId] &&
        //   lastUnseenMessageId[chatId] === chat.lastMessageId;

        // Prefer explicit plain text fields (store sets plainText). Fallback to lastMessageText.
        const previewValue =
          chat.type === "video_call"
            ? chat.lastMessageText
            : chat.plainText || chat.lastMessageText || "No messages yet";

        return (
          <button
            key={chatId}
            onClick={() => {
              setSelectedUser(chat);
              setIsVisitingProfile(false);

              // ✅ ALWAYS reset first
              useChatStore.setState({
                chatMessages: cached,
              });

              // Fetch fresh (cache-aware)
              getMessagesByUserId(chatId, { silent: false });

              navigate(`/chats/${chatId}`);
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
              {isOnline && chat.isActive && (
                <span className="absolute mb-0.5 mr-0.5 bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-slate-900 rounded-full shadow-sm" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 text-left min-w-0">
              <div className="flex justify-between items-baseline">
                <h4
                  className={`font-medium text-sm truncate transition-colors ${
                    isSelected
                      ? "text-cyan-100"
                      : "text-slate-300 group-hover:text-white"
                  }`}
                >
                  {chat.fullName || "Unknown"}
                </h4>

                {/* Unseen badge */}
                {hasUnseen && (
                  <div className="ml-2 flex items-center">
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-cyan-500/95 text-black min-w-5 text-center">
                      {unseenCountRaw > 9 ? "9+" : unseenCountRaw}
                    </span>
                  </div>
                )}
              </div>

              <div
                className={`text-xs truncate mt-0.5 flex items-center ${
                  isSelected
                    ? "text-cyan-200/60"
                    : "text-slate-500 group-hover:text-slate-400"
                }`}
              >
                {showTyping && (
                  <span
                    className={`flex-1 truncate inline-flex items-center gap-2 ${
                      isSelected
                        ? "text-cyan-400/80"
                        : hasUnseen
                        ? "text-cyan-200 font-semibold"
                        : "text-slate-400"
                    }`}
                  >
                    <span className="truncate">Typing...</span>
                  </span>
                )}

                {!showTyping && previewValue ? (
                  <>
                    {isMeSender && (
                      <div className="flex items-center justify-between w-full gap-3 group">
                        <div
                          className={`flex items-baseline gap-1.5 min-w-0 ${
                            isSelected ? "text-cyan-100" : "text-slate-400"
                          }`}
                        >
                          {/* Label */}
                          <span className="text-[11px] font-bold tracking-wider text-slate-300 opacity-90 shrink-0">
                            You:
                          </span>

                          {/* Message & Time Container */}
                          <div className="flex items-baseline gap-2 min-w-0 overflow-hidden">
                            <span
                              className={`truncate text-[12px] ${
                                isSelected ? "text-white" : "text-slate-400"
                              }`}
                            >
                              {previewValue}
                            </span>
                            <span className="text-[10px] opacity-80 whitespace-nowrap">
                              {formatTime(chat.lastMessageTime)}
                            </span>
                          </div>
                        </div>

                        {/* Status Icon Logic */}
                        {chat?.isSeenOn && authUser?.isSeenOn && !isSelected && (
                          <div className="shrink-0 flex items-center">
                            {lastMessage?.seen ? (
                              <span className="text-cyan-400 text-xs font-bold leading-none">
                                ✓✓
                              </span>
                            ) : (
                              <span className="text-slate-500 text-[14px] leading-none">
                                ✓
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {!isMeSender && (
                      <div
                        className={`flex items-center justify-between w-full gap-2 py-0.5`}
                      >
                        <div
                          className={`flex-1 truncate inline-flex items-center gap-2.5 ${
                            isSelected
                              ? "text-cyan-400/90"
                              : hasUnseen
                              ? "text-white font-medium"
                              : "text-slate-400"
                          }`}
                        >
                          {/* Indicator Bar */}
                          {hasUnseen && (
                            <span
                              aria-hidden
                              className="inline-block w-1 h-3.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)] shrink-0"
                            />
                          )}

                          {/* Message Content */}
                          <span className="truncate text-[12px]">
                            {previewValue}
                          </span>

                          {/* Time - Styled subtly */}
                          <span className="text-[10px] opacity-80 mt-1 whitespace-nowrap">
                            {formatTime(chat.lastMessageTime)}
                          </span>
                        </div>

                        {/* "New" Badge */}
                        {hasUnseen && (
                          <span className="ml-2 mr-10 text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500 text-black">
                            new
                          </span>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  !showTyping && (
                    <span className="text-slate-500 italic">
                      🎥 video call initiated
                    </span>
                  )
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

export default ChatsList;
