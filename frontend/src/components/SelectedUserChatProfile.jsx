import React, { useEffect, useState } from "react";
import { Sparkles, X, ArrowLeft } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { useChatStore } from "../store/useChatStore";
import { useProfileStore } from "../store/useProfileStore";
import LikeButton from "../components/LikeButton";
import { useAuthStore } from "../store/useAuthStore";
import ProfileSkeleton from "../components/ProfileSkeleton";

function SelectedUserChatProfile() {
  const { selectedUser, fetchUserById, isUserLoading } = useChatStore();

  const { onlineUsers } = useAuthStore();

  const isOnline = onlineUsers.includes(selectedUser?._id);

  const navigate = useNavigate();
  const {
    hasLiked,
    likeProfile,
    unlikeProfile,
    loading,
    setIsVisitingProfile,
    isVisitingProfile,
  } = useProfileStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [modalSrc, setModalSrc] = useState(null);

  const { userId } = useParams();

  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === "Escape") setIsVisitingProfile(false);
    };
    window.addEventListener("keydown", handleEscKey);
    return () => window.removeEventListener("keydown", handleEscKey);
  }, [isVisitingProfile, setIsVisitingProfile]);

  useEffect(() => {
    if (!isVisitingProfile && !selectedUser) {
      fetchUserById(userId);
    }
  }, [fetchUserById, isVisitingProfile, selectedUser, userId]);

  if (!selectedUser)
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
      </div>
    );

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

  const handleLike = (e) => {
    e.stopPropagation();
    hasLiked ? unlikeProfile(selectedUser._id) : likeProfile(selectedUser._id);
  };

  if (loading || isUserLoading) return <ProfileSkeleton />;

  return (
    <div className="relative flex flex-col h-full w-full bg-[#0a0f1a] text-slate-200 min-h-0 py-4 px-4 overflow-y-auto scrollbar-hide">
      <div className="flex items-center flex- justify-end top-0 gap-2 p-3 bg-[#0a0f1a]">
        <button
          onClick={() =>
            isVisitingProfile ? setIsVisitingProfile(false) : navigate(-1)
          }
          className="flex bg-[#0a0f1a] text-slate-400 hover:text-white transition-colors group"
        >
          <ArrowLeft
            size={20}
            className="group-hover:-translate-x-1 transition-transform"
          />
          <span className="text-sm font-medium">Back</span>
        </button>
      </div>

      <main className="mx-auto w-full px-6 py-12">
        <div className="grid grid-cols-1">
          {/* --- Left Column: Profile Info --- */}
          <div className="lg:col-span-5 space-y-8 flex justify-center items-center flex-col">
            <div className="relative group w-fit">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative z-10"
              >
                <img
                  src={selectedUser.profilePic || "/avatar.png"}
                  alt="profile"
                  onClick={() => openImageModal(selectedUser.profilePic)}
                  className="w-48 h-48 rounded-full  border-cyan-500 border-t border-2 object-cover ring-1 ring-white/10 shadow-2xl cursor-pointer hover:ring-cyan-500/50 transition-all duration-500"
                />
                {isOnline && selectedUser.isActive && (
                  <div className="absolute bottom-3 right-3 bg-[#0a0f1a] p-1.5 rounded-full ring-1 ring-white/10">
                    <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse" />
                  </div>
                )}
              </motion.div>
              <div className="absolute -inset-4 bg-cyan-500/10 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            </div>

            <div className="space-y-4 w-full">
              <div className="flex justify-center items-center flex-col">
                <motion.h1
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-4xl md:text-[40px] mb-3 font-bold tracking-tight text-white"
                >
                  {selectedUser.fullName}
                </motion.h1>
                <div className="flex flex-row justify-between items-center gap-4 ">
                  <p className="text-cyan-400 font-medium mb-3 flex items-center gap-2">
                    <Sparkles size={16} /> Verified Member
                  </p>
                </div>
              </div>

              <div className="flex justify-between py-6 border-y border-white/5">
                <div className="flex flex-col ml-2">
                  <span className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">
                    Status
                  </span>
                  {selectedUser.isActive ? (
                    <span
                      className={
                        isOnline
                          ? "text-green-400 font-semibold mt-2"
                          : "text-slate-400 italic"
                      }
                    >
                      {isOnline ? "Active now" : "Offline"}
                    </span>
                  ) : (
                    <span className={"text-slate-400 mt-2 italic"}>
                      Not Shared
                    </span>
                  )}
                </div>

                <div className="flex flex-col mr-2">
                  <span className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">
                    Appreciation
                  </span>
                  <div className="flex items-center justify-center gap-2 mt-1">
                    <LikeButton
                      liked={hasLiked}
                      onToggle={handleLike}
                      disabled={loading}
                    />
                    <span className="text-xl font-mono font-medium">
                      {selectedUser?.likesCount || 0}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  About
                </h4>
                {selectedUser.bio ? (
                  <p className="text-slate-300 leading-relaxed text-lg">
                    {selectedUser.bio}
                  </p>
                ) : (
                  <p className="text-slate-400 italic text-md">No Bio Yet</p>
                )}
              </div>

              <div className="mt-10">
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  Intrests
                </h4>
                {selectedUser.interests?.length > 0 ? (
                  <div className="pt-4">
                    <div className="flex flex-wrap gap-2">
                      {selectedUser.interests.map((interest, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 text-xs font-medium rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/2"
                        >
                          #{interest}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-400 italic text-md mt-1">
                    No Intrests Yet
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* --- Right Column: Gallery --- */}
          <div className="lg:col-span-7 mt-10">
            <div className="flex items-center justify-between mb-8">
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500">
                Visual Gallery
              </h4>
              <div className="h-px flex-1 bg-white/5 ml-4 mr-10" />
            </div>

            {selectedUser.gallery?.length > 0 ? (
              <div className="flex flex-wrap gap-6 justify-center md:justify-start">
                {selectedUser.gallery.map((img) => (
                  <motion.div
                    key={img._id}
                    whileHover={{ y: -8 }}
                    className="relative w-55 h-80 overflow-hidden rounded-2xl ring-1 ring-white/10 shadow-xl cursor-pointer group"
                    onClick={() => openImageModal(img.url)}
                  >
                    <img
                      src={img.url}
                      alt="gallery"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="aspect-video rounded-3xl border-2 border-dashed border-white/5 flex flex-center items-center justify-center text-slate-500 italic">
                No images shared in gallery yet
              </div>
            )}
          </div>
        </div>
      </main>

      {/* --- Image Modal --- */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-100 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
            onClick={closeModal}
          >
            <button className="absolute top-5 right-0 p-1 bg-black/50 rounded-full text-white/50 hover:text-white transition-colors">
              <X size={32} />
            </button>
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              src={modalSrc}
              className="max-w-70 max-h-[85vh] md:max-w-full md:max-h-[90vh] object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default SelectedUserChatProfile;
