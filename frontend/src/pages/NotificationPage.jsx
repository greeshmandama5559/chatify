import SideNavBar from "../components/SideNavBar";
import { MessageCircle, Bell, Clock, Heart, UserPlus } from "lucide-react";
import { useProfileStore } from "../store/useProfileStore";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useChatStore } from "../store/useChatStore";
import EmptyNotifications from "../components/EmptyNotifications";

function NotificationPage() {
  const { likedUsers, getMyLikes, setHasNewNotification, likesLoading } =
    useProfileStore();

  const { setSelectedUser, addChatToTop } = useChatStore();

  const navigate = useNavigate();

  useEffect(() => {
    getMyLikes();
    setHasNewNotification(false);
  }, [getMyLikes, setHasNewNotification]);

  return (
    <div className="px-2 relative z-10 w-full md:ml-19 flex justify-center bg-[#08090a] text-slate-200 overflow-y-auto scrollbar-hide">
      {/* Dynamic Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-[500px] h-[500px] bg-indigo-500/10 blur-[120px] rounded-full" />
        <div className="absolute top-1/2 -right-24 w-[400px] h-[400px] bg-purple-500/10 blur-[120px] rounded-full" />
      </div>

      {likedUsers.length > 0 || likesLoading ? (
        <div className="relative h-dvh z-10 w-full max-w-2xl mt-10 flex flex-col gap-6">
          {/* Header Section */}
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-500/10 rounded-lg">
                <Bell className="w-6 h-6 text-indigo-400" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">
                Notifications
              </h1>
            </div>
          </div>

          {/* Main Feed Container */}
          <div className="bg-zinc-900/50 border border-zinc-800 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-zinc-800 bg-zinc-900/30">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Recent Activity
              </h2>
            </div>

            {likesLoading ? (
              <div className="overflow-y-auto max-h-[70vh] scrollbar-hide">
                <div className="space-y-2">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className=" p-4 rounded-lg animate-pulse">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-slate-700 rounded-full"></div>
                        <div className="flex-1 flex flex-col">
                          <div className="h-5 bg-slate-700 rounded w-35 mb-2"></div>
                          <div className="h-3 bg-slate-700/70 rounded mt-1 w-35"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="overflow-y-auto max-h-[70vh] scrollbar-hide">
                {likedUsers.map((like) => (
                  <div
                    key={like._id}
                    className="group flex items-center justify-between p-4 border-b border-zinc-800/50 hover:bg-white/2 transition-all cursor-pointer"
                  >
                    <div
                      onClick={() => {
                        setSelectedUser(like.likedBy);
                        navigate(`/user-profile/${like.likedBy._id}`);
                      }}
                      className="flex items-center gap-4"
                    >
                      <div className="relative">
                        <img
                          src={`${like.likedBy.profilePic}` || "./avatar.png"}
                          className="w-12 h-12 rounded-full"
                        />
                        <div className="absolute -bottom-1 -right-1 p-1 bg-zinc-900 rounded-full">
                          <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
                        </div>
                      </div>

                      {/* Notification Text */}
                      <div>
                        <p className="text-sm mb-1">
                          <span className="font-bold text-white group-hover:text-indigo-300 transition-colors">
                            {like.likedBy.fullName}
                          </span>
                          <br />
                        </p>
                        <p className="text-sm">
                          <span className="text-zinc-400">
                            liked your profile
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          setSelectedUser(like.likedBy);
                          addChatToTop(like.likedBy);
                          navigate(`/chats/${like.likedBy._id}`);
                        }}
                        className="p-2 hover:bg-zinc-800 rounded-full transition-colors"
                      >
                        <MessageCircle className="w-5 h-5 text-zinc-400" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <EmptyNotifications />
      )}

      <SideNavBar />
    </div>
  );
}

export default NotificationPage;
