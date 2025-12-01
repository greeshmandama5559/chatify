import { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
// import { useAuthStore } from "../store/useAuthStore";
import UsersLoadingSkeleton from "./UsersLoadingSkeleton";
import NoChatsFound from "./NoChatsFound";

function ChatsList() {
  const { chats, getMyChatPartners, setSelectedUser, isUsersLoading } =
    useChatStore();
  // const { onlineUsers } = useAuthStore();

  useEffect(() => {
    getMyChatPartners();
  }, [getMyChatPartners]);

  if (isUsersLoading) return <UsersLoadingSkeleton size={3} />;
  if (chats.length === 0) return <NoChatsFound />;

  return (
    <>
      {chats.map((chat) => {
        return (
          <div
            key={chat._id}
            className="bg-cyan-500/10 p-4 rounded-2xl cursor-pointer hover:bg-cyan-500/20 transition-colors"
            onClick={() => setSelectedUser(chat)}
          >
            <div className="flex items-center gap-3">
              <div className="avatar avatar-offline">
                <div className="size-12 rounded-full">
                  <img
                    src={chat.profilePic || "/avatar.png"}
                    alt={chat.fullName}
                  />
                </div>
              </div>
              <h4 className="text-slate-200 font-medium truncate">
                {chat.fullName}
              </h4>
            </div>
          </div>
        );
      })}
    </>
  );
}

export default ChatsList;
