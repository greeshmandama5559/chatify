import { BellOff, ArrowLeft, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

function EmptyNotifications() {
  const navigate = useNavigate();
  return (
      <div className="h-dvh relative z-10 w-full max-w-sm text-center mt-30">
        {/* Animated Icon Container */}
        <div className="relative mx-auto w-24 h-24 mb-8">
          <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full animate-pulse" />
          <div className="relative flex items-center justify-center w-full h-full bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl">
            <BellOff className="w-10 h-10 text-zinc-500" />
          </div>
        </div>

        {/* Text Content */}
        <h2 className="text-2xl font-bold text-white mb-3 tracking-tight">
          All caught up!
        </h2>
        <p className="text-zinc-400 text-sm leading-relaxed mb-10 px-4">
          You don't have any notifications right now. When something happens, we'll let you know here.
        </p>

        {/* Action Buttons */}
        <div 
        onClick={() => {
          navigate("/");
        }}
        className="flex flex-col gap-3 justify-center items-center">
          <button 
          className="flex items-center justify-center gap-2 w-60 md:w-100 py-3.5 px-6 bg-zinc-900 text-zinc-400 font-medium border border-zinc-800 rounded-2xl hover:bg-zinc-800 hover:text-white transition-all">
            <ArrowLeft className="w-4 h-4" />
            Go to Home
          </button>
        </div>
      </div>

  );
}

export default EmptyNotifications;