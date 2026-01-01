import React from "react";
import { useNavigate } from "react-router-dom";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import DiscoverPageLoadingSkeleton from "../components/DiscoverPageLoadingSkeleton";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

function TopLikedUsers() {
  const navigate = useNavigate();

  const { setSelectedUser, TopLikedUsers, isUsersLoading } = useChatStore();

  const { authUser } = useAuthStore();

  const imageBadges = [
    "/gold-badge.png",
    "/silver-badge.png",
    "/bronze-badge.png",
  ];

  return (
    <div>
      <section className="mb-12">
        <div className="flex items-center justify-between px-4 mb-6">
          <h2 className="text-xl font-bold text-pink-600">
            Top Users (Last 7 days)
          </h2>
        </div>

        {isUsersLoading ? (
          <DiscoverPageLoadingSkeleton />
        ) : (
          <div
            className="
            flex gap-5 md:gap-18 px-4
            overflow-x-auto
            md:grid md:grid-cols-3 md:overflow-visible
            scrollbar-hide
          "
          >
            {TopLikedUsers?.map((contact, index) => (
              <div
                key={contact._id}
                className="group relative min-w-70 bg-slate-900/40 border border-slate-800/50 rounded-4xl p-6 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)]"
              >
                <div className="flex flex-col items-center">
                  {/* Avatar */}
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full overflow-hidden ring-4 ring-slate-800/50 group-hover:ring-indigo-500/20 transition-all duration-500">
                      <img
                        src={contact.profilePic || "/avatar.png"}
                        alt={contact.fullName}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    </div>
                    {contact?.gender === "female" && (
                      <div className="absolute -top-2 -left-2 -rotate-45 opacity-90 rounded-full transition-all shadow-lg">
                        <img src="/ribbon.png" alt="" className="w-10 h-10" />
                      </div>
                    )}
                  </div>

                  <div
                    style={{ width: index > 0 ? "32px" : "45px" }}
                    className="-mt-5 z-100"
                  >
                    <img src={imageBadges[index]} alt="" />
                  </div>

                  {/* User Info */}
                  <div className="mt-2 text-center w-full">
                    <h2 className="text-xl font-bold text-white tracking-tight flex items-center justify-center gap-2">
                      {contact.fullName}
                      {index === 0 && <span className="text-md">👑</span>}
                    </h2>

                    {contact.bio ? (
                      <p className="text-slate-400 text-sm mt-2 line-clamp-2 leading-relaxed h-10">
                        {contact.bio}
                      </p>
                    ) : (
                      <p className="text-slate-400 text-sm mt-2 italic h-10">
                        Just Exploring
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 px-3 py-1 rounded-xl border border-white/10 transition-colors cursor-default">
                    <span className="text-sm filter saturate-150">❤️</span>
                    <div className="h-3 w-px bg-white/20 mx-1" />{" "}
                    {/* Subtle Divider */}
                    <span className="text-sm font-bold bg-linear-to-r from-pink-300 to-rose-400 bg-clip-text text-transparent">
                      {contact.likesCount}
                    </span>
                    <span className="text-[10px] font-medium text-pink-300/50 uppercase tracking-widest">
                      {contact.likesCount === 1 ? "like" : "likes"}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  {contact._id !== authUser._id ? (
                    <div className="mt-6 flex w-full gap-3">
                      <button
                        onClick={() => {
                          navigate(`/user-profile/${contact._id}`);
                        }}
                        className="flex-1 px-4 py-2 text-sm font-semibold rounded-full border border-indigo-500/30 text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 transition-all"
                      >
                        View Profile
                      </button>

                      <button
                        onClick={() => {
                          setSelectedUser(contact);
                          navigate(`/chats/${contact._id}`);
                        }}
                        className="flex-1 px-4 py-2 text-sm font-semibold rounded-full border border-emerald-500/30 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 transition-all"
                      >
                        Message
                      </button>
                    </div>
                  ) : (
                    <motion.div
                      transition={{
                        y: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                        duration: 0.5,
                      }}
                      className="relative mt-6 flex items-center gap-2 bg-linear-to-b from-amber-200 via-yellow-400 to-amber-500 p-px rounded-full shadow-[0_0_20px_rgba(251,191,36,0.3)]"
                    >
                      {/* Inner Container */}
                      <div className="bg-slate-950 px-3 py-1 rounded-full flex items-center gap-1.5 overflow-hidden relative">
                        {/* Animated Shimmer Shine */}
                        <motion.div
                          animate={{ x: ["-100%", "200%"] }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "linear",
                            repeatDelay: 1,
                          }}
                          className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent w-1/2 skew-x-12"
                        />

                        <span className="text-base drop-shadow-sm">
                          {index < 1 ? "🥇" : index < 2 ? "🥈" : "🥉"}
                        </span>

                        <span className="text-[10px] font-black uppercase tracking-widest text-transparent bg-clip-text bg-linear-to-r from-amber-200 to-yellow-500 flex items-center">
                          You Are Top
                          <span className="ml-1.5 text-sm text-white drop-shadow-[0_0_5px_rgba(251,191,36,0.8)]">
                            {index + 1}
                          </span>
                        </span>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {TopLikedUsers?.length < 1 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-full mx-auto mt-10 p-8 rounded-4xl border-2 border-dashed border-slate-700/50 bg-slate-900/20 backdrop-blur-sm flex flex-col items-center justify-center text-center"
          >
            {/* Decorative Icon Container */}
            <div className="relative mb-4">
              <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full"></div>
              <div className="relative w-16 h-16 bg-slate-800/50 rounded-2xl flex items-center justify-center border border-slate-700/50 rotate-3 group-hover:rotate-0 transition-transform">
                <span className="text-3xl">✨</span>
              </div>
            </div>

            {/* Text Content */}
            <h3 className="text-xl font-bold text-white tracking-tight">
              The Throne is Empty
            </h3>
            <p className="text-slate-400 text-sm mt-2 max-w-[220px] leading-relaxed">
              No top users found this week. Be the first to climb the
              leaderboard!
            </p>

            {/* Action Link/Hint */}
            <div className="mt-6 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20">
              <span className="text-[11px] font-bold uppercase tracking-widest text-indigo-400">
                Updates Every Week
              </span>
            </div>
          </motion.div>
        )}
      </section>
    </div>
  );
}

export default TopLikedUsers;
