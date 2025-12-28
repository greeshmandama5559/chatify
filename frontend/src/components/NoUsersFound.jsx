import React from "react";
import { UserX, Search, ArrowLeft } from "lucide-react";
import { useProfileStore } from "../store/useProfileStore";

function NoUsersFound() {

  const { setQuery } = useProfileStore();

  return (
    <div className="w-full max-w-2xl mx-auto mt-10 relative overflow-hidden p-12 flex flex-col items-center justify-center text-center">
      <div className="relative mb-8">
        <div className="absolute inset-0 rounded-full border border-slate-400 animate-[ping_3s_linear_infinite] opacity-20"></div>
        <div className="absolute inset-0 rounded-full border border-slate-400 animate-[ping_3s_linear_infinite_1s] opacity-10"></div>

        <div className="relative w-24 h-24 bg-slate-800/80 border border-slate-700 rounded-full flex items-center justify-center shadow-inner">
          <UserX size={40} className="text-slate-500" strokeWidth={1.5} />

          <div className="absolute -bottom-1 -right-1 bg-indigo-500 p-2 rounded-full shadow-lg border-4 border-slate-900">
            <Search size={14} className="text-white" />
          </div>
        </div>
      </div>

      <div className="relative z-10">
        <h2 className="text-2xl font-bold text-white mb-3">User Not Found</h2>
        <p className="text-slate-400 text-sm sm:text-base max-w-xs mx-auto leading-relaxed">
          We've searched high and low, but we couldn't find a user matching that
          profile or name.
        </p>
      </div>

      <div className="mt-8 flex flex-col sm:flex-row gap-4">

        <button
          onClick={() => setQuery("")}
          className="px-6 py-2.5 text-sm font-bold text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 rounded-xl transition-all"
        >
          Browse Everyone
        </button>
      </div>
    </div>
  );
}

export default NoUsersFound;
