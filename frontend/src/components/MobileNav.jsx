import { useLocation, useMatch } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

const MobileNav = ({ navItems, handleNavigation, hasNewNotification, totalUnseen }) => {
  const location = useLocation();

  const isChatDetail = useMatch("/chats/:chatid");

  if (isChatDetail) return null;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-18 pb-safe bg-[#0a0a0c]/90 backdrop-blur-xl border-t border-white/5 flex items-center justify-around z-100 px-2 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
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
              />
            )}

            <div className="relative z-10 flex flex-col items-center gap-1">
              <Icon
                size={22}
                className={isActive ? "text-cyan-400" : "text-slate-500"}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span
                className={`text-[10px] font-medium ${
                  isActive ? "text-cyan-400" : "text-slate-500"
                }`}
              >
                {item.label}
              </span>

              {item.id === "notifications" && hasNewNotification && (
                <div className="absolute top-0 right-4 w-1.5 h-1.5 rounded-full bg-rose-500" />
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
    </nav>
  );
};

export default MobileNav;
