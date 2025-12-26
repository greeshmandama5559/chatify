import React from "react";
import toast from "react-hot-toast";
import { useState } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import {
  Pencil,
  X,
  BookCheck,
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

  const { updateIntrests, updateBio } = useAuthStore();

  const addInterest = async () => {
    if (!interestInput.trim()) return;
    if (interests.includes(interestInput)) return;

    setInterests([...interests, interestInput.trim()]);
    setInterestsSaveBtn(true);
    setInterestInput("");
  };

  const removeInterest = async (interest) => {
    const updatedInterests = interests.filter((i) => i !== interest);

    setInterests(updatedInterests);

    if (updatedInterests.length < 1) {
      setInterestsSaveBtn(false);
    } else {
      setInterestsSaveBtn(true);
    }
  };

  const areInterestsSame = (a = [], b = []) => {
    if (a.length !== b.length) return false;

    const sortedA = [...a].sort();
    const sortedB = [...b].sort();

    return sortedA.every((val, idx) => val === sortedB[idx]);
  };

  const updateInterests = async ({ interests }) => {
    if (areInterestsSame(interests, originalInterests)) {
      setInterestsSaveBtn(false);
      return;
    }

    try {
      await updateIntrests({ interests });
      setOriginalInterests(interests);
    } catch {
      toast.error("Failed to update interests");
    }
  };

  return (
    <section className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-6">
      <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
        <BookCheck size={16} /> About
      </h3>

      <div className="space-y-4">
        <div className="p-4 rounded-2xl bg-slate-800/30 border border-slate-700/50">
          <div className="flex justify-between items-center mb-1">
            <p className="text-xs text-slate-500 italic">Personal Bio</p>
            <button
              onClick={() => setIsEditingBio(!isEditingBio)}
              className="text-slate-400 hover:text-cyan-400"
            >
              <Pencil size={14} />
            </button>
          </div>

          {isEditingBio ? (
            <>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={160}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
              <button
                onClick={async () => {
                  try {
                    setBio(bio);
                    await updateBio({ bio });
                    toast.success("Bio updated");
                    setIsEditingBio(false);
                  } catch {
                    toast.error("Failed to update bio");
                  }
                }}
                className="mt-2 text-xs text-cyan-400"
              >
                Save Bio
              </button>
              <button
                onClick={async () => {
                  setIsEditingBio(false);
                }}
                className="mt-2 ml-3 text-xs text-red-400"
              >
                Cancel
              </button>
            </>
          ) : (
            <p className="text-sm text-slate-300">
              {bio || "Add something about yourself ✨"}
            </p>
          )}
        </div>

        <div className="p-4 rounded-2xl bg-slate-800/30 border border-slate-700/50">
          <p className="text-xs text-slate-500 mb-2 italic">Interests</p>

          <div className="flex flex-wrap gap-2 mb-2">
            {interests.map((interest) => (
              <span
                key={interest}
                className="flex items-center gap-1 px-3 py-1 bg-cyan-500/10 text-cyan-400 text-xs rounded-full"
              >
                #{interest}
                <X
                  size={12}
                  className="cursor-pointer"
                  onClick={() => removeInterest(interest)}
                />
              </span>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              value={interestInput}
              onChange={(e) => setInterestInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addInterest()}
              placeholder="Add interest"
              className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1 text-sm"
            />
            <button
              onClick={addInterest}
              className="px-3 mr-2 text-sm bg-cyan-500/20 text-cyan-400 rounded-lg"
            >
              Add
            </button>
          </div>

          {interestsSaveBtn && (
            <div className="ml-1.5 ">
              <button
                onClick={async () => {
                  try {
                    await updateInterests({ interests });
                    toast.success("intrests updated");
                    setInterestsSaveBtn(false);
                  } catch {
                    toast.error("Failed to update intrests");
                  }
                }}
                className="mt-2 text-sm text-cyan-400"
              >
                Save
              </button>
              <button
                onClick={async () => {
                  try {
                    const empty = [];
                    setInterests(empty);
                    await updateInterests({ interests: empty });
                    toast.success("Cleared All");
                    setInterestsSaveBtn(false);
                  } catch {
                    toast.error("Failed to update intrests");
                  }
                }}
                className="mt-2 ml-4 text-sm text-red-400"
              >
                Remove All
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default StatusPrivacySection;
