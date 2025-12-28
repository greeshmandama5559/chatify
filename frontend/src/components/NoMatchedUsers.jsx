import React from "react";
import { SearchX } from "lucide-react";
import { useNavigate } from "react-router-dom";

const NoMatchesCard = () => {
    const navigate = useNavigate();
  return (
    <div className="w-full relative overflow-hidden bg-slate-900/60 border border-slate-800/80 rounded-4xl p-12 flex flex-col justify-center items-center text-center min-h-[350px]">
      <div className="absolute top-1/4 left-1/3 w-48 h-48 bg-indigo-500/20 rounded-full blur-[60px] -z-10 animate-pulse-slow"></div>
      <div className="absolute bottom-1/4 right-1/3 w-60 h-60 bg-cyan-500/10 rounded-full blur-[70px] -z-10"></div>

      <div className="relative z-10 flex flex-col items-center">
        <div className="mb-6 p-5 bg-linear-to-br from-slate-800/80 to-slate-900/20 rounded-full border border-slate-700/50 shadow-[0_0_40px_-10px_rgba(99,102,241,0.4)] relative group">
          <div className="transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110">
            <SearchX
              size={48}
              className="text-indigo-300/80 drop-shadow-[0_0_10px_rgba(165,180,252,0.5)]"
              strokeWidth={1.5}
            />
          </div>
        </div>
        
        <h2 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-linear-to-r from-white via-indigo-100 to-slate-200 tracking-tight">
          No Matched Users Found
        </h2>

        <p className="text-slate-400 text-sm sm:text-base max-w-sm mt-4 leading-relaxed">
          It looks like empty space out here. Try adjusting your interest
          filters or check back a little later!
        </p>

        <button
        onClick={() => navigate("/profile")} 
        className="mt-8 px-6 py-2.5 text-sm font-semibold rounded-full bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/40 transition-all duration-300 hover:shadow-[0_0_20px_-5px_rgba(99,102,241,0.5)] active:scale-95">
          Update Preferences
        </button>
      </div>
    </div>
  );
};

export default NoMatchesCard;
