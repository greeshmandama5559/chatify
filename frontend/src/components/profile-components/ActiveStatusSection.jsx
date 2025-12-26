import React from "react";
import { ActivitySquare } from "lucide-react";
import ActiveSwitch from "../ActiveSwitch";
import toast from "react-hot-toast";
import { useAuthStore } from "../../store/useAuthStore";

function ActiveStatusSection({ isActive, setIsActive }) {

    const { updateActiveStatus } = useAuthStore();

    const toggleActiveStatus = async () => {
    const next = !isActive;
    setIsActive(next);
    try {
      await updateActiveStatus({ isActive: next });
      toast.success(next ? "You are now Active" : "You are now Invisible");
    } catch {
      toast.error("Failed to update status");
    }
  };

  return (
    <section className="bg-slate-900/50 backdrop-blur-xl border max-h-40 border-slate-800 rounded-3xl p-6">
      <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
        <ActivitySquare size={16} /> Your Active Status
      </h3>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/30">
          <div className="flex items-center gap-3">
            <div
              className={`w-3 h-3 rounded-full animate-pulse ${
                isActive
                  ? "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"
                  : "bg-slate-500"
              }`}
            />
            <span className="font-medium text-sm">
              {isActive ? "Active Now" : "Invisible Mode"}
            </span>
          </div>
          <ActiveSwitch isActive={isActive} onToggle={toggleActiveStatus} />
        </div>
      </div>
    </section>
  );
}

export default ActiveStatusSection;
