import { VideoIcon } from "lucide-react";

function CallButton({ handleVideoCall, disabled }) {
  return (
    <button
      onClick={disabled ? undefined : handleVideoCall}
      disabled={disabled}
      className={`
        py-2 px-3 rounded-full flex justify-center items-center transition
        ${disabled
          ? "bg-slate-700 opacity-40 cursor-not-allowed"
          : "bg-cyan-500 hover:bg-cyan-700 cursor-pointer"
        }
      `}
    >
      <VideoIcon size={22} className="text-white" />
    </button>
  );
}

export default CallButton;
