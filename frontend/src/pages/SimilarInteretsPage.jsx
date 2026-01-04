import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { ArrowLeft } from "lucide-react";
import { useProfileStore } from "../store/useProfileStore";

function SimilarInteretsPage() {
  const navigate = useNavigate();

  const { similarInteretsUsers } = useAuthStore();

  const { setIsVisitingProfile } = useProfileStore();

  const { setSelectedUser, getMessagesByUserId } = useChatStore();

  return (
    <div className="relative min-h-screen w-full bg-[#0a0a0c] text-slate-200 pb-28 pt-5 px-4 overflow-y-auto scrollbar-hide">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-[500px] h-[500px] bg-indigo-500/10 blur-[120px] rounded-full" />
        <div className="absolute top-1/2 -right-24 w-[400px] h-[400px] bg-purple-500/10 blur-[120px] rounded-full" />
      </div>
      <nav className="sticky top-0 z-40 w-full backdrop-blur-md mb-8 px-6 py-4">
        <div className="max-w-8xl mx-auto flex justify-between items-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
          >
            <ArrowLeft
              size={20}
              className="group-hover:-translate-x-1 transition-transform"
            />
            <span className="text-sm font-medium">Back</span>
          </button>
        </div>
      </nav>
      <section className="mb-12">
        <div className="flex items-center justify-between px-4 mb-6">
          <h2 className="text-xl font-bold text-white">
            Users With Similar Interests
          </h2>
        </div>

        {/* Changed grid-cols-1 to grid-cols-2 and reduced the gap for mobile */}
        <div className="max-w-full mx-auto grid grid-cols-2 gap-3 px-2 sm:px-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:gap-8">
          {similarInteretsUsers.map((contact) => (
            <div
              key={contact._id}
              // Removed min-w-70 (which forced cards to be wide) and reduced padding/rounded corners for mobile
              className="group relative bg-slate-900/40 border border-slate-800/50 rounded-2xl sm:rounded-4xl p-3 sm:p-6 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)]"
            >
              <div className="flex flex-col items-center">
                {/* Avatar: Scaled down from w-20 to w-14 on mobile */}
                <div className="relative">
                  <div className="w-12 h-12 sm:w-20 sm:h-20 rounded-full overflow-hidden ring-4 ring-slate-800/50 group-hover:ring-indigo-500/20 transition-all duration-500">
                    <img
                      src={contact.profilePic || "/avatar.png"}
                      alt={contact.fullName}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  </div>
                </div>

                {/* User Info */}
                <div className="mt-3 sm:mt-5 text-center w-full">
                  {/* Reduced text size for mobile */}
                  <h2 className="text-ms sm:text-xl font-bold text-white tracking-tight truncate">
                    {contact.fullName}
                  </h2>

                  {contact.bio ? (
                    <p className="text-slate-400 text-[10px] sm:text-sm mt-1 sm:mt-2 line-clamp-2 leading-tight sm:leading-relaxed h-8 sm:h-10">
                      {contact.bio}
                    </p>
                  ) : (
                    <p className="text-slate-400 text-[10px] sm:text-sm mt-1 sm:mt-2 italic h-8 sm:h-10">
                      Just Exploring
                    </p>
                  )}
                </div>

                <div className="mt-0 ms:mt-2 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-[10px] sm:text-xs font-semibold">
                  {contact.matchPercentage}% Match
                </div>

                {/* Action Buttons: Stacked on mobile, side-by-side on desktop */}
                <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row w-full gap-2 sm:gap-3">
                  <button
                    onClick={() => navigate(`/user-profile/${contact._id}`)}
                    className="flex-1 px-2 py-2 sm:px-4 text-[11px] sm:text-sm font-semibold rounded-xl sm:rounded-full border border-indigo-500/30 text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 transition-all"
                  >
                    View profile
                  </button>

                  <button
                    onClick={() => {
                      const contactId = contact._id;

                      setSelectedUser(contact);

                      setIsVisitingProfile(false);

                      const cached =
                        useChatStore.getState().messagesCache[contactId] || [];

                      useChatStore.setState({
                        chatMessages: cached,
                      });

                      getMessagesByUserId(contactId);

                      navigate(`/chats/${contactId}`);
                    }}
                    className="flex-1 px-2 py-2 sm:px-4 text-[11px] sm:text-sm font-semibold rounded-xl sm:rounded-full border border-emerald-500/30 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 transition-all"
                  >
                    Message
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default SimilarInteretsPage;
