import useKeyBoardSound from "../hooks/useKeyBoardSound";
import { useState, useRef, useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import toast from "react-hot-toast";
import { XIcon, ImageIcon, SendIcon } from "lucide-react";

function MessageInput() {
  const { sendMessage, isSoundEnabled, selectedUser } = useChatStore();
  const { selectRandomSound } = useKeyBoardSound();
  const socket = useAuthStore.getState().socket;

  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  // typing timeout ref so we debounce 'stop typing' emits
  const typingTimeoutRef = useRef(null);

  // helper to safely emit typing events
  const emitTyping = (isTyping) => {
    try {
      if (!socket || !selectedUser) return;
      // payload: { to: <userId>, isTyping: boolean }
      socket.emit("typing", { to: selectedUser._id, isTyping });
    } catch (e) {
      console.log("error in message typing input: ", e);
    }
  };

  // call when user changes input
  const handleInputChange = (e) => {
    const value = e.target.value;
    setText(value);

    // play keyboard sound if enabled
    if (isSoundEnabled) selectRandomSound();

    // emit typing start
    emitTyping(true);

    // reset stop-typing timer
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      emitTyping(false);
      typingTimeoutRef.current = null;
    }, 1000); // 1s of inactivity -> stop typing
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;
    if (isSoundEnabled) selectRandomSound();

    // stop typing immediately before sending
    emitTyping(false);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    sendMessage({
      text: text.trim(),
      image: imagePreview,
    });

    setText("");
    setImagePreview(null);

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

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

      // Emit typing when user attaches an image so the other side knows something's happening
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

    // if user removed the image and is not typing, ensure we send stop typing
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    emitTyping(false);
  };

  // on unmount -> ensure we send stop-typing
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
    <div className="p-4 bg-slate-900/90 backdrop-blur-lg">
      {/* Image Preview Area */}
      {imagePreview && (
        <div className="flex items-center gap-2 mb-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
          {" "}
          <div className="relative group">
            {" "}
            <img
              src={imagePreview}
              alt="Preview"
              className="w-24 h-24 object-cover rounded-xl border border-slate-700 shadow-md"
            />{" "}
            <button
              onClick={removeImage}
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors shadow-sm"
              type="button"
            >
              {" "}
              <XIcon className="w-3.5 h-3.5" />{" "}
            </button>{" "}
          </div>{" "}
        </div>
      )}
      {/* Input Area */}
      <form onSubmit={handleSendMessage} className="flex items-center gap-3">
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
          className={`p-3 rounded-full transition-all duration-200 ${
            imagePreview
              ? "text-cyan-400 bg-cyan-900/20"
              : "text-slate-400 hover:text-cyan-400 hover:bg-slate-800"
          }`}
        >
          <ImageIcon className="w-5 h-5" />
        </button>

        {/* Text Input */}
        <input
          type="text"
          value={text}
          onChange={handleInputChange}
          className="flex-1 bg-slate-800 text-slate-100 rounded-full py-3 px-5 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 placeholder-slate-500 transition-all"
          placeholder="Type a message..."
        />

        {/* Send Button */}
        <button
          type="submit"
          disabled={!text.trim() && !imagePreview}
          className="p-3 rounded-full bg-gradient-to-r from-cyan-600 to-cyan-700 text-white shadow-lg shadow-cyan-900/20 hover:from-cyan-500 hover:to-cyan-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95"
        >
          <SendIcon className="w-5 h-5 pl-0.5" />{" "}
          {/* pl-0.5 centers the icon visually */}
        </button>
      </form>
    </div>
  );
}

export default MessageInput;
