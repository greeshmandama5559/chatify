import React from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, PlusCircle } from "lucide-react"; // Or your preferred icon library

const AddInterestsCard = () => {
  const navigate = useNavigate();

  return (
    <div className="relative w-full min-h-[300px] overflow-hidden rounded-[2.5rem] bg-slate-900/40 border border-slate-800/60 p-8 flex flex-col items-center justify-center text-center group">
      {/* 1. Animated Background Glows */}
      <div className="absolute -top-24 -left-24 w-64 h-64 bg-indigo-600/20 rounded-full blur-[80px] group-hover:bg-indigo-600/30 transition-colors duration-700"></div>
      <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-emerald-600/10 rounded-full blur-[80px] group-hover:bg-emerald-600/20 transition-colors duration-700"></div>

      {/* 2. Icon with "Floating" animation */}
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full animate-pulse"></div>
        <div className="relative w-20 h-20 bg-slate-800 border border-slate-700 rounded-2xl flex items-center justify-center shadow-2xl rotate-3 group-hover:rotate-0 transition-transform duration-500">
          <Sparkles className="text-indigo-400 w-10 h-10" />
          <div className="absolute -bottom-2 -right-2 bg-emerald-500 rounded-full p-1 shadow-lg">
            <PlusCircle className="text-white w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. Text Content */}
      <div className="relative z-10 max-w-sm">
        <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">
          Find Your Perfect Match
        </h3>
        <p className="text-slate-400 text-sm sm:text-base leading-relaxed mb-8">
          Add your interests to discover users who share your passions, hobbies,
          and vibe!
        </p>
      </div>

      {/* 4. Action Button */}
      <button
        onClick={() => navigate("/profile")} // Adjust route as needed
        className="relative z-10 group/btn overflow-hidden px-8 py-3 bg-white text-slate-950 font-bold rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.3)]"
      >
        <span className="relative z-10">Add Interests Now</span>
        {/* Subtle hover overlay for the button */}
        <div className="absolute inset-0 bg-linear-to-r from-indigo-100 to-white opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
      </button>

      {/* Decorative "Sparkle" dots */}
      <div className="absolute top-10 right-20 w-1 h-1 bg-indigo-400 rounded-full opacity-40 animate-ping"></div>
      <div className="absolute bottom-10 left-20 w-1.5 h-1.5 bg-emerald-400 rounded-full opacity-40 animate-bounce"></div>
    </div>
  );
};

export default AddInterestsCard;
