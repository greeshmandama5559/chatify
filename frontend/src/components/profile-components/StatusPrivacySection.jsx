import React, { useState } from "react";
import toast from "react-hot-toast";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "../../store/useAuthStore";
import {
  Pencil,
  X,
  BookCheck,
  Loader2,
  Plus,
  RotateCcw,
  Trash2,
} from "lucide-react";

function StatusPrivacySection({
  bio,
  setBio,
  interests,
  setInterests,
  originalInterests,
  setOriginalInterests,
}) {
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [interestInput, setInterestInput] = useState("");
  const [interestsSaveBtn, setInterestsSaveBtn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRemoveLoading, setIsRemoveLoading] = useState(false);

  const { updateIntrests, updateBio } = useAuthStore();

  const addInterest = () => {
    if (!interestInput.trim() || interests.includes(interestInput)) return;
    setInterests([...interests, interestInput.trim()]);
    setInterestsSaveBtn(true);
    setInterestInput("");
  };

  const removeInterest = (interest) => {
    const updated = interests.filter((i) => i !== interest);
    setInterests(updated);
    setInterestsSaveBtn(true);
  };

  return (
    <section className="bg-slate-900/40 backdrop-blur-2xl border border-white/5 rounded-4xl p-8 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-3">
          <div className="p-2 bg-cyan-500/10 rounded-xl">
            <BookCheck size={18} className="text-cyan-400" />
          </div>
          Profile Identity
        </h3>
      </div>

      <div className="grid md:grid-cols-2 gap-6 items-start">
        {/* --- BIO SECTION --- */}
        <div className="group relative p-6 min-h-32 rounded-3xl bg-white/2 border border-white/5 hover:border-cyan-500/30 transition-all duration-500">
          <div className="flex justify-between items-center mb-4">
            <span className="text-[10px] font-bold text-cyan-500/70 uppercase tracking-widest">
              About Me
            </span>
            <button
              onClick={() => setIsEditingBio(!isEditingBio)}
              className="p-2 rounded-full hover:bg-cyan-500/10 text-slate-400 hover:text-cyan-400 transition-colors"
            >
              <Pencil size={14} />
            </button>
          </div>

          <AnimatePresence mode="wait">
            {isEditingBio ? (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  maxLength={160}
                  placeholder="Tell your story..."
                  className="w-full bg-slate-950/50 border border-slate-800 focus:border-cyan-500/50 rounded-2xl p-4 text-sm text-slate-200 outline-none ring-0 focus:ring-4 focus:ring-cyan-500/5 transition-all min-h-[100px] resize-none"
                />
                <div className="flex items-center gap-5 mt-4">
                  <button
                    disabled={isLoading}
                    onClick={async () => {
                      setIsLoading(true);
                      await updateBio({ bio });
                      setIsLoading(false);
                      toast.success("Identity updated");
                      setIsEditingBio(false);
                    }}
                    className="flex items-center gap-2 px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-cyan-900/20"
                  >
                    {isLoading ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      "Save Changes"
                    )}
                  </button>
                  <button
                    onClick={() => setIsEditingBio(false)}
                    className="text-xs font-medium text-slate-500 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm leading-relaxed text-slate-300 px-1"
              >
                {bio ||
                  "Your bio is currently a blank canvas. Add some magic ✨"}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* --- INTERESTS SECTION --- */}
        <div className="p-6 rounded-3xl bg-white/2 border border-white/5">
          <span className="text-[10px] font-bold text-purple-400/70 uppercase tracking-widest block mb-4">
            Interests & Vibes
          </span>

          <div className="flex flex-wrap gap-2 mb-3">
            <AnimatePresence>
              {interests.map((interest) => (
                <motion.span
                  key={interest}
                  className="group flex items-center justify-center gap-2 px-4 py-1.5 bg-slate-800/40 hover:bg-cyan-500/10 border border-white/5 hover:border-cyan-500/30 text-slate-300 hover:text-cyan-400 text-xs font-medium rounded-full transition-all cursor-default"
                >
                  <span className="opacity-50">#</span>
                  {interest}
                  <X
                    size={12}
                    className="opacity-100 cursor-pointer transition-all mt-0.5"
                    onClick={() => removeInterest(interest)}
                  />
                </motion.span>
              ))}
            </AnimatePresence>
          </div>

          <div className="flex gap-2  p-1.5 bg-slate-950/50 border border-slate-800 rounded-2xl focus-within:border-purple-500/50 transition-all">
            <input
              value={interestInput}
              onChange={(e) => setInterestInput(e.target.value.toLowerCase())}
              onKeyDown={(e) => e.key === "Enter" && addInterest()}
              placeholder="Add a new vibe..."
              className="flex-1 bg-transparent px-3 text-sm text-slate-200 outline-none placeholder:text-slate-600"
            />
            <button
              onClick={addInterest}
              className="p-2 bg-slate-800 hover:bg-cyan-500 text-slate-400 hover:text-white rounded-xl transition-all"
            >
              <Plus size={18} />
            </button>
          </div>

          {/* Interests Footer Actions */}
          <AnimatePresence>
            {interestsSaveBtn && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="flex items-center gap-4 mt-6 pt-4 border-t border-white/5"
              >
                <button
                  onClick={async () => {
                    setIsLoading(true);
                    await updateIntrests({ interests });
                    setOriginalInterests(interests);
                    setIsLoading(false);
                    setInterestsSaveBtn(false);
                    toast.success("Vibes saved");
                  }}
                  className="px-6 py-2 bg-linear-to-r from-cyan-600 to-blue-600 text-white text-[11px] font-black uppercase rounded-xl shadow-lg shadow-cyan-950/40"
                >
                  {isLoading ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    "Confirm Changes"
                  )}
                </button>

                <button
                  onClick={() => {
                    setInterests(originalInterests);
                    setInterestsSaveBtn(false);
                  }}
                  className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-xs font-bold"
                >
                  <RotateCcw size={14} /> Undo
                </button>

                <button
                  onClick={async () => {
                    if (interests?.length < 0) return;
                    setIsRemoveLoading(true);
                    setInterests([]);
                    await updateIntrests({ interests: [] });
                    setIsRemoveLoading(false);
                    setInterestsSaveBtn(false);
                    toast.success("Cleared all vibes");
                  }}
                  className="ml-auto flex items-center gap-2 text-red-400/60 hover:text-red-400 transition-colors text-xs font-bold"
                >
                  {isRemoveLoading ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <>
                      <Trash2 size={14} /> Clear All
                    </>
                  )}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

export default StatusPrivacySection;
