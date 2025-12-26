import React from "react";
import { User, Calendar, MessageSquare, LogOut } from "lucide-react";

function AccountInfoSection({ authUser, logout }) {
  return (
    <section className="bg-slate-900/50 backdrop-blur-xl max-h-70 border border-slate-800 rounded-3xl p-6">
      <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
        <User size={16} /> Account Details
      </h3>

      <div className="space-y-4 text-sm">
        <div className="flex items-center justify-between py-2 border-b border-slate-800">
          <span className="text-slate-500 flex items-center gap-2">
            <Calendar size={14} /> Member Since
          </span>
          <span className="text-slate-300">
            {authUser?.createdAt?.split("T")[0] || "Jan 2024"}
          </span>
        </div>

        <div className="flex items-center justify-between py-2 border-b border-slate-800">
          <span className="text-slate-500 flex items-center gap-2">
            <MessageSquare size={14} /> Account Status
          </span>
          <span className="text-green-400 font-medium">Verified</span>
        </div>

        <button
          onClick={logout}
          className="w-full mt-8 flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-colors font-medium border border-red-500/20"
        >
          <LogOut size={16} />
          Log Out
        </button>
      </div>
    </section>
  );
}

export default AccountInfoSection;
