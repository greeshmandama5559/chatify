import { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import UsersLoadingSkeleton from "./UsersLoadingSkeleton";

function ContactList() {
  const {
    getAllContacts,
    allContacts,
    setSelectedUser,
    selectedUser,
    isUsersLoading,
  } = useChatStore();

  const { onlineUsers } = useAuthStore();

  useEffect(() => {
    getAllContacts();
  }, [getAllContacts]);

  if (isUsersLoading) return <UsersLoadingSkeleton size={5} />;

  return (
    <div className="px-3 pb-4 space-y-1">
      {allContacts.map((contact) => {
        const isSelected = selectedUser?._id === contact._id;
        const isOnline = onlineUsers.includes(contact._id);

        return (
          <button
            key={contact._id}
            onClick={() => { 
              setSelectedUser(contact)
              window.history.pushState({ chat: contact._id }, "", `#/chat/${contact._id}`);
            }}
            className={`w-full p-3 flex items-center gap-3 rounded-xl transition-all duration-200 group
              ${
                isSelected
                  ? "bg-slate-800/80 ring-1 ring-cyan-500/50 shadow-lg shadow-black/20"
                  : "hover:bg-slate-800/50 hover:pl-4" // Subtle shift on hover
              }
            `}
          >
            {/* Avatar Container */}
            <div className="relative">
              <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-700 group-hover:border-slate-600 transition-colors">
                <img
                  src={contact.profilePic || "/avatar.png"}
                  alt={contact.fullName}
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Online Dot */}
              {isOnline && (
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-slate-900 rounded-full shadow-sm"></span>
              )}
            </div>

            {/* Text Info */}
            <div className="text-left min-w-0">
              <h4 className={`font-medium text-sm truncate transition-colors ${
                 isSelected ? "text-cyan-100" : "text-slate-300 group-hover:text-white"
              }`}>
                {contact.fullName}
              </h4>
              <p className="text-xs text-slate-500 truncate group-hover:text-slate-400">
                {isOnline ? "Online" : "Offline"}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}

export default ContactList;