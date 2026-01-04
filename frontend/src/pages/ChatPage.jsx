// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { useChatStore } from "../store/useChatStore";
import { useProfileStore } from "../store/useProfileStore";
import ChatContainer from "../components/ChatContainer";
import NoConversationPlaceholder from "../components/NoConversationPlaceholder";
import SideNavBar from "../components/SideNavBar";
import SelectedUserChatProfile from "../components/SelectedUserChatProfile";
import { useIsMobile } from "../utils/IsMobile";
import LeftChatPortion from "../components/LeftChatPortion";

function ChatPage() {
  const { selectedUser } = useChatStore();
  const { isVisitingProfile } = useProfileStore();
  const isMobile = useIsMobile();

  return (
    <div className="relative min-h-screen w-full bg-slate-900 md:pl-20 overflow-hidden">
      <div className="flex flex-col md:flex-row h-screen">
        {/* LEFT SIDEBAR: Hidden only on mobile when a chat is open */}
        <LeftChatPortion selectedUser={selectedUser} isMobile={isMobile} />

        {/* RIGHT CONTENT: The Sliding Panel */}
        <div
          className={`flex-1 relative h-full overflow-hidden ${
            isMobile && "fixed inset-0 z-50"
          }`}
        >
          <AnimatePresence mode="wait">
            <motion.div
              // Use a unique key so Framer Motion knows to animate when the view changes
              key={
                selectedUser
                  ? isVisitingProfile
                    ? "profile"
                    : selectedUser._id
                  : "empty"
              }
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{
                type: "tween",
                ease: [0.22, 1, 0.36, 1],
                duration: 0.4,
              }}
              className="will-change-transform transform-gpu w-full h-full flex flex-col bg-slate-900"
            >
              {selectedUser && isVisitingProfile ? (
                <SelectedUserChatProfile />
              ) : selectedUser ? (
                <ChatContainer />
              ) : (
                !isMobile ? <NoConversationPlaceholder /> : <LeftChatPortion selectedUser={selectedUser} isMobile={isMobile} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <SideNavBar />
    </div>
  );
}

export default ChatPage;
