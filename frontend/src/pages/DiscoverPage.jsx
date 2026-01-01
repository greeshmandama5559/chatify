import { useChatStore } from "../store/useChatStore";
import SideNavBar from "../components/SideNavBar";
import { useNavigate } from "react-router-dom";
import SearchUsers from "../components/SearchUsers";
import DiscoverSearchUsers from "../components/DiscoverSearchUsers";
import { useProfileStore } from "../store/useProfileStore";
import NoUsersFound from "../components/NoUsersFound";
import SimilarInterestsComponent from "../components/SimilarInterestsComponent";
import TopLikedUsers from "../components/TopLikedUsers";

function DiscoverPage() {
  const { allContacts, setSelectedUser, setProfileUser } = useChatStore();

  const { searchedUsers, query, searchUsersLoading } = useProfileStore();

  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen w-full md:ml-19 bg-[#0a0a0c] text-slate-200 pb-28 pt-5 px-4 overflow-y-auto scrollbar-hide">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-[500px] h-[500px] bg-indigo-500/10 blur-[120px] rounded-full" />
        <div className="absolute top-1/2 -right-24 w-[400px] h-[400px] bg-purple-500/10 blur-[120px] rounded-full" />
      </div>

      <SearchUsers />

      {searchedUsers.length > 0 ? (
        <DiscoverSearchUsers />
      ) : !searchUsersLoading &&
        searchedUsers.length < 1 &&
        query.length > 0 ? (
        <NoUsersFound />
      ) : (
        <>
          <TopLikedUsers />

          <SimilarInterestsComponent />

          <div className="flex items-center justify-between px-4 mb-6">
            <h2 className="text-xl font-bold text-white">Users</h2>
          </div>
          <div className="max-w-full mx-auto grid grid-cols-1 px-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {allContacts.map((contact) => (
              <div
                key={contact._id}
                className="group relative bg-slate-900/50 border border-slate-800 rounded-4xl p-6 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)]"
              >
                <div className="flex flex-col justify-center items-center">
                  {/* Avatar */}
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full overflow-hidden ring-4 ring-slate-800/50 group-hover:ring-indigo-500/20 transition-all duration-500">
                      <img
                        src={contact.profilePic || "/avatar.png"}
                        alt={contact.fullName}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      {contact?.gender === "female" && (
                        <div className="absolute -top-2 -left-2 -rotate-40 opacity-90 rounded-full transition-all shadow-lg">
                          <img src="/ribbon.png" alt="" className="w-10 h-10" />
                        </div>
                      )}
                    </div>
                    {contact.isNew && (
                      <div className="bg-cyan-100/80 w-10 ml-5 backdrop-blur-sm z-50 -mt-4 px-2 h-5 rounded-md flex justify-center items-center border border-cyan-200">
                        <span className="text-[12px] font-bold text-cyan-700">
                          new
                        </span>
                      </div>
                    )}
                  </div>

                  {/* User Info */}
                  <div className="mt-3 text-center w-full">
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
                      onClick={() => {
                        setProfileUser(contact);
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
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <SideNavBar />
    </div>
  );
}

export default DiscoverPage;
