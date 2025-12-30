import React from "react";
import { ActivitySquare, Eye, EyeOff, ShieldCheck, Zap } from "lucide-react";
import ActiveSwitch from "../ActiveSwitch";
import toast from "react-hot-toast";
import { useAuthStore } from "../../store/useAuthStore";
import ActiveSeenSwitch from "../ActiveSeenOn";

function ActiveStatusSection({ isActive, setIsActive, setIsSeenOn, isSeenOn }) {
  const { updateActiveStatus, updateSeenStatus } = useAuthStore();

  const toggleActiveStatus = async () => {
    const next = !isActive;
    setIsActive(next);
    try {
      await updateActiveStatus({ isActive: next });
      toast.success(next ? "You are now Active" : "You are now Invisible", {
        icon: next ? "🟢" : "⚪",
        style: { borderRadius: "12px", background: "#1e293b", color: "#fff" },
      });
    } catch {
      toast.error("Failed to update status");
      setIsActive(!next); // Rollback
    }
  };

  const toggleSeenStatus = async () => {
    const next = !isSeenOn;
    setIsSeenOn(next);
    try {
      await updateSeenStatus({ isSeenOn: next });
      toast.success(next ? "Read receipts enabled" : "Ghost mode activated");
    } catch {
      toast.error("Failed to update seen status");
      setIsSeenOn(!next); // Rollback
    }
  };

  return (
    <section className="w-full max-w-md bg-slate-900/40 backdrop-blur-2xl border border-slate-800/60 rounded-[2rem] p-1 overflow-hidden shadow-2xl">
      <div className="p-6 space-y-8">
        {/* --- Active Status Section --- */}
        <div>
          <header className="flex items-center justify-between mb-4 px-1">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
              <ActivitySquare size={14} className="text-indigo-400" />
              Presence
            </h3>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full border ${
                isActive
                  ? "bg-green-500/10 border-green-500/20 text-green-400"
                  : "bg-slate-500/10 border-slate-500/20 text-slate-400"
              }`}
            >
              {isActive ? "Public" : "Private"}
            </span>
          </header>

          <div
            className={`group transition-all duration-300 flex items-center justify-between px-4 py-6 rounded-2xl border border-transparent ${
              isActive
                ? "bg-indigo-500/5 border-indigo-500/10"
                : "bg-slate-800/40"
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="relative">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                    isActive
                      ? "bg-green-500/20 text-green-400"
                      : "bg-slate-700 text-slate-400"
                  }`}
                >
                  <Zap size={20} fill={isActive ? "currentColor" : "none"} />
                </div>
                {isActive && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 border-2 border-slate-900 rounded-full animate-pulse" />
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-200">
                  {isActive ? "Online Visibility" : "Invisible Mode"}
                </p>
                <p className="text-xs text-slate-500">
                  {isActive
                    ? "Others can see when you're active"
                    : "Hide your online presence"}
                </p>
              </div>
            </div>
            <ActiveSwitch isActive={isActive} onToggle={toggleActiveStatus} />
          </div>
        </div>

        {/* --- Read Receipts / Ghost Mode --- */}
        <div>
          <header className="flex items-center justify-between mb-4 px-1">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
              <ShieldCheck size={14} className="text-purple-400" />
              Privacy
            </h3>
          </header>

          <div
            className={`transition-all duration-300 flex items-center justify-between p-4 rounded-2xl border border-transparent ${
              !isSeenOn
                ? "bg-slate-800/40 border-purple-500/20 ring-1 ring-purple-500/20"
                : "bg-purple-500/10 border-purple-500/20 ring-1 ring-purple-500/20"
            }`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                  !isSeenOn
                    ? "bg-slate-700 text-white"
                    : "bg-purple-500 text-white shadow-lg shadow-purple-500/20"
                }`}
              >
                {isSeenOn ? <Eye size={20} /> : <EyeOff size={20} />}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-200">
                  {isSeenOn ? "Standard Mode" : "Ghost Mode"}
                </p>
                <p className="text-xs text-slate-500">
                  {isSeenOn
                    ? "Read receipts are active"
                    : "Reading messages won't notify others"}
                </p>
              </div>
            </div>
            <ActiveSeenSwitch isSeenOn={isSeenOn} onToggle={toggleSeenStatus} />
          </div>
        </div>
      </div>

      {/* Subtle Bottom Decoration */}
      {/* <div className="h-1 w-full bg-linear-to-r from-transparent via-indigo-500/20 to-transparent" /> */}
    </section>
  );
}

export default ActiveStatusSection;
