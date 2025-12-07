import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";

function mergeMessages(cached = [], server = []) {
  // Create map of server message IDs to messages
  const serverById = new Map(server.map((m) => [String(m._id), m]));

  // Keep only server messages (authoritative). But preserve optimistic messages that server hasn't returned yet:
  const optimisticNotInServer = cached.filter(
    (c) => String(c._id).startsWith("temp-") && !serverById.has(String(c._id))
  );

  // final array: server messages (sorted by createdAt asc) + remaining optimistic
  const sortedServer = server
    .slice()
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  const merged = [...sortedServer, ...optimisticNotInServer];

  // Optionally sort by createdAt
  merged.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  return merged;
}

export const useChatStore = create((set, get) => ({
  allContacts: [],
  chats: [],
  messages: [],
  activeTab: "chats",
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  messagesCache: {},
  persistedMessagesEnabled: true,
  isSoundEnabled: JSON.parse(localStorage.getItem("isSoundEnabled")) === true,
  totalUnseenCount: 0,

  // NEW: tracking unseen counts, last unseen message id, typing statuses
  unseenCounts: {}, // { [userId]: number }
  lastUnseenMessageId: {}, // { [userId]: messageId }
  typingStatuses: {}, // { [userId]: boolean }
  socketSubscribed: false,
  socketHandlers: {},

  toggleSound: () => {
    localStorage.setItem("isSoundEnabled", !get().isSoundEnabled);
    set({ isSoundEnabled: !get().isSoundEnabled });
  },

  setActiveTab: (tab) => set({ activeTab: tab }),

  setTotalUnseenCount: (count) => set({ totalUnseenCount: count }),

  // override setSelectedUser so that selecting a user marks messages as seen
  setSelectedUser: (selectedUser) => {
    set({ selectedUser });
    if (selectedUser && selectedUser._id) {
      // mark seen immediately
      get().markChatAsSeen(selectedUser._id);
    }
  },

  // --------------------- LOAD CONTACTS ---------------------
  getAllContacts: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/contacts");
      set({ allContacts: res.data });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load contacts");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  // --------------------- LOAD CHATS (INITIAL) ---------------------
  getMyChatPartners: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/chats");
      // make sure chats include unseenCount if store has seen/synced info
      const chatsFromServer = res.data.map((c) => ({
        ...c,
        unseenCount: get().unseenCounts[c._id] || 0,
      }));
      set({ chats: chatsFromServer });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load chats");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  // --------------------- LOAD MESSAGES ---------------------
  getMessagesByUserId: async (userId) => {
    set({ isMessagesLoading: true });

    try {
      const cached = get().messagesCache[userId];
      if (cached && cached.length > 0) {
        set({ messages: cached });
      } else {
        set({ messages: [] });
      }

      const res = await axiosInstance(`/messages/${userId}`);
      const serverMessages = res.data || [];

      const merged = mergeMessages(cached || [], serverMessages);

      // store in-memory
      const newCache = { ...get().messagesCache, [userId]: merged };
      set({ messagesCache: newCache, messages: merged });

      // persist
      get()._persistCacheToStorage();

      // since user opened the chat, mark seen
      get().markChatAsSeen(userId);
    } catch (error) {
      console.error("Failed to load messages:", error);
      toast.error(error?.response?.data?.message || "Failed to load messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  // --------------------- SEND MESSAGE ---------------------
  sendMessage: async (messageData) => {
    const { authUser } = useAuthStore.getState();
    const tempId = `temp-${Date.now()}`;

    // Basic validation
    const selectedUser = get().selectedUser;
    if (!selectedUser || !selectedUser._id) {
      toast.error("No chat selected");
      return;
    }

    const selectedId = String(selectedUser._id);
    const authId = String(authUser?._id ?? get().authUser?._id ?? "");

    // normalize helper
    const norm = (id) => (id === undefined || id === null ? null : String(id));

    // Persist cache before the optimistic update if you rely on that
    if (typeof get()._persistCacheToStorage === "function") {
      get()._persistCacheToStorage();
    }

    // Optimistic message for UI
    const optimisticMessage = {
      _id: tempId,
      senderId: authId,
      receiverId: selectedId,
      text: messageData.text,
      image: messageData.image,
      createdAt: new Date().toISOString(),
      isOptimistic: true,
      // preserve any extra fields (type, url, etc.)
      ...messageData,
    };

    // Add optimistic message to the current live state (use get() to avoid stale writes)
    set((state) => ({
      messages: [...(state.messages || []), optimisticMessage],
      // update cache too
      messagesCache: {
        ...(state.messagesCache || {}),
        [selectedId]: [
          ...(state.messagesCache?.[selectedId] || []),
          optimisticMessage,
        ].slice(-200),
      },
    }));

    // Update chats: create or update stub and move to top
    set((state) => {
      const prevChats = Array.isArray(state.chats) ? state.chats : [];
      const updatedChats = prevChats.map((chat) =>
        norm(chat._id) === norm(selectedId)
          ? {
              ...chat,
              lastMessageText:
                messageData.text || (messageData.image ? "📷 Image" : ""),
              lastMessageSender: authId,
              lastMessageTime: new Date().toISOString(),
              unseenCount: 0,
            }
          : chat
      );

      const exists = updatedChats.some((c) => norm(c._id) === norm(selectedId));
      let finalChats = updatedChats;
      if (!exists) {
        const stub = {
          _id: selectedId,
          fullName:
            selectedUser.fullName ||
            selectedUser.full_name ||
            selectedUser.name ||
            "Unknown",
          profilePic:
            selectedUser.profilePic ||
            selectedUser.profile_pic ||
            "/avatar.png",
          lastMessageText:
            messageData.text || (messageData.image ? "📷 Image" : ""),
          lastMessageSender: authId,
          lastMessageTime: new Date().toISOString(),
          unseenCount: 0,
        };
        finalChats = [stub, ...updatedChats];
      }

      const reordered = [
        ...finalChats.filter((c) => norm(c._id) === norm(selectedId)),
        ...finalChats.filter((c) => norm(c._id) !== norm(selectedId)),
      ].filter(Boolean);

      return { chats: reordered };
    });

    // ----- send to server -----
    try {
      const res = await axiosInstance.post(
        `/messages/send/${selectedId}`,
        messageData
      );

      const serverMsg = res.data;

      if (serverMsg.senderId) serverMsg.senderId = String(serverMsg.senderId);
      if (serverMsg.receiverId)
        serverMsg.receiverId = String(serverMsg.receiverId);
      if (serverMsg._id) serverMsg._id = String(serverMsg._id);

      set((state) => {
        const curMessages = Array.isArray(state.messages) ? state.messages : [];
        const hasServer = curMessages.some(
          (m) => String(m._id) === String(serverMsg._id)
        );
        if (hasServer) {
          return {};
        }

        let replaced = false;
        const newMessages = curMessages.map((m) => {
          if (m._id === tempId) {
            replaced = true;
            const merged = {
              ...optimisticMessage,
              ...serverMsg,
              isOptimistic: false,
            };
            if (merged._id) merged._id = String(merged._id);
            if (merged.senderId) merged.senderId = String(merged.senderId);
            if (merged.receiverId)
              merged.receiverId = String(merged.receiverId);
            return merged;
          }
          return m;
        });

        if (!replaced) {
          newMessages.push(serverMsg);
        }

        return { messages: newMessages };
      });

      // Update messagesCache in a consistent way (replace tempId if present)
      // Merge optimistic fields if replacing so url/text are preserved until server has authoritative fields
      set((state) => {
        const cache = { ...(state.messagesCache || {}) };
        const list = Array.isArray(cache[selectedId]) ? cache[selectedId] : [];

        const replacedList = list.map((m) => {
          if (m._id === tempId) {
            const merged = {
              ...m, // optimistic message in cache
              ...serverMsg, // server truth overrides
              isOptimistic: false,
            };
            if (merged._id) merged._id = String(merged._id);
            return merged;
          }
          return m;
        });

        const hasServerInList = replacedList.some(
          (m) => String(m._id) === String(serverMsg._id)
        );

        const finalList = hasServerInList
          ? replacedList
          : [...replacedList, serverMsg].slice(-200);

        cache[selectedId] = finalList;
        return { messagesCache: cache };
      });

      if (typeof get()._persistCacheToStorage === "function") {
        get()._persistCacheToStorage();
      }
    } catch (error) {
      console.error("Error in send message:", error);

      // Remove only the optimistic message (don't overwrite state)
      set((state) => {
        const curMessages = Array.isArray(state.messages) ? state.messages : [];
        const filtered = curMessages.filter((m) => m._id !== tempId);
        const cache = { ...(state.messagesCache || {}) };
        if (Array.isArray(cache[selectedId])) {
          cache[selectedId] = cache[selectedId].filter((m) => m._id !== tempId);
        }
        // We keep any other messages that arrived in the meantime
        return { messages: filtered, messagesCache: cache };
      });

      toast.error("Failed to send message");
    }
  },
  // --------------------- END sendMessage ---------------------

  // --------------------- UNSEEN / TYPING HELPERS ---------------------
  incrementUnseenFor: (partnerId, message) => {
    const prev = get().unseenCounts[partnerId] || 0;
    const newCounts = { ...get().unseenCounts, [partnerId]: prev + 1 };
    const newLast = { ...get().lastUnseenMessageId, [partnerId]: message._id };
    // update chats array too so UI-consuming components can read chat.unseenCount quickly
    const updatedChats = get().chats.map((c) =>
      c._id === partnerId ? { ...c, unseenCount: (c.unseenCount || 0) + 1 } : c
    );
    set({
      unseenCounts: newCounts,
      lastUnseenMessageId: newLast,
      chats: updatedChats,
    });
  },

  markChatAsSeen: (partnerId) => {
    const newCounts = { ...get().unseenCounts, [partnerId]: 0 };
    const newLast = { ...get().lastUnseenMessageId };
    delete newLast[partnerId];
    const updatedChats = get().chats.map((c) =>
      c._id === partnerId ? { ...c, unseenCount: 0 } : c
    );
    set({
      unseenCounts: newCounts,
      lastUnseenMessageId: newLast,
      chats: updatedChats,
    });
    // Optionally: tell server we've seen messages (to update remote read receipts)
    try {
      const socket = useAuthStore.getState().socket;
      if (socket && socket.connected) {
        socket.emit("markSeen", { partnerId });
      }
    } catch (e) {
      console.error("Error in mark chat as seen: ", e);
    }
  },

  // --------------------- SOCKET MESSAGE LISTENER ---------------------
  // ----- subscribeToMessages (fixed) -----
  // store fields you should have or add:
  // socketSubscribed: false,
  // socketHandlers: {},

  subscribeToMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) {
      console.warn("[chat store] subscribeToMessages: socket not ready");
      return;
    }

    // Prevent duplicate binding
    if (get().socketSubscribed) {
      // Already subscribed
      return;
    }
    set({ socketSubscribed: true });

    const normalizeId = (id) =>
      id === undefined || id === null ? null : String(id);

    const onNewMessage = (newMessage) => {
      (async () => {
        try {
          console.log("[socket] newMessage received:", newMessage);

          if (
            get().messages.some((m) => String(m._id) === String(newMessage._id))
          )
            return;

          const { authUser } = useAuthStore.getState(); // always latest
          const authId = normalizeId(authUser?._id);
          const senderId = normalizeId(newMessage.senderId);
          const receiverId = normalizeId(newMessage.receiverId);

          // Determine partner id (the other user in the conversation)
          const partnerId = senderId === authId ? receiverId : senderId;
          if (!partnerId) {
            console.warn(
              "[chat store] newMessage without partnerId",
              newMessage
            );
            return;
          }

          const existsInCache = (
            get().messagesCache[newMessage.senderId] || []
          ).some((m) => String(m._id) === String(newMessage._id));

          if (existsInCache) return;

          // Normalize selectedUser id for comparisons
          const selectedUserId = normalizeId(get().selectedUser?._id);

          // Use normalized ids for caches/chats keys
          const messagesCache = get().messagesCache || {};
          const prevCache = messagesCache[partnerId] || [];

          // Append message to selected chat if currently open
          const isFromSelectedUser = senderId === selectedUserId;
          if (isFromSelectedUser) {
            set({ messages: [...get().messages, newMessage] });

            if (selectedUserId && typeof get().markChatAsSeen === "function") {
              get().markChatAsSeen(selectedUserId);
            }
          } else {
            // Only increment unseen for incoming messages (not ones we sent)
            if (senderId !== authId) {
              if (typeof get().incrementUnseenFor === "function") {
                get().incrementUnseenFor(partnerId, newMessage);
              } else {
                const current = get().unseenCounts || {};
                const prev = current[partnerId] || 0;
                set({ unseenCounts: { ...current, [partnerId]: prev + 1 } });
              }
            }
          }

          // update messagesCache (keep last 200)
          const newCacheForUser = [...prevCache, newMessage].slice(-200);
          set({
            messagesCache: {
              ...get().messagesCache,
              [partnerId]: newCacheForUser,
            },
          });

          // --- Build / update chat list entry (try to use real user info, else stub) ---
          // helper to get user info from store or fetch it if missing
          const getUserInfo = async (id) => {
            // prefer a store helper if you have one
            if (typeof get().getUserFromCache === "function") {
              const u = get().getUserFromCache(id);
              if (u) return { fullName: u.fullName, profilePic: u.profilePic };
            }
            // prefer a provided fetch helper
            if (typeof get().fetchUserById === "function") {
              try {
                const u = await get().fetchUserById(id);
                if (u)
                  return { fullName: u.fullName, profilePic: u.profilePic };
              } catch (e) {
                console.warn("[chat store] fetchUserById failed for", id, e);
              }
            }
            // fallback to a naive HTTP call — change URL to match your backend
            try {
              const res = await fetch(`/api/users/${id}`);
              if (res.ok) {
                const u = await res.json();
                return {
                  fullName:
                    u.fullName ||
                    `${u.firstName || ""} ${u.lastName || ""}`.trim(),
                  profilePic: u.profilePic,
                };
              }
            } catch (e) {
              console.warn(
                "[chat store] direct fetch user info failed for",
                id,
                e
              );
            }
            // last resort — use values from message payload if present
            return {
              fullName: newMessage.senderName || "Loading...",
              profilePic: newMessage.senderProfilePic || "/avatar.png",
            };
          };

          // Prepare updated chats with normalized id comparison
          const prevChats = get().chats || [];
          const updatedChats = prevChats.map((chat) => {
            if (normalizeId(chat._id) === partnerId) {
              return {
                ...chat,
                lastMessageText:
                  newMessage.text || (newMessage.image ? "📷 Image" : ""),
                lastMessageSender: senderId,
                lastMessageTime: newMessage.createdAt,
                unseenCount:
                  (get().unseenCounts && get().unseenCounts[partnerId]) ??
                  (chat.unseenCount || 0),
              };
            }
            return chat;
          });

          // If partner exists in updatedChats -> use that, else create stub
          const partnerExists = updatedChats.some(
            (c) => normalizeId(c._id) === partnerId
          );
          let finalChats = updatedChats;
          if (!partnerExists) {
            // initial minimal stub; we'll try to populate real name/profile asynchronously
            const stubChat = {
              _id: partnerId,
              fullName: newMessage.senderName || "Loading...",
              profilePic: newMessage.senderProfilePic || "/avatar.png",
              lastMessageText:
                newMessage.text || (newMessage.image ? "📷 Image" : ""),
              lastMessageSender: senderId,
              lastMessageTime: newMessage.createdAt,
              unseenCount:
                (get().unseenCounts && get().unseenCounts[partnerId]) || 1,
            };
            finalChats = [stubChat, ...updatedChats];

            // asynchronously fetch full user info and replace the stub when we have it
            getUserInfo(partnerId)
              .then((info) => {
                // double-check that a stub still exists before updating (prevents overwriting later updates)
                const currentChats = get().chats || [];
                const found = currentChats.find(
                  (c) => normalizeId(c._id) === partnerId
                );
                if (found) {
                  const replaced = currentChats.map((c) =>
                    normalizeId(c._id) === partnerId
                      ? {
                          ...c,
                          fullName: info.fullName || c.fullName,
                          profilePic: info.profilePic || c.profilePic,
                        }
                      : c
                  );
                  set({ chats: replaced });
                }
              })
              .catch((e) => {
                console.warn(
                  "[chat store] failed to fetch user info for stub",
                  partnerId,
                  e
                );
              });
          }

          // move the partner to top
          const reordered = [
            finalChats.find((c) => normalizeId(c._id) === partnerId),
            ...finalChats.filter((c) => normalizeId(c._id) !== partnerId),
          ].filter(Boolean);

          set({ chats: reordered });

          // persist cache
          if (typeof get()._persistCacheToStorage === "function") {
            get()._persistCacheToStorage();
          }

          // play sound
          if (get().isSoundEnabled) {
            try {
              const notificationSound = new Audio("/sounds/notification.mp3");
              notificationSound.currentTime = 0;
              notificationSound.play().catch(() => {});
            } catch (e) {
              console.error("Error playing notification sound:", e);
            }
          }
        } catch (err) {
          console.error("[chat store] error in onNewMessage:", err);
        }
      })();
    };

    // typing handler — match server payload { userId, isTyping }
    console.log("[chat store] typing status updated");
    const onTyping = ({ userId, isTyping }) => {
      try {
        const newTyping = { ...get().typingStatuses, [userId]: !!isTyping };
        set({ typingStatuses: newTyping });
        console.log("[chat store] typing status updated", newTyping);
      } catch (err) {
        console.error("[chat store] error in onTyping:", err);
      }
    };

    // Save handlers to store so unSubscribe can remove them
    set({ socketHandlers: { onNewMessage, onTyping } });

    // Remove previous handlers if any (defensive)
    socket.off("newMessage", onNewMessage);
    socket.off("typing", onTyping);

    // Attach handlers
    socket.on("newMessage", onNewMessage);
    socket.on("typing", onTyping);

    socket.on("deleteMessage", ({ messageId }) => {
      set((state) => ({
        messages: state.messages.filter((m) => m._id !== messageId),
      }));
    });

    console.log("[chat store] subscribed to socket events");
  },

  unSubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    const handlers = get().socketHandlers || {};
    const { onNewMessage, onTyping } = handlers;

    if (onNewMessage) socket.off("newMessage", onNewMessage);
    if (onTyping) socket.off("typing", onTyping);

    // clear flag & handlers
    set({ socketSubscribed: false, socketHandlers: {} });
    console.log("[chat store] unsubscribed from socket events");
  },

  loadMessageCacheFromStorage: () => {
    if (!get().persistedMessagesEnabled) return;
    try {
      const raw = localStorage.getItem("messagesCache_v1");
      if (raw) {
        const parsed = JSON.parse(raw);
        set({ messagesCache: parsed });
      }
    } catch (err) {
      console.error("Failed to load message cache:", err);
    }
  },

  // --- helper: persist cache to localStorage (call after cache mutation) ---
  _persistCacheToStorage: () => {
    if (!get().persistedMessagesEnabled) return;
    try {
      localStorage.setItem(
        "messagesCache_v1",
        JSON.stringify(get().messagesCache)
      );
    } catch (err) {
      console.error("Failed to persist message cache:", err);
    }
  },

  deleteMessage: async (messageId) => {
    try {
      await axiosInstance.delete(`/messages/delete/${messageId}`);

      set((state) => ({
        messages: state.messages.filter((m) => m._id !== messageId),
      }));
    } catch (err) {
      console.log("Delete message failed:", err, err?.response?.data || err.message);
    }
  },
}));
