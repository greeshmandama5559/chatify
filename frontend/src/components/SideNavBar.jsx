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
import MobileNav from "./MobileNav";

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
      <aside className="hidden md:flex fixed top-0 left-0 h-screen w-20 bg-[#0a0a0c]/80 backdrop-blur-2xl border-r border-white/5 flex-col items-center py-8 gap-6 z-100">
        {navItems.map((item) => {
          const isActive =
            location.pathname === item.path ||
            (item.path !== "/" && location.pathname.startsWith(item.path));
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.path, item.id)}
              className="group relative flex items-center justify-center w-12 h-12 transition-all duration-300"
            >
              {/* Active Glow Indicator */}
              {isActive && (
                <>
                  <motion.div
                    layoutId="activeTabSide"
                    className="absolute inset-0 bg-cyan-600 rounded-xl shadow-[0_0_20px_rgba(79,70,229,0.4)]"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                  <div className="absolute -left-4 w-1 h-8 bg-cyan-500 rounded-r-full" />
                </>
              )}

              <div className="relative z-10">
                <Icon
                  size={22}
                  className={
                    isActive
                      ? "text-white"
                      : "text-slate-500 group-hover:text-slate-200 transition-colors"
                  }
                  strokeWidth={isActive ? 2.5 : 2}
                />

                {/* Notification Dot */}
                {item.id === "notifications" &&
                  authUser?.hasNewNotification && (
                    <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 border-2 border-[#0a0a0c] animate-pulse" />
                  )}

                {/* Chat Badge */}
                {item.id === "chats" && totalUnseen > 0 && (
                  <span className="absolute -top-2 -left-2 text-[10px] font-bold px-1.5 rounded-full bg-cyan-500 text-black min-w-[18px] h-[18px] flex items-center justify-center shadow-lg border border-black/20">
                    {totalUnseen > 99 ? "99+" : totalUnseen}
                  </span>
                )}
              </div>

              {/* Enhanced Tooltip */}
              <span className="absolute left-16 translate-x-4 whitespace-nowrap rounded-lg bg-slate-800 border border-white/10 px-3 py-1.5 text-[11px] font-medium text-white opacity-0 scale-95 transition-all duration-200 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-x-0 pointer-events-none shadow-xl">
                {item.label}
              </span>
            </button>
          );
        })}
      </aside>

      {/* ===== MOBILE BOTTOM NAV ===== */}
      {/* <nav className="md:hidden fixed bottom-0 left-0 right-0 h-18 pb-safe bg-[#0a0a0c]/90 backdrop-blur-xl border-t border-white/5 flex items-center justify-around z-[100] px-2 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.path, item.id)}
              className="relative flex flex-col items-center justify-center w-14 h-14 transition-all"
            >
              {isActive && (
                <motion.div
                  layoutId="activeTabMobile"
                  className="absolute  w-18 h-13 bg-cyan-600/10 rounded-2xl"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}

              <div className="relative z-10 flex flex-col items-center gap-1">
                <Icon
                  size={22}
                  className={isActive ? "text-cyan-400" : "text-slate-500"}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span
                  className={`text-[10px] font-medium transition-colors ${
                    isActive ? "text-cyan-400" : "text-slate-500"
                  }`}
                >
                  {item.label}
                </span>

                {item.id === "notifications" &&
                  authUser?.hasNewNotification && (
                    <div className="absolute top-0 right-0 w-2 h-2 rounded-full bg-rose-500" />
                  )}

                {item.id === "chats" && totalUnseen > 0 && (
                  <span className="absolute -top-1 -right-2 text-[9px] font-bold px-1 rounded-full bg-cyan-500 text-black">
                    {totalUnseen > 99 ? "99" : totalUnseen}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </nav> */}

      <MobileNav
        navItems={navItems}
        handleNavigation={handleNavigation}
        hasNewNotification={authUser?.hasNewNotification}
        totalUnseen={totalUnseen}
      />
    </>
  );
};

export default SideNavBar;
