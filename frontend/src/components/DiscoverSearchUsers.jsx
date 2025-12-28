import { useProfileStore } from "../store/useProfileStore";
import { useChatStore } from "../store/useChatStore";
import { useNavigate } from "react-router";
import { MessageSquare, UserCircle } from "lucide-react";
import DiscoverPageLoadingSkeleton from "./DiscoverPageLoadingSkeleton";

function DiscoverSearchUsers() {
  const { setSelectedUser, addChatToTop } = useChatStore();

  const navigate = useNavigate();

  const { searchedUsers, searchUsersLoading } = useProfileStore();

  return (
    <div className="h-dvh w-full bg-[#0a0a0c] text-slate-200 pb-28 overflow-y-auto scrollbar-hide">
      {searchUsersLoading ? (
        <DiscoverPageLoadingSkeleton size={2} />
      ) : (
        <div className="max-w-full mx-auto grid grid-cols-1 px-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {searchedUsers.length > 0 &&
            searchedUsers.map((contact) => (
              <div
                key={contact._id}
                className="group relative bg-slate-900/50 border border-slate-800 rounded-4xl p-6 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)]"
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

                  {/* Action Buttons */}
                  <div className=" flex w-full gap-3">
                    <button
                      onClick={() => navigate(`/user-profile/${contact._id}`)}
                      className="flex-1 px-4 py-2 text-sm font-semibold rounded-full border border-indigo-500/30 text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 transition-all"
                    >
                      View Profile
                    </button>

                    <button
                      onClick={() => {
                        setSelectedUser(contact);
                        addChatToTop(contact);
                        navigate(`/chats/${contact._id}`);
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
      )}
    </div>
  );
}

export default DiscoverSearchUsers;
