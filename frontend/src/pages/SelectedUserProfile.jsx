import React, { useEffect, useState } from "react";
import { Heart, UserCheck, Sparkles, MapPin, X } from "lucide-react";
import { useParams } from "react-router";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { useChatStore } from "../store/useChatStore";
import { useProfileStore } from "../store/useProfileStore";
import LikeButton from "../components/LikeButton";

function SelectedUserProfile() {
  const { selectedUser, fetchUserById } = useChatStore();
  const {
    hasLiked,
    likeProfile,
    unlikeProfile,
    loading,
    setIsVisitingProfile,
    isVisitingProfile,
  } = useProfileStore();

  const [modalOpen, setModalOpen] = useState();
  const [modalSrc, setModalSrc] = useState();

  const { userId } = useParams();

  useEffect(() => {
    if (
      (!isVisitingProfile && !selectedUser) ||
      (!isVisitingProfile && selectedUser._id !== userId)
    ) {
      console.log("calling fetch..");
      fetchUserById(userId);
    }
  }, [fetchUserById, isVisitingProfile, selectedUser, userId]);

  if (!selectedUser) return null;

  const openImageModal = (src) => {
    if (!src) return;
    setModalSrc(src);
    setModalOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalSrc(null);
    document.body.style.overflow = "";
  };

  const handleLike = () => {
    hasLiked ? unlikeProfile(selectedUser._id) : likeProfile(selectedUser._id);
  };

  return (
    <div className="relative h-dvh w-full flex items-center justify-center overflow-hidden bg-[#0a0f1a] px-4 py-10">
      {/* Dynamic Background Decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px] animate-pulse" />

      {isVisitingProfile && (
        <button
          onClick={() => setIsVisitingProfile(false)}
          aria-label="Close image"
          className="absolute top-5 right-5 z-60 rounded-full bg-black/40 backdrop-blur p-2 hover:bg-black"
        >
          <X size={22} className="text-white" />
        </button>
      )}

      {modalOpen && modalSrc && (
        <div
          className="fixed w-full h-full inset-0 z-50 flex justify-center bg-black/70"
          onClick={closeModal}
        >
          <div
            className="relative max-w-[95vw] max-h-[95vh] p-4 mt-30"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeModal}
              aria-label="Close image"
              className="absolute top-2 right-2 z-60 rounded-full bg-black/40 backdrop-blur p-2 hover:bg-black/60"
            >
              <X size={18} className="text-white" />
            </button>

            <div className="rounded-lg bg-black/90 p-2 max-w-[95vw] max-h-[95vh] flex items-center justify-center">
              <img
                src={modalSrc}
                alt="Preview"
                className="max-w-[72vw] max-h-[82vh] object-contain rounded w-50"
                onError={(e) => {
                  e.currentTarget.src = "/image-fallback.png";
                }}
              />
            </div>
          </div>
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative w-full max-w-md"
      >
        {/* Main Card */}
        <div className="relative overflow-hidden bg-slate-900/40 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-2xl p-8 group">
          {/* Top Decorative Line */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50" />

          {/* Avatar Section */}
          <div className="flex justify-center relative">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="relative p-1 rounded-full bg-gradient-to-tr from-cyan-500 to-purple-500 shadow-cyan-500/20 shadow-2xl"
            >
              <div className="bg-slate-900 rounded-full p-1">
                <img
                  src={selectedUser.profilePic || "/avatar.png"}
                  alt="profile"
                  onClick={() => openImageModal(selectedUser.profilePic)}
                  className="w-32 h-32 rounded-full object-cover border-2 border-slate-800/50"
                />
              </div>

              {/* Active Badge */}
              {selectedUser.isActive && (
                <div className="absolute bottom-2 right-2 bg-slate-900 p-1.5 rounded-full border border-white/10">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.6)]" />
                </div>
              )}
            </motion.div>
          </div>

          {/* Name & Title */}
          <div className="text-center mt-6">
            <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400 tracking-tight">
              {selectedUser.fullName}
            </h2>
            <div className="flex justify-center items-center gap-1.5 mt-2 text-slate-400 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-xs uppercase tracking-[0.2em]">
                Verified Member
              </span>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="flex items-center justify-around mt-8 py-4 px-2 rounded-2xl bg-white/5 border border-white/5">
            <div className="flex flex-col items-center">
              <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                Active Status
              </span>
              {selectedUser?.isActive ? (
                <span className="text-green-400 text-sm font-semibold">
                  Online
                </span>
              ) : (
                <span className="text-slate-300 text-sm leading-relaxed italic">
                  Not Shared
                </span>
              )}
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="flex flex-col items-center group/like">
              <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider mb-1">
                Profile Likes
              </span>
              <div className="flex items-center gap-2">
                <motion.div whileTap={{ scale: 0.8 }}>
                  <LikeButton
                    liked={hasLiked}
                    onToggle={handleLike}
                    disabled={loading}
                  />
                </motion.div>
                <span className="text-slate-200 text-md font-mono font-bold">
                  {selectedUser?.likesCount?.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Bio Section */}
          <AnimatePresence>
            {selectedUser.bio && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-8"
              >
                <h4 className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-3 ml-1">
                  Bio
                </h4>
                <p className="text-slate-200 font-semibold text-sm leading-relaxed bg-white/5 p-4 rounded-2xl border border-white/5   ">
                  {selectedUser.bio}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Interests Chips */}
          {selectedUser.interests?.length > 0 && (
            <div className="mt-8">
              <h4 className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-4 ml-1">
                Intrested IN
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedUser.interests.map((interest, index) => (
                  <motion.span
                    key={index}
                    whileHover={{
                      scale: 1.05,
                      backgroundColor: "rgba(6, 182, 212, 0.2)",
                    }}
                    className="px-4 py-1.5 text-xs font-medium rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 cursor-default transition-colors"
                  >
                    #{interest.toLowerCase()}
                  </motion.span>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default SelectedUserProfile;
