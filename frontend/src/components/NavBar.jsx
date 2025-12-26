import {
  HomeIcon,
  MessageCircle,
  UserCircle2,
  Compass,
  Heart,
} from "lucide-react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { useProfileStore } from "../store/useProfileStore";

function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();

  const { hasNewNotification, setHasNewNotification } = useProfileStore();

  const tabs = [
    { id: "home", icon: HomeIcon, path: "/" },
    { id: "discover", icon: Compass, path: "/discover" },
    { id: "chats", icon: MessageCircle, path: "/chats" },
    { id: "notifications", icon: Heart, path: "/notifications" },
    { id: "profile", icon: UserCircle2, path: "/profile" },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-black/40 backdrop-blur-2xl border border-white/10 p-2 rounded-[2.5rem] flex gap-0 md:gap-2">
      {tabs.map((item) => {
        const isActive = location.pathname === item.path;

        return (
          <button
            key={item.id}
            onClick={() => {
              navigate(item.path)
              if (item.id === "notifications") setHasNewNotification(false);
            }}
            className="relative px-5 md:px-6 py-3 rounded-full"
          >
            {isActive && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-cyan-600 rounded-full"
              />
            )}
            {item.id === "notifications" ? (
              <div className="flex flex-col">
                <item.icon
                  className={`relative z-10 ${
                    isActive ? "text-white" : "text-slate-500"
                  }`}
                />
                {hasNewNotification && (
                  <div className="w-1 h-1 ml-2.5 mt-1 rounded-full bg-red-700"></div>
                )}
              </div>
            ) : (
              <item.icon
                className={`relative z-10 ${
                  isActive ? "text-white" : "text-slate-500"
                }`}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

export default NavBar;
