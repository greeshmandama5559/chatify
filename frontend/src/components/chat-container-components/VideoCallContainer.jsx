import toast from "react-hot-toast";
// import { useChatStore } from "../../store/useChatStore";
// import { useState } from "react";

function VideoCallContainer({ msg }) {

  // const [isDeclined, setIsDeclined] = useState(false);

  return (
    <div className="w-full max-w-sm p-3 bg-slate-800/80 border border-slate-700 rounded-lg flex items-center gap-3">
      {/* Thumbnail */}
      <div className="flex-shrink-0 w-16 h-10 overflow-hidden rounded-md bg-slate-700">
        <img
          src="/video-call-image.jpg"
          alt="Video call"
          className="w-full h-full object-cover"
          onError={(e) => (e.currentTarget.src = "/video-call-thumb.png")}
        />
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm truncate">
          {msg.text || "Video call"}
        </div>
        <div className="text-xs text-slate-400 truncate mt-1">
          {msg.url
            ? new URL(msg.url).hostname + " — click Join to open"
            : "No link"}
        </div>

        <div className="flex items-center gap-2 mt-2">
          {msg.url ? (
            <a
              href={msg.url}
              // target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-md bg-cyan-600 text-xs font-medium text-white hover:opacity-95"
              onClick={(e) => e.stopPropagation()}
            >
              Join
            </a>
          ) : (
            <button
              className="px-3 py-1.5 rounded-md bg-slate-700 text-xs text-slate-200"
              disabled
            >
              No Link
            </button>
          )}

          {/* <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsDeclined(true);
            }}
            className="px-3 py-1.5 rounded-md bg-red-500 text-xs text-slate-200"
          >
            {isDeclined ? "Declined" : "Decline"}
          </button> */}

          {msg.url && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                // copy call url
                navigator.clipboard?.writeText(msg.url).then(
                  () => toast.success("Call link copied"),
                  () => toast.error("Unable to copy")
                );
              }}
              className="ml-auto text-xs text-slate-400 hover:text-slate-200"
            >
              Copy
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default VideoCallContainer;
