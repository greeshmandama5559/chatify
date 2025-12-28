import {
  Home as HomeIcon,
  Compass,
  MessageCircle,
  UserCircle2,
  Heart,
} from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { useProfileStore } from "../store/useProfileStore";
import { useMemo } from "react";

const navItems = [
  { id: "home", label: "Home", icon: HomeIcon, path: "/" },
  { id: "discover", label: "Discover", icon: Compass, path: "/discover" },
  { id: "chats", label: "Chats", icon: MessageCircle, path: "/chats" },
  {
    id: "notifications",
    label: "Notifications",
    icon: Heart,
    path: "/notifications",
  },
  { id: "profile", label: "Profile", icon: UserCircle2, path: "/profile" },
];

const SideNavBar = () => {
  const { chats = [], unseenCounts = {} } = useChatStore();

  const { authUser } = useAuthStore();

  const navigate = useNavigate();
  const location = useLocation();
  const { setHasNewNotification } = useProfileStore();

  const toId = (v) => String(v ?? "");

  const totalUnseen = useMemo(() => {
    if (!Array.isArray(chats)) return 0;

    return chats.reduce((sum, chat) => {
      if (!chat || !chat._id) return sum;

      const chatId = toId(chat._id);

      const unseen =
        chat.unseenCount !== undefined
          ? Number(chat.unseenCount) || 0
          : Number(unseenCounts?.[chatId]) || 0;

      return sum + unseen;
    }, 0);
  }, [chats, unseenCounts]);

  const handleNavigation = async (path, id) => {
    navigate(path);
    if (id === "notifications") {
      await setHasNewNotification(false);
    }
  };

  return (
    <>
      {/* ===== DESKTOP LEFT SIDEBAR ===== */}
      <aside className="hidden md:flex fixed top-0 left-0 h-screen w-20 bg-black/40 backdrop-blur-2xl border-r border-white/10 flex-col items-center py-6 gap-4 z-50">
        {navItems.map((item) => {
          const isActive =
            location.pathname === item.path ||
            location.pathname.startsWith(item.path + "/");
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.path, item.id)}
              className="group relative flex items-center justify-center w-12 h-12 rounded-xl transition-colors"
            >
              {/* Animated Background Indicator */}
              {isActive && (
                <motion.div
                  layoutId="activeTabSide"
                  className="absolute inset-0 bg-cyan-600 rounded-xl"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}

              <div className="relative z-10">
                <Icon
                  size={22}
                  className={
                    isActive
                      ? "text-white"
                      : "text-slate-400 group-hover:text-white"
                  }
                />

                {/* Notification Dot */}
                {item.id === "notifications" &&
                  authUser?.hasNewNotification && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-600 border-2 border-black" />
                  )}

                {item.id === "chats" && totalUnseen > 0 && (
                  <span
                    aria-hidden
                    className="absolute -top-1 -left-1 text-[11px] font-semibold rounded-full bg-green-500/95 text-black min-w-5 flex items-center justify-center shadow-md"
                  >
                    {totalUnseen > 99 ? "99+" : totalUnseen}
                  </span>
                )}
              </div>

              {/* Tooltip */}
              <span className="absolute left-16 whitespace-nowrap rounded-md bg-black px-3 py-1.5 text-xs text-white opacity-0 scale-95 transition-all duration-200 group-hover:opacity-100 group-hover:scale-100 pointer-events-none">
                {item.label}
              </span>
            </button>
          );
        })}
      </aside>

      {/* ===== MOBILE BOTTOM NAV ===== */}
      {/* Reusing the same logic for consistency */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-black/80 backdrop-blur-xl border-t border-white/10 flex items-center justify-around z-50 px-4">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.path, item.id)}
              className="relative flex items-center justify-center w-12 h-12"
            >
              {isActive && (
                <motion.div
                  layoutId="activeTabMobile"
                  className="absolute inset-0 bg-cyan-600/20 rounded-full"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}

              <div className="relative z-10 flex flex-col items-center">
                <Icon
                  size={24}
                  className={isActive ? "text-cyan-500" : "text-slate-400"}
                />
                {item.id === "notifications" &&
                  authUser?.hasNewNotification && (
                    <div className="absolute top-0 right-0 w-2 h-2 rounded-full bg-red-600" />
                  )}
              </div>
            </button>
          );
        })}
      </nav>
    </>
  );
};

export default SideNavBar;
