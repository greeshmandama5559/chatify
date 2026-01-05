import useKeyBoardSound from "../hooks/useKeyBoardSound";
import { useState, useRef, useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import toast from "react-hot-toast";
import { useCryptoStore } from "../store/useCryptoStore";
import { XIcon, ImageIcon, SendIcon, Smile } from "lucide-react";
import EmojiPicker from "emoji-picker-react";

function MessageInput() {
  const { sendMessage, isSoundEnabled, selectedUser } = useChatStore();
  const kbHook = useKeyBoardSound();
  const selectRandomSound = kbHook?.selectRandomSound;
  const socket = useAuthStore.getState().socket;

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const pickerRef = useRef();

  // Local states
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  const textInputRef = useRef(null);

  const { encryptMessage } = useCryptoStore();

  // typing debounce
  const typingTimeoutRef = useRef(null);

  // Close emoji picker when clicked outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setShowEmojiPicker(false);
      }
    }
    if (showEmojiPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEmojiPicker]);

  // Safe emit typing
  const emitTyping = (isTyping) => {
    try {
      if (!socket || !selectedUser) return;
      socket.emit("typing", { to: selectedUser._id, isTyping });
    } catch (e) {
      console.log("error in message typing input: ", e);
    }
  };

  // Input change handler (plays sound + typing emit)
  const handleInputChange = (e) => {
    const value = e.target.value;
    setText(value);

    if (isSoundEnabled && typeof selectRandomSound === "function")
      selectRandomSound();

    emitTyping(true);

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      emitTyping(false);
      typingTimeoutRef.current = null;
    }, 1000);
  };

  const addEmoji = (emojiObj /*, event */) => {
    const char =
      emojiObj?.native ??
      emojiObj?.emoji ??
      (typeof emojiObj === "string" ? emojiObj : "");
    setText((prev) => (prev || "") + char);

    if (isSoundEnabled && typeof selectRandomSound === "function")
      selectRandomSound();

    emitTyping(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      emitTyping(false);
      typingTimeoutRef.current = null;
    }, 1000);
  };

  const handleSendMessage = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    const cleanText = (text || "").trim();

    // nothing to send
    if (!cleanText && !imagePreview) return;

    if (isSoundEnabled && typeof selectRandomSound === "function")
      selectRandomSound();

    // stop typing indicator
    emitTyping(false);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    try {
      // prepare fields: plainText for UI, cipherText for server
      let encryptedText = null;
      if (cleanText) {
        encryptedText = await encryptMessage(cleanText);
        if (!encryptedText) {
          console.error(
            "MessageInput: encryptMessage returned null for text:",
            cleanText
          );
          toast.error("Encryption failed — message not sent");
          return;
        }
      }

      const payloadForStore = {
        plainText: cleanText || "",
        cipherText: encryptedText || null,
        image: imagePreview || null,
      };

      setImagePreview(null);

      setText("");

      await sendMessage(payloadForStore);

      if (fileInputRef.current) fileInputRef.current.value = "";
      setShowEmojiPicker(false);

      if (textInputRef.current) {
        textInputRef.current.focus();
      }
    } catch (err) {
      console.error("send message error", err);
      toast.error("Failed to send message");
    }
  };

  // File change (image preview)
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);

      // Emit typing when user attaches an image
      emitTyping(true);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        emitTyping(false);
        typingTimeoutRef.current = null;
      }, 1000);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    emitTyping(false);
  };

  // ensure stop-typing on unmount or when selected user/socket changes
  useEffect(() => {
    return () => {
      try {
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = null;
        }
        emitTyping(false);
      } catch (e) {
        console.log("error in message typing input: ", e);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUser?._id, socket]);

  return (
    <>
      {imagePreview && (
        <div className="flex items-center gap-2 ml-3 mb-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="relative group">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-24 h-24 object-cover rounded-xl border border-slate-700 shadow-md"
            />
            <button
              onClick={removeImage}
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors shadow-sm"
              type="button"
              aria-label="Remove attached image"
            >
              <XIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      <div
        className="px-4 py-3 md:p-4 bg-slate-900/90 backdrop-blur-lg"
        style={{ minHeight: 64 }}
      >
        {/* Input Area */}
        <form
          onSubmit={handleSendMessage}
          className="flex items-center gap-3 md:gap-3 relative"
        >
          {/* Hidden File Input */}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            ref={fileInputRef}
            className="hidden"
          />

          {/* Image Upload Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={` md:p-3 rounded-full transition-all duration-200 ${
              imagePreview
                ? "text-cyan-400 bg-cyan-900/20"
                : "text-slate-400 hover:text-cyan-400 hover:bg-slate-800"
            }`}
            aria-label="Attach image"
          >
            <ImageIcon className="w-5 h-5" />
          </button>

          <input
            ref={textInputRef}
            type="text"
            value={text}
            onChange={handleInputChange}
            className="flex-1 min-w-0 bg-slate-800 text-slate-100 rounded-full h-12 px-5 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 placeholder-slate-500 transition-all"
            placeholder="Type a message..."
            aria-label="Type a message"
          />

          {/* Emoji Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowEmojiPicker((prev) => !prev);
              }}
              className={`p-2 md:p-3 rounded-full ${
                showEmojiPicker
                  ? "text-cyan-400 bg-slate-800"
                  : "text-slate-400 "
              }  hover:text-cyan-400 hover:bg-slate-800 transition-all`}
              aria-label="emojis"
            >
              <Smile className="w-5 h-5" />
            </button>
            {showEmojiPicker && (
              <div
                ref={pickerRef}
                className="absolute bottom-full mb-7 -left-51 z-50 shadow-2xl object-cover overflow-hidden"
                style={{ transform: "translateY(-4px)" }}
              >
                <EmojiPicker
                  onEmojiClick={addEmoji}
                  theme="dark"
                  emojiStyle="apple"
                  previewConfig={{ showPreview: false }}
                  searchDisabled={true}
                  height={300}
                  width={300}
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={!text.trim() && !imagePreview}
            className="p-3 rounded-full bg-linear-to-r from-cyan-600 to-cyan-700 text-white shadow-cyan-900/50 hover:from-cyan-500 hover:to-cyan-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95"
            aria-label="Send message"
          >
            <SendIcon className="w-5 h-5" />
          </button>
        </form>
      </div>
    </>
  );
}

export default MessageInput;
