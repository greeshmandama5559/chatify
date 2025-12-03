import ChatHeader from "./ChatHeader";
import NoChatHistoryPlaceholder from "./NoChatHistoryPlaceHolder";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { useEffect, useRef, useState } from "react";
import MessageInput from "./MessageInput";
import MessagesLoadingSkeleton from "./MessagesLoadingSkeleton";
import { LoaderCircle, DownloadCloud, X } from "lucide-react";
import ImageWithLoader from "./chat-container-components/ImageWithLoader";

function ChatContainer() {
  const {
    messages,
    getMessagesByUserId,
    selectedUser,
    isMessagesLoading,
    typingStatuses,
  } = useChatStore();
  const { authUser } = useAuthStore();

  const chatRef = useRef(null);
  const endRef = useRef(null);
  const isAutoScrollRef = useRef(true);

  const prevSelectedUserRef = useRef(null);
  const shouldForceScrollRef = useRef(false);

  // used to detect user-scrolled-away-from-bottom

  // modal state for viewing image
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSrc, setModalSrc] = useState(null);
  const [modalIsOptimistic, setModalIsOptimistic] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);

  useEffect(() => {
    const el = chatRef.current;
    if (!el) return;

    const onScroll = () => {
      // Consider 'near bottom' threshold in px
      const threshold = 150;
      const distanceFromBottom =
        el.scrollHeight - el.scrollTop - el.clientHeight;
      isAutoScrollRef.current = distanceFromBottom < threshold;
    };

    el.addEventListener("scroll", onScroll, { passive: true });

    // initialize
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
    // when switching to a new chat, we want to show the bottom (recent messages)
    // but only after messages are loaded
    shouldForceScrollRef.current = true;
    prevSelectedUserRef.current = selectedUser._id;
  }, [selectedUser?._id]);

  useEffect(() => {
    if (!chatRef.current) return;
    // Wait for the browser to finish layout/paint
    requestAnimationFrame(() => {
      // if we explicitly want to force scroll (e.g. chat open)
      if (shouldForceScrollRef.current) {
        endRef.current?.scrollIntoView({ behavior: "auto" });
        shouldForceScrollRef.current = false;
        isAutoScrollRef.current = true;
        return;
      }

      // otherwise, auto-scroll only when user is already near bottom (so new msgs reveal)
      if (isAutoScrollRef.current) {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    });
  }, [messages]);

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // open modal with image
  const openImageModal = (src, isOptimistic = false) => {
    if (!src) return;
    setModalSrc(src);
    setModalIsOptimistic(!!isOptimistic);
    setModalOpen(true);
    // disable body scroll while modal open
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalSrc(null);
    setModalIsOptimistic(false);
    document.body.style.overflow = "";
  };

  // attempt to download image with fetch->blob, fallback to opening in new tab.
  const downloadImage = async () => {
    if (!modalSrc) return;
    setDownloadLoading(true);

    // derive filename
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

    // If data URL, we can just create a link and click it
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
        // fallback to open in new tab
        console.log(err);
        window.open(modalSrc, "_blank", "noopener");
        setDownloadLoading(false);
        return;
      }
    }

    // For remote URLs try to fetch as blob (works if CORS allows)
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
      // CORS or network error — fallback: open image in new tab so user can right-click -> Save image as...
      console.log(err);
      window.open(modalSrc, "_blank", "noopener");
      setDownloadLoading(false);
      return;
    }
  };

  const partnerIsTyping = selectedUser
    ? !!typingStatuses[selectedUser._id]
    : false;

  console.log("Rendering ChatContainer, partnerIsTyping:", partnerIsTyping);

  return (
    <div className="flex flex-col min-h-0 h-full bg-slate-950 rounded-r-2xl">
      <ChatHeader />

      <div
        ref={chatRef}
        className="flex-1 min-h-0 py-4 px-4 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent"
      >
        {isMessagesLoading ? (
          <MessagesLoadingSkeleton />
        ) : messages.length > 0 ? (
          <div className="flex flex-col space-y-3">
            {messages.map((msg, idx) => {
              const isMine = msg.senderId === authUser._id;
              const profilePic = isMine
                ? authUser.profilePic || "/avatar.png"
                : selectedUser?.profilePic || "/avatar.png";

              const isOptimistic = !!msg.isOptimistic;
              const hasImage = !!msg.image;

              // is this the last rendered message?
              const isLast = idx === messages.length - 1;

              return (
                <div
                  key={msg._id || msg.tempId}
                  // add transition so the translate is smooth when typing status changes
                  className={`flex items-end gap-2 ${
                    isMine ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  {/* Avatar Bubble */}
                  <div className="flex-shrink-0">
                    <img
                      src={profilePic}
                      alt="profile"
                      onError={(e) => (e.currentTarget.src = "/avatar.png")}
                      className="w-7 h-7 rounded-full object-cover border border-slate-700 shadow-sm"
                      style={
                        isLast && partnerIsTyping
                          ? { transform: "translateY(-20px)" }
                          : undefined
                      }
                    />
                  </div>

                  {/* Message Bubble */}
                  <div
                    // If this is the last message and partner is typing, gently lift it.
                    style={
                      isLast && partnerIsTyping
                        ? { transform: "translateY(-20px)" }
                        : undefined
                    }
                    className={`relative max-w-[80%] px-3 py-2 shadow-lg transition-transform duration-200 mb-2
          ${
            isMine
              ? "bg-gradient-to-br from-cyan-600 to-cyan-700 text-white rounded-2xl rounded-br-sm shadow-cyan-900/20"
              : "bg-slate-800/90 backdrop-blur-sm text-slate-100 border border-slate-700/50 rounded-2xl rounded-bl-sm shadow-black/10"
          }
        `}
                  >
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
                              ? { transform: "translateY(-20px)" }
                              : undefined
                          }
                          onClick={() =>
                            openImageModal(msg.image, isOptimistic)
                          }
                        />
                      </div>
                    )}

                    {/* Text Content */}
                    {msg.text && (
                      <p className="text-sm leading-tight tracking-wide">
                        {msg.text}
                      </p>
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
            {/* Avatar with small ring */}
            <div className="w-7 h-7 rounded-full object-cover border border-slate-700 shadow-sm">
              <img
                src={selectedUser.profilePic || "/avatar.png"}
                alt={`${selectedUser.fullName} avatar`}
                onError={(e) => (e.currentTarget.src = "/avatar.png")}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Typing bubble */}
            <div className=" backdrop-blur-sm text-slate-100 text-xs rounded-full px-1 py-1 flex items-center gap-3">
              {/* Animated dots */}
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

              {/* Text */}
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
          {/* Clicking backdrop closes modal; stop propagation on content */}
          <div
            className="relative max-w-[95vw] max-h-[95vh] p-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={closeModal}
              aria-label="Close image"
              className="absolute top-2 right-2 z-60 rounded-full bg-black/40 backdrop-blur p-2 hover:bg-black/60"
            >
              <X size={18} className="text-white" />
            </button>

            {/* Download button */}
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

            {/* Image container */}
            <div className="rounded-lg bg-black/90 p-2 max-w-[95vw] max-h-[95vh] flex items-center justify-center">
              <img
                src={modalSrc}
                alt="Preview"
                className="max-w-[90vw] max-h-[82vh] object-contain rounded"
                onError={(e) => {
                  // show fallback by replacing src (or you can show message)
                  e.currentTarget.src = "/image-fallback.png";
                }}
              />
            </div>

            {/* Optional caption / optimistic notice */}
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
