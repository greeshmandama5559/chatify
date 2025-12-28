import ChatHeader from "./ChatHeader";
import NoChatHistoryPlaceholder from "./NoChatHistoryPlaceholder";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { useEffect, useRef, useState } from "react";
import MessageInput from "./MessageInput";
import MessagesLoadingSkeleton from "./MessagesLoadingSkeleton";
import { LoaderCircle, DownloadCloud, X, Trash2 } from "lucide-react";
import ImageWithLoader from "./chat-container-components/ImageWithLoader";
import LinkifyText from "./chat-container-components/LinkifyText";
import VideoCallContainer from "./chat-container-components/VideoCallContainer";

function ChatContainer() {
  const {
    messages,
    getMessagesByUserId,
    selectedUser,
    isMessagesLoading,
    typingStatuses,
    deleteMessage,
  } = useChatStore();
  const { authUser, socket, connectSocket } = useAuthStore();

  const chatRef = useRef(null);
  const endRef = useRef(null);
  const isAutoScrollRef = useRef(true);

  const prevSelectedUserRef = useRef(null);
  const shouldForceScrollRef = useRef(false);

  // modal state for viewing image
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSrc, setModalSrc] = useState(null);
  const [modalIsOptimistic, setModalIsOptimistic] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);

  const [showDeleteFor, setShowDeleteFor] = useState(false);

  const isDeclined = messages.isDeclined;

  const timerRef = useRef(null);

  const handleMouseDown = (msgId) => {
    timerRef.current = setTimeout(() => {
      setShowDeleteFor(msgId); // only show for this message
    }, 600); // 600ms long press threshold
  };

  const handleMouseUp = () => {
    clearTimeout(timerRef.current);
  };

  useEffect(() => {
    const handleClickOutside = () => {
      // If click is anywhere, hide delete button
      setShowDeleteFor(null);
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  useEffect(() => {
    if (authUser && (!socket || !socket.connected)) {
      connectSocket();
    }
  }, [authUser, connectSocket, socket]);

  useEffect(() => {
    useChatStore.getState().migrateDecryptCache();
  }, []);

  useEffect(() => {
    const el = chatRef.current;
    if (!el) return;

    const onScroll = () => {
      const threshold = 150;
      const distanceFromBottom =
        el.scrollHeight - el.scrollTop - el.clientHeight;
      isAutoScrollRef.current = distanceFromBottom < threshold;
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      el.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    if (!selectedUser?._id) return;
    getMessagesByUserId(selectedUser._id);
  }, [selectedUser, getMessagesByUserId]);

  useEffect(() => {
    if (!selectedUser?._id) return;
    shouldForceScrollRef.current = true;
    prevSelectedUserRef.current = selectedUser._id;
  }, [selectedUser?._id]);

  useEffect(() => {
    if (!chatRef.current) return;

    if (shouldForceScrollRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
      shouldForceScrollRef.current = false;
      return;
    }

    if (isAutoScrollRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages.length]);

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const openImageModal = (src, isOptimistic = false) => {
    if (!src) return;
    setModalSrc(src);
    setModalIsOptimistic(!!isOptimistic);
    setModalOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalSrc(null);
    setModalIsOptimistic(false);
    document.body.style.overflow = "";
  };

  const downloadImage = async () => {
    if (!modalSrc) return;
    setDownloadLoading(true);

    let filename = "image";
    try {
      const parts = modalSrc.split("/").pop().split("?")[0];
      if (parts) {
        filename = parts;
      }
    } catch (e) {
      console.log(e);
      filename = "image";
    }

    if (modalSrc.startsWith("data:")) {
      try {
        const a = document.createElement("a");
        a.href = modalSrc;
        a.download = filename.includes(".") ? filename : `${filename}.png`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setDownloadLoading(false);
        return;
      } catch (err) {
        console.log(err);
        window.open(modalSrc, "_blank", "noopener");
        setDownloadLoading(false);
        return;
      }
    }

    try {
      const res = await fetch(modalSrc, { mode: "cors" });
      if (!res.ok) throw new Error("Failed to fetch");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename.includes(".") ? filename : `${filename}.jpg`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setDownloadLoading(false);
      return;
    } catch (err) {
      console.log(err);
      window.open(modalSrc, "_blank", "noopener");
      setDownloadLoading(false);
      return;
    }
  };

  const partnerIsTyping = selectedUser
    ? !!typingStatuses[selectedUser._id]
    : false;

  return (
    <div className="flex flex-col h-full min-h-0 bg-slate-950 rounded-r-2xl">
      <ChatHeader />

      <div
        ref={chatRef}
        className="flex-1 min-h-0 py-4 px-4 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent"
      >
        {isMessagesLoading ? (
          <MessagesLoadingSkeleton />
        ) : messages.length > 0 ? (
          <div className="flex flex-col space-y-3 mt-2">
            {messages.map((msg, idx) => {
              const isMine = msg.senderId === authUser?._id;
              const profilePic = isMine
                ? authUser.profilePic || "/avatar.png"
                : selectedUser?.profilePic || "/avatar.png";

              const isOptimistic = !!msg.isOptimistic;
              const hasImage = !!msg.image;

              // prefer stored plainText (populated by store) if available
              const plainText =
                msg.type === "video_call"
                  ? msg.text
                  : msg.plainText ?? msg.plain_text ?? msg.textPlain ?? null;

              const isLast = idx === messages.length - 1;

              return (
                <div
                  key={msg._id || msg.tempId}
                  className={`flex items-end gap-2 ${
                    isMine ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  {/* Avatar Bubble */}
                  <div
                    className="shrink-0"
                    style={
                      isLast && partnerIsTyping
                        ? { transform: "translateY(-20px)" }
                        : undefined
                    }
                  >
                    <img
                      src={profilePic}
                      alt="profile"
                      onError={(e) => (e.currentTarget.src = "/avatar.png")}
                      className="w-7 h-7 rounded-full object-cover border border-slate-700 shadow-sm"
                    />
                  </div>

                  {/* Message Bubble */}
                  <div
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      handleMouseDown(msg._id);
                    }}
                    onMouseUp={(e) => {
                      e.stopPropagation();
                      handleMouseUp();
                    }}
                    onMouseLeave={(e) => {
                      e.stopPropagation();
                      handleMouseUp();
                    }}
                    onTouchStart={(e) => {
                      e.stopPropagation();
                      handleMouseDown(msg._id);
                    }}
                    onTouchEnd={(e) => {
                      e.stopPropagation();
                      handleMouseUp();
                    }}
                    style={
                      isLast && partnerIsTyping
                        ? { transform: "translateY(-16px)" }
                        : undefined
                    }
                    className={`relative max-w-[80%] px-3 py-2 shadow-lg transition-transform duration-200 mb-2 group flex items-center flex-col
                      ${
                        isMine
                          ? "bg-linear-to-br from-cyan-600 to-cyan-700 text-white rounded-2xl rounded-br-sm shadow-cyan-900/20"
                          : "bg-slate-800/90 backdrop-blur-sm text-slate-100 border border-slate-700/50 rounded-2xl rounded-bl-sm shadow-black/10"
                      }
                    `}
                  >
                    {/* If this is a video call message, render call card; otherwise normal content */}
                    {msg.type === "video_call" ? (
                      <VideoCallContainer msg={msg} isDeclined={isDeclined} />
                    ) : (
                      <>
                        {/* Image Attachment */}
                        {hasImage && (
                          <div className="mb-2">
                            <ImageWithLoader
                              src={msg.image}
                              alt="Attachment"
                              isOptimistic={isOptimistic}
                              isAutoScrollRef={isAutoScrollRef}
                              shouldForceScrollRef={shouldForceScrollRef}
                              endRef={endRef}
                              className={
                                isMine
                                  ? "border-cyan-500/30"
                                  : "border-slate-600/30"
                              }
                              style={
                                isLast && partnerIsTyping
                                  ? { transform: "translateY(-16px)" }
                                  : undefined
                              }
                              onClick={() =>
                                openImageModal(msg.image, isOptimistic)
                              }
                            />
                          </div>
                        )}

                        {/* Text Content (prefer plainText only) */}
                        {plainText && (
                          <p className="text-sm leading-tight tracking-wide wrap-break-word">
                            {LinkifyText(plainText)}
                          </p>
                        )}
                      </>
                    )}

                    {/* Timestamp (Inside Bubble) */}
                    <div
                      className={`text-[10px] mt-1 w-full flex ${
                        isMine
                          ? "justify-end text-cyan-100/70"
                          : "justify-end text-slate-400"
                      }`}
                    >
                      {formatTime(msg.createdAt)}
                    </div>

                    {isMine && showDeleteFor === msg._id && (
                      <button
                        className="absolute -left-6 bottom-3 text-red-500 cursor-pointer"
                        onClick={async (e) => {
                          e.stopPropagation();
                          await deleteMessage(msg._id, selectedUser?._id);
                          setShowDeleteFor(null);
                        }}
                      >
                        <Trash2 size={20} />
                      </button>
                    )}
                    <button
                      className={`opacity-0 absolute ${
                        isMine &&
                        "cursor-pointer text-red-500 group-hover:opacity-90 -left-6 bottom-3"
                      }`}
                      onClick={async () => {
                        await deleteMessage(msg._id, selectedUser?._id);
                      }}
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              );
            })}
            <div ref={endRef} />
          </div>
        ) : (
          <NoChatHistoryPlaceholder name={selectedUser?.fullName} />
        )}
      </div>

      {/* Typing indicator area */}
      <div className="px-4">
        {partnerIsTyping && selectedUser && (
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-full object-cover border border-slate-700 shadow-sm">
              <img
                src={selectedUser.profilePic || "/avatar.png"}
                alt={`${selectedUser.fullName} avatar`}
                onError={(e) => (e.currentTarget.src = "/avatar.png")}
                className="w-full h-full object-cover rounded-full"
              />
            </div>

            <div className=" backdrop-blur-sm text-slate-100 text-xs rounded-full px-1 py-1 flex items-center gap-3">
              <div className="flex items-center gap-1">
                <span
                  className="inline-block w-2 h-2 rounded-full bg-slate-300/80 animate-bounce"
                  style={{ animationDuration: "600ms", animationDelay: "0ms" }}
                />
                <span
                  className="inline-block w-2 h-2 rounded-full bg-slate-300/80 animate-bounce"
                  style={{
                    animationDuration: "600ms",
                    animationDelay: "120ms",
                  }}
                />
                <span
                  className="inline-block w-2 h-2 rounded-full bg-slate-300/80 animate-bounce"
                  style={{
                    animationDuration: "600ms",
                    animationDelay: "240ms",
                  }}
                />
              </div>

              <span className="text-slate-300/90"></span>
            </div>
          </div>
        )}
      </div>

      <div className="px-0 mt-1 py-0 border-slate-800/60">
        <MessageInput />
      </div>

      {/* Image Modal */}
      {modalOpen && modalSrc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
          onClick={closeModal}
        >
          <div
            className="relative max-w-[95vw] max-h-[95vh] p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeModal}
              aria-label="Close image"
              className="absolute top-2 right-2 z-60 rounded-full bg-black/40 backdrop-blur p-2 hover:bg-black/60"
            >
              <X size={18} className="text-white" />
            </button>

            <button
              onClick={downloadImage}
              aria-label="Download image"
              className="absolute top-2 right-12 z-60 rounded-full bg-black/40 backdrop-blur p-2 hover:bg-black/60 flex items-center gap-2"
            >
              {downloadLoading ? (
                <LoaderCircle size={16} className="animate-spin text-white" />
              ) : (
                <DownloadCloud size={16} className="text-white" />
              )}
            </button>

            <div className="rounded-lg bg-black/90 p-2 max-w-[95vw] max-h-[95vh] flex items-center justify-center">
              <img
                src={modalSrc}
                alt="Preview"
                className="max-w-[72vw] max-h-[82vh] object-contain rounded"
                onError={(e) => {
                  e.currentTarget.src = "/image-fallback.png";
                }}
              />
            </div>

            {modalIsOptimistic && (
              <div className="mt-2 text-xs text-white/70 text-center">
                Uploading (preview)
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatContainer;
