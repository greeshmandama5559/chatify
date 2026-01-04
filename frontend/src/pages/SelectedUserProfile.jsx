import React, { useEffect, useState } from "react";
import {
  Sparkles,
  X,
  ArrowLeft,
  MessageCircle,
  WandSparkles,
  User,
  LayoutGrid,
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { useChatStore } from "../store/useChatStore";
import { useProfileStore } from "../store/useProfileStore";
import { useAuthStore } from "../store/useAuthStore";
import LikeButton from "../components/LikeButton";
import ProfileSkeleton from "../components/ProfileSkeleton";

function SelectedUserProfile() {
  const {
    setProfileUser,
    selectedprofileUser,
    fetchUserById,
    setSelectedUser,
    isUserLoading,
    getMessagesByUserId,
  } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const isOnline = onlineUsers.includes(selectedprofileUser?._id);
  const navigate = useNavigate();
  const {
    hasLiked,
    likeProfile,
    unlikeProfile,
    loading,
    setIsVisitingProfile,
    isVisitingProfile,
    likeLoading,
    likeCheck,
  } = useProfileStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [modalSrc, setModalSrc] = useState(null);
  const { userId } = useParams();

  useEffect(() => {
    if (!userId) return;

    let isMounted = true;

    (async () => {
      const user = await fetchUserById(userId);
      if (user && isMounted) {
        setProfileUser(user);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [fetchUserById, setProfileUser, userId]);

  useEffect(() => {
    likeCheck(userId);
  }, [likeCheck, userId]);

  if (loading || isUserLoading || !selectedprofileUser)
    return <ProfileSkeleton />;

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
    hasLiked
      ? unlikeProfile(selectedprofileUser?._id)
      : likeProfile(selectedprofileUser?._id);
  };

  return (
    <div className="min-h-screen w-full bg-[#030712] text-slate-200 selection:bg-cyan-500/30 font-sans">
      {/* --- Ambient Background Glows --- */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-cyan-500/10 blur-[120px] rounded-full" />
        <div className="absolute top-[20%] -right-[10%] w-[30%] h-[30%] bg-purple-500/10 blur-[120px] rounded-full" />
      </div>

      {/* --- Elegant Nav --- */}
      <nav className="sticky top-0 z-50 w-full backdrop-blur-xl bg-[#030712]/60 border-b border-white/5">
        <div className="max-w-full mx-auto px-6 h-20 flex justify-between items-center">
          <button
            onClick={() =>
              isVisitingProfile ? setIsVisitingProfile(false) : navigate(-1)
            }
            className="group flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
          >
            <ArrowLeft
              size={18}
              className="group-hover:-translate-x-1 transition-transform"
            />
            <span className="text-sm font-medium tracking-wide">Back</span>
          </button>

          <div className="hidden md:flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold uppercase tracking-widest">
            <Sparkles size={14} /> Verified Member
          </div>
        </div>
      </nav>

      <main className="relative z-10 w-full mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* --- Left: Profile Core --- */}
          <div className="lg:col-span-4 space-y-6">
            <div className="relative p-8 rounded-[2.5rem] md:bg-white/3 md:border md:border-white/10 md:backdrop-blur-3xl shadow-2xl overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-cyan-500 to-transparent opacity-50" />

              <div className=" relative flex flex-col items-center text-center">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="relative mb-6"
                >
                  <div className="absolute inset-0 bg-cyan-500 blur-2xl opacity-20" />
                  <img
                    src={selectedprofileUser?.profilePic || "/avatar.png"}
                    alt="profile"
                    onClick={() =>
                      openImageModal(selectedprofileUser?.profilePic)
                    }
                    className="relative w-44 h-44 rounded-full object-cover ring-2 ring-cyan-500/30 p-1 cursor-pointer hover:scale-105 transition-transform duration-500 shadow-2xl"
                  />
                  {isOnline && selectedprofileUser?.isActive && (
                    <div className="absolute bottom-2 right-2 bg-[#030712] p-2 rounded-2xl border border-white/10">
                      <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse shadow-[0_0_12px_rgba(34,197,94,0.6)]" />
                    </div>
                  )}
                </motion.div>

                <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
                  {selectedprofileUser.fullName}
                </h1>

                <p className="text-slate-400 text-sm mb-8 flex items-center gap-2">
                  <User size={14} className="text-cyan-500" />@
                  {selectedprofileUser.fullName
                    ?.toLowerCase()
                    .replace(/\s/g, "")}
                </p>

                <div className="flex justify-center items-center w-full gap-3">
                  <button
                    onClick={() => {
                      const selectUserId = selectedprofileUser._id;

                      setSelectedUser(selectedprofileUser);

                      setIsVisitingProfile(false);

                      const cached =
                        useChatStore.getState().messagesCache[selectUserId] || [];

                      useChatStore.setState({
                        chatMessages: cached,
                      });

                      getMessagesByUserId(selectUserId);

                      navigate(`/chats/${selectUserId}`);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 py-4 bg-cyan-600 hover:bg-cyan-500 text-white rounded-2xl font-bold transition-all shadow-lg shadow-cyan-500/20 active:scale-95"
                  >
                    <MessageCircle size={20} /> Message
                  </button>
                  <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex justify-center items-center gap-2">
                    <span className="z-100 w-full">
                      <LikeButton
                        liked={hasLiked}
                        onToggle={handleLike}
                        disabled={likeLoading}
                      />
                    </span>

                    <span className="font-mono text-xl font-bold text-white">
                      {selectedprofileUser?.likesCount || 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats/Details */}
              <div className="mt-8 pt-8 border-t border-white/5 grid grid-cols-2 gap-4">
                <div className="text-left p-4 rounded-2xl bg-white/5 border border-white/5">
                  <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">
                    Active Status
                  </p>

                  {selectedprofileUser.isActive ? (
                    <p
                      className={`text-sm font-semibold ${
                        isOnline ? "text-green-400" : "text-slate-400"
                      }`}
                    >
                      {isOnline ? "Active Now" : "Offline"}
                    </p>
                  ) : (
                    <p className="text-md italic text-slate-600 font-bold mb-1">
                      Not Shared
                    </p>
                  )}
                </div>
                <div className="text-left p-4 rounded-2xl bg-white/5 border border-white/5">
                  <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">
                    Member Since
                  </p>
                  <p className="text-sm font-semibold text-slate-300">
                    {selectedprofileUser?.createdAt
                      ? new Date(
                          selectedprofileUser.createdAt
                        ).toLocaleDateString("en-US", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })
                      : "No Date Available"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* --- Right: Content --- */}
          <div className="lg:col-span-8 space-y-4">
            {/* About Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="relative group"
            >
              <div className="absolute -inset-px bg-linear-to-r from-cyan-500/30 to-purple-500/30 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative bg-linear-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl rounded-2xl p-8 border border-white/10 space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-6 bg-linear-to-b from-cyan-400 to-purple-400 rounded-full" />
                  <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    About
                  </h4>
                </div>
                {selectedprofileUser.bio ? (
                  <p className="text-slate-300 leading-relaxed text-lg">
                    {selectedprofileUser.bio}
                  </p>
                ) : (
                  <p className="text-slate-500 italic text-base">
                    No bio shared yet
                  </p>
                )}
              </div>
            </motion.div>

            {/* Interests Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="relative group mb-10"
            >
              <div className="absolute -inset-px bg-linear-to-r from-purple-500/30 to-pink-500/30 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative bg-linear-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl rounded-2xl p-8 border border-white/10 space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-6 bg-linear-to-b from-purple-400 to-pink-400 rounded-full" />
                  <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    Interests
                  </h4>
                </div>
                {selectedprofileUser.interests?.length > 0 ? (
                  <div className="flex flex-wrap gap-3">
                    {selectedprofileUser.interests.map((interest, i) => (
                      <motion.span
                        key={i}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 + i * 0.05 }}
                        whileHover={{ scale: 1.05, y: -2 }}
                        className="px-4 py-2 text-sm font-semibold rounded-xl bg-linear-to-r from-purple-500/10 to-pink-500/10 text-purple-300 border border-purple-500/30 hover:border-purple-400/50 transition-all duration-300 cursor-default"
                      >
                        #{interest}
                      </motion.span>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 italic text-base">
                    No interests shared yet
                  </p>
                )}
              </div>
            </motion.div>
            {/* Gallery Section */}
            <section>
              <div className="flex items-center gap-4 mb-8">
                <h3 className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] text-cyan-500 shrink-0">
                  <LayoutGrid size={16} /> Visual Gallery
                </h3>
                <div className="h-px w-full bg-linear-to-r from-white/10 to-transparent" />
              </div>

              {selectedprofileUser.gallery?.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {selectedprofileUser.gallery.map((img, idx) => (
                    <motion.div
                      key={img._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      whileHover={{
                        scale: 1.02,
                        rotate: idx % 2 === 0 ? 1 : -1,
                      }}
                      className="group relative h-80 overflow-hidden rounded-4xl cursor-pointer"
                      onClick={() => openImageModal(img.url)}
                    >
                      <img
                        src={img.url}
                        alt="gallery"
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-end p-8">
                        <p className="text-white font-medium flex items-center gap-2">
                          View full resolution{" "}
                          <ArrowLeft className="rotate-180" size={16} />
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="h-64 rounded-[2.5rem] border-2 border-dashed border-white/5 flex flex-col items-center justify-center text-slate-500 gap-4">
                  <LayoutGrid size={32} className="opacity-20" />
                  <p className="italic font-light">
                    Gallery is currently empty
                  </p>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>

      {/* --- Enhanced Image Modal --- */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-100 flex items-center justify-center bg-[#030712]/95 p-4 backdrop-blur-xl"
            onClick={closeModal}
          >
            <button className="absolute top-5 right-1 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all">
              <X size={24} />
            </button>
            <motion.img
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              src={modalSrc}
              className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)]"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default SelectedUserProfile;
