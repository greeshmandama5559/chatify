import { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { XIcon } from "lucide-react";

function ChatHeader() {
  const { selectedUser, setSelectedUser } = useChatStore();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setSelectedUser(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [setSelectedUser]);

  return (
    <>
      <div className="flex justify-between items-center rounded-r-2xl bg-slate-800/50 border-b border-slate-700/50 max-h-[84px] p-3 px-6 flex-1">
        <div className="flex items-center space-x-3">
          <div className="avatar avatar-online">
            <div className="rounded-full w-12">
              <img
                src={selectedUser.profilePic || "/avatar.png"}
                alt={selectedUser.fullName}
              />
            </div>
          </div>

          <div>
            <h3 className="test-slate-200 text-xl font-medium">
              {selectedUser.fullName}
            </h3>
            <p className="text-slate-400 text-sm">Online</p>
          </div>
        </div>

        <button onClick={() => setSelectedUser(null)}>
          <XIcon className="size-5 text-slate-500 hover:text-slate-200 transition-colors cursor-pointer" />
        </button>
      </div>
    </>
  );
}

export default ChatHeader;
