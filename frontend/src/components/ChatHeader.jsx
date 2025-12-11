/* eslint-disable react-hooks/rules-of-hooks */
import { ArrowLeft, X as XIcon } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { useState, useEffect, useMemo } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useQuery } from "@tanstack/react-query";
import { StreamChat } from "stream-chat";
import toast from "react-hot-toast";
import CallButton from "./CallButton";
import { getStreamToken } from "../store/api";
import LinkifyText from "./chat-container-components/LinkifyText";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

console.log("STREAM_API_KEY:", STREAM_API_KEY);

function ChatHeader() {
  const { selectedUser, setSelectedUser, sendMessage } = useChatStore();
  const { onlineUsers } = useAuthStore();

  const [channel, setChannel] = useState(null);

  const { authUser } = useAuthStore();

  const targetUserId = selectedUser?._id;

  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser,
  });

  useEffect(() => {
    const initChannelId = async () => {
      if (!tokenData?.token || !authUser) return;

      try {
        console.log("Connecting user...");

        const client = StreamChat.getInstance(STREAM_API_KEY);

        await client.connectUser(
          {
            id: authUser._id,
            name: authUser.fullName,
            image: authUser.profilePic,
          },
          tokenData.token
        );

        // channelId is a simple string: "minId-maxId"
        const channelId = [authUser._id, targetUserId].sort().join("-");

        console.log("Channel ID:", channelId);

        setChannel(channelId);
      } catch (error) {
        console.error("Error:", error);
      }
    };

    initChannelId();
  }, [tokenData, authUser, targetUserId]);

  if (!selectedUser) return null;

  const isOnline = useMemo(
    () => Boolean(selectedUser && onlineUsers?.includes(selectedUser._id)),
    [selectedUser, onlineUsers]
  );

  const handleVideoCall = () => {
    if (!isOnline) {
      return toast.error("User is offline. Cannot initiate video call.");
    }

    if (!channel) {
      return toast.error("Chat channel is not ready yet. Please try again.");
    }

    // channel is a string (channelId) — use it directly
    const callUrl = `${import.meta.env.VITE_BACKEN_URL}/call/${channel}`;
    console.log("Generated call URL:", callUrl);

    // Send plain text containing the url. LinkifyText in the message renderer
    // will convert the URL into a clickable link for both sender & receiver.
    sendMessage({
      type: "video_call",
      text: `Video call initiated`,
      url: callUrl,
      image: "",
    });
  };

  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === "Escape") setSelectedUser(null);
    };
    window.addEventListener("keydown", handleEscKey);
    return () => window.removeEventListener("keydown", handleEscKey);
  }, [setSelectedUser]);

  return (
    <div className="flex justify-between items-center p-4 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-10">
      {/* LEFT SECTION */}
      <div className="flex items-center space-x-4 min-w-0">
        {/* BACK BUTTON (mobile only) */}
        <button
          onClick={() => setSelectedUser(null)}
          className="md:hidden p-2 rounded-full hover:bg-slate-800/50 transition"
        >
          <ArrowLeft className="w-5 h-5 text-slate-200" />
        </button>

        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-700">
            <img
              src={selectedUser.profilePic || "/avatar.png"}
              alt={selectedUser.fullName}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Status Dot */}
          <span
            className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-slate-900 ${
              isOnline
                ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"
                : "bg-slate-500"
            }`}
          ></span>
        </div>

        {/* Username */}
        <div className="min-w-0">
          <h3 className="text-slate-100 font-semibold tracking-wide truncate">
            {selectedUser.fullName} 
          </h3>
          <p
            className={`text-xs font-medium mt-1 ${
              isOnline ? "text-cyan-400" : "text-slate-500"
            }`}
          >
            {isOnline ? "Active Now" : "Offline"}
          </p>
        </div>
      </div>

      <div className="flex justify-around items-center max-w-40 gap-10">
        <CallButton
          handleVideoCall={handleVideoCall}
          disabled={!channel || !isOnline}
        />

        <button
          onClick={() => setSelectedUser(null)}
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
