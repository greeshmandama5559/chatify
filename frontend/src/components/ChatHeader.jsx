import { ArrowLeft, X as XIcon } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { useEffect, useMemo } from "react";
import { useAuthStore } from "../store/useAuthStore";
import toast from "react-hot-toast";
import CallButton from "./CallButton";
import { useProfileStore } from "../store/useProfileStore";
import { useNavigate } from "react-router-dom";

function ChatHeader() {
  const { selectedUser, setSelectedUser, sendMessage } = useChatStore();
  const { onlineUsers, authUser } = useAuthStore();
  const navigate = useNavigate();
  const { setIsVisitingProfile } = useProfileStore();

  const targetUserId = selectedUser?._id;

  const isOnline = useMemo(
    () => Boolean(selectedUser && onlineUsers?.includes(selectedUser?._id)),
    [selectedUser, onlineUsers]
  );

  const channel =
    authUser && selectedUser
      ? [authUser._id, targetUserId].sort().join("-")
      : null;

  // ✅ SINGLE Escape handler
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === "Escape") {
        navigate("/chats");
        setSelectedUser(null);
      }
    };
    window.addEventListener("keydown", handleEscKey);
    return () => window.removeEventListener("keydown", handleEscKey);
  }, [navigate, setSelectedUser]);

  if (!selectedUser) return null;

  const handleVideoCall = () => {
    // if (!isOnline) return toast.error("User is offline");
    if (!channel) return toast.error("Chat channel not ready");

    sendMessage({
      type: "video_call",
      textVideoCall: "🎥 Video call initiated",
      url: `${import.meta.env.VITE_CLIENT_ORIGIN}/call/${channel}`,
    });
  };

  return (
    <div className="sticky top-0 z-30 flex justify-between items-center min-h-0 p-4 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md">
      {/* LEFT SECTION */}
      <div className="flex items-center space-x-4 min-w-0">
        {/* BACK BUTTON (mobile only) */}
        <button
          onClick={() => {
            navigate("/chats");
            setSelectedUser(null);
          }}
          className="md:hidden p-2 rounded-full hover:bg-slate-800/50 transition"
        >
          <ArrowLeft className="w-5 h-5 text-slate-200" />
        </button>

        {/* Avatar */}
        <div
          className="relative shrink-0 cursor-pointer"
          onClick={() => {
            // likeCheck(selectedUser?._id);
            setIsVisitingProfile(true);
          }}
        >
          <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-700">
            <img
              src={selectedUser.profilePic || "/avatar.png"}
              alt={selectedUser.fullName}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Status Dot */}
          {selectedUser.isActive && (
            <span
              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-slate-900 ${
                isOnline
                  ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"
                  : "bg-slate-500"
              }`}
            ></span>
          )}
        </div>

        {/* Username */}
        <div
          className="min-w-0 cursor-pointer"
          onClick={() => {
            // likeCheck(selectedUser?._id);
            setIsVisitingProfile(true);
          }}
        >
          <h3 className="text-slate-100 font-semibold tracking-wide truncate">
            {selectedUser.fullName}
          </h3>
          {selectedUser.isActive && (
            <p
              className={`text-xs font-medium mt-1 ${
                isOnline ? "text-cyan-400" : "text-slate-500"
              }`}
            >
              {isOnline ? "Active Now" : "Offline"}
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-around items-center max-w-40 gap-10">
        <CallButton handleVideoCall={handleVideoCall} disabled={!channel} />

        <button
          onClick={() => {
            navigate("/chats");
            setSelectedUser(null);
          }}
          className="hidden md:flex p-2 rounded-full bg-slate-800/50 hover:bg-slate-700/50 text-slate-400 hover:text-white transition-all duration-200"
          aria-label="Close chat"
        >
          <XIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

export default ChatHeader;
