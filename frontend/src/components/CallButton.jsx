import { VideoIcon } from "lucide-react";

function CallButton({ handleVideoCall, disabled }) {
  return (
    <button
      onClick={disabled ? undefined : handleVideoCall}
      disabled={disabled}
      className={`
        py-2 px-3 rounded-full flex justify-center items-center transition cursor-pointer
      `}
    >
      <VideoIcon size={25} className="text-cyan-400 hover:text-cyan-600" />
    </button>
  );
}

export default CallButton;
