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
                className="group relative bg-slate-900/40 border border-slate-800/60 rounded-3xl px-6 py-5 transition-all duration-300 hover:bg-slate-800/60 hover:border-indigo-500/50 hover:shadow-[0_0_30px_-10px_rgba(99,102,241,0.3)]"
              >
                {/* Avatar */}
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-slate-800 group-hover:ring-indigo-500/30 transition-all duration-300">
                      <img
                        src={contact.profilePic || "/avatar.png"}
                        alt={contact.fullName}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                  </div>

                  {/* User Info */}
                  <div className="mt-4 text-center w-full">
                    <h2 className="text-lg font-semibold text-white truncate">
                      {contact.fullName}
                    </h2>
                    <p className="text-slate-400 text-sm mt-1 line-clamp-2 min-h-10">
                      {contact.bio || "No bio yet..."}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-3 w-full">
                    <button
                      onClick={() => {
                        setSelectedUser(contact);
                        addChatToTop(contact);
                        navigate(`/chats/${contact._id}`);
                      }}
                      className="flex items-center justify-center gap-2 w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-all active:scale-95"
                    >
                      <MessageSquare size={16} />
                      Message
                    </button>

                    <button
                      onClick={() => {
                        setSelectedUser(contact);
                        navigate(`/user-profile/${contact._id}`);
                      }}
                      className="flex items-center justify-center gap-2 w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-xl border border-slate-700 transition-all"
                    >
                      <UserCircle size={16} />
                      View Profile
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
