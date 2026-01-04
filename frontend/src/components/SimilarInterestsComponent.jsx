import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import NoMatchedUsers from "./NoMatchedUsers";
import AddInterestsCard from "./AddInterests";
import { useProfileStore } from "../store/useProfileStore";

function SimilarInterestsComponent() {
  const navigate = useNavigate();

  const { similarInteretsUsers, authUser } = useAuthStore();

  const { setIsVisitingProfile } = useProfileStore();

  const { setSelectedUser, getMessagesByUserId } = useChatStore();

  return (
    <div>
      <section className="mb-12">
        <div className="flex items-center justify-between px-4 mb-6">
          <h2 className="text-xl font-bold text-cyan-600">Similar Interests</h2>

          {similarInteretsUsers.length >= 4 && (
            <button
              onClick={() => navigate("/similar-interests")}
              className="text-indigo-400 hover:text-indigo-300 text-sm font-medium"
            >
              Show all →
            </button>
          )}
        </div>

        {authUser?.interests?.length < 1 ? (
          <AddInterestsCard />
        ) : (
          similarInteretsUsers.length < 1 && (
            <div className="w-full flex justify-center items-center">
              <NoMatchedUsers />
            </div>
          )
        )}

        <div
          className="
            flex gap-6 px-4
            overflow-x-auto
            md:grid md:grid-cols-4 md:overflow-visible
            scrollbar-hide
          "
        >
          {similarInteretsUsers.slice(0, 8).map((contact) => (
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
                </div>

                {/* User Info */}
                <div className="mt-5 text-center w-full">
                  <h2 className="text-xl font-bold text-white tracking-tight transition-colors">
                    {contact.fullName}
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

                <div className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-semibold">
                  {contact.matchPercentage}% Match
                </div>

                {/* Action Buttons */}
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
                    className="flex-1 px-4 py-2 text-sm font-semibold rounded-full border border-emerald-500/30 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 transition-all"
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

export default SimilarInterestsComponent;
