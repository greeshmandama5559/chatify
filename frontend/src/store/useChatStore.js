import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";
import { useCryptoStore } from "./useCryptoStore";

/**
 * mergeMessages keeps server messages authoritative and preserves optimistic messages
 * that the server hasn't returned yet (temp- ids).
 */
function mergeMessages(cached = [], server = []) {
  // Create map of server message IDs to messages
  const serverById = new Map(server.map((m) => [String(m._id), m]));

  // Keep only optimistic messages (temp-) not present on server
  const optimisticNotInServer = (cached || []).filter(
    (c) => String(c._id).startsWith("temp-") && !serverById.has(String(c._id))
  );

  // final array: server messages (sorted by createdAt asc) + remaining optimistic
  const sortedServer = (server || [])
    .slice()
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  const merged = [...sortedServer, ...optimisticNotInServer];

  // Optionally sort by createdAt (already sorted server, optimistic at end)
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
  /**
   * Fetch chats list from server and eagerly try to decrypt last message for each chat.
   * This stores chat.plainText (readable) and chat.cipherText (raw) so UI doesn't need to decrypt.
   */
  getMyChatPartners: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/chats");
      const chatsFromServer = res.data || [];

      // attempt to populate plainText for each chat's last message (eager)
      const decrypt = useCryptoStore.getState().decryptMessage;
      const normalized = await Promise.all(
        chatsFromServer.map(async (c) => {
          try {
            const chat = { ...c };
            // server may use lastMessageText or text; normalize to cipherText
            const cipher = chat.lastMessageText ?? chat.text ?? null;
            chat.cipherText = cipher ?? null;
            chat.type =
              chat.lastMessageText === "🎥 Video call initiated" &&
              chat.cipherText === "🎥 Video call initiated"
                ? "video_call"
                : chat.lastMessageText === "📷 Image"
                ? "image"
                : "";
            let pt = "";
            if (cipher) {
              console.log("type:", chat.type, chat);
              if (chat.type !== "video_call" && chat.type !== "image") {
                pt = await decrypt(cipher).catch((e) => {
                  console.warn("[chat store] decrypt chat preview failed", e);
                  return "";
                });
              } else {
                pt = chat.text ?? chat.plainText;
              }

              chat.plainText = pt || (chat.plainText ?? "");
            } else {
              chat.plainText = chat.plainText ?? "";
            }
            // attach unseenCount from local store if available
            chat.unseenCount =
              get().unseenCounts[c._id] || chat.unseenCount || 0;
            return chat;
          } catch (e) {
            console.error("[chat store] normalize chat failed", e);
            return {
              ...(c || {}),
              plainText: c?.plainText ?? "",
              cipherText: c?.lastMessageText ?? null,
              unseenCount: get().unseenCounts[c._id] || 0,
            };
          }
        })
      );

      console.log("normalized: ", normalized);

      set({ chats: normalized });
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
      let serverMessages = res.data || [];

      // Normalize server messages: ensure cipherText and try to populate plainText
      const decrypt = useCryptoStore.getState().decryptMessage;
      const normalized = await Promise.all(
        serverMessages.map(async (m) => {
          const msg = { ...m };
          msg.cipherText = msg.text ?? null; // server uses `text` for ciphertext
          try {
            if (msg.type !== "video_call") {
              msg.plainText =
                (await decrypt(msg.cipherText)) || msg.plainText || "";
            } else {
              msg.plainText = msg.text ?? msg.cipherText;
            }
          } catch (e) {
            console.log("error in get message:", e);
            msg.plainText = msg.plainText || "";
          }
          return msg;
        })
      );

      serverMessages = normalized;

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
  /**
   * messageData expected shape (from MessageInput):
   * {
   *   plainText?: string,   // plaintext for UI (optional if image-only)
   *   cipherText?: string,  // ciphertext to send to server (optional if image-only)
   *   image?: string,       // data URL or image URL
   *   type?: string, ...
   * }
   */
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

    // Ensure we don't accidentally pass a Promise or undefined for plainText
    const cleanText =
      messageData.textVideoCall ||
      messageData.plainText ||
      messageData.text ||
      "";

    // Build optimistic message (UI-facing)
    const optimisticMessage = {
      _id: tempId,
      senderId: authId,
      receiverId: selectedId,
      // store readable text for UI
      plainText: cleanText,
      // keep the encrypted payload too (if present)
      cipherText: messageData.cipherText || null,
      image: messageData.image || null,
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

    // Update chats: create or update stub and move to top (use plainText for preview)
    set((state) => {
      const prevChats = Array.isArray(state.chats) ? state.chats : [];
      const updatedChats = prevChats.map((chat) =>
        norm(chat._id) === norm(selectedId)
          ? {
              ...chat,
              lastMessageText:
                cleanText || (messageData.image ? "📷 Image" : ""),
              lastMessageSender: authId,
              lastMessageTime: new Date().toISOString(),
              // also keep plainText & cipherText on chat for UI
              plainText: cleanText || chat.plainText || "",
              cipherText: messageData.cipherText || chat.cipherText || null,
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
          lastMessageText: cleanText || (messageData.image ? "📷 Image" : ""),
          lastMessageSender: authId,
          lastMessageTime: new Date().toISOString(),
          plainText: cleanText || "",
          cipherText: messageData.cipherText || null,
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
      let payload = {};
      // server expects `text` to be ciphertext (this keeps API unchanged)
      if (messageData.type === "video_call") {
        payload = {
          type: "video_call",
          text: messageData.textVideoCall,
          image: messageData.image || null,
          url: messageData.url,
        };
      } else {
        payload = {
          text:
            messageData.textVideoCall ||
            messageData.cipherText ||
            messageData.text ||
            null,
          image: messageData.image || null,
        };
      }

      const res = await axiosInstance.post(
        `/messages/send/${selectedId}`,
        payload
      );

      let serverMsg = res.data || {};

      // normalize server message: set cipherText & try to derive plainText
      serverMsg = { ...serverMsg };
      serverMsg.cipherText = serverMsg.text ?? serverMsg.cipherText ?? null;

      // attempt to decrypt server cipher to plainText (defensive)
      try {
        const decrypt = useCryptoStore.getState().decryptMessage;
        if (serverMsg.type !== "video_call") {
          serverMsg.plainText = await decrypt(serverMsg.text);
        } else {
          serverMsg.plainText = serverMsg.text;
        }
      } catch (e) {
        console.log("error in send message:", e);
        serverMsg.plainText = serverMsg.text || "";
      }

      // normalize ids to strings
      if (serverMsg.senderId) serverMsg.senderId = String(serverMsg.senderId);
      if (serverMsg.receiverId)
        serverMsg.receiverId = String(serverMsg.receiverId);
      if (serverMsg._id) serverMsg._id = String(serverMsg._id);

      // Replace optimistic message in messages list with server message
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
              ...m, // optimistic (contains plainText, cipherText, etc.)
              ...serverMsg, // server authoritative fields override
              isOptimistic: false,
            };
            // ensure proper fields
            if (merged._id) merged._id = String(merged._id);
            if (merged.senderId) merged.senderId = String(merged.senderId);
            if (merged.receiverId)
              merged.receiverId = String(merged.receiverId);
            // ensure plainText stays (server plainText may be present from decrypt)
            merged.plainText = merged.plainText ?? m.plainText ?? "";
            merged.cipherText = merged.cipherText ?? m.cipherText ?? null;
            return merged;
          }
          return m;
        });

        if (!replaced) {
          // If optimistic not found, append server message (defensive)
          newMessages.push(serverMsg);
        }

        return { messages: newMessages };
      });

      // Update messagesCache in a consistent way (replace tempId if present)
      set((state) => {
        const cache = { ...(state.messagesCache || {}) };
        const list = Array.isArray(cache[selectedId]) ? cache[selectedId] : [];

        const replacedList = list.map((m) => {
          if (m._id === tempId) {
            const merged = {
              ...m, // optimistic message in cache (includes plainText)
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

      // Also update chats array to ensure lastMessageText/plainText reflect server message
      set((state) => {
        const prevChats = Array.isArray(state.chats) ? state.chats : [];
        const updatedChats = prevChats.map((chat) =>
          String(chat._id) === String(selectedId)
            ? {
                ...chat,
                lastMessageText:
                  serverMsg.plainText || (serverMsg.image ? "📷 Image" : ""),
                lastMessageSender: serverMsg.senderId ?? chat.lastMessageSender,
                lastMessageTime: serverMsg.createdAt ?? chat.lastMessageTime,
                plainText: serverMsg.plainText ?? chat.plainText ?? "",
                cipherText: serverMsg.cipherText ?? chat.cipherText ?? null,
                unseenCount: 0,
                type: serverMsg.type || null,
              }
            : chat
        );

        const exists = updatedChats.some(
          (c) => String(c._id) === String(selectedId)
        );
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
              serverMsg.plainText || (serverMsg.image ? "📷 Image" : ""),
            lastMessageSender: serverMsg.senderId ?? authId,
            lastMessageTime: serverMsg.createdAt ?? new Date().toISOString(),
            plainText: serverMsg.plainText ?? "",
            cipherText: serverMsg.cipherText ?? null,
            unseenCount: 0,
          };
          finalChats = [stub, ...updatedChats];
        }

        const reordered = [
          ...finalChats.filter((c) => String(c._id) === String(selectedId)),
          ...finalChats.filter((c) => String(c._id) !== String(selectedId)),
        ].filter(Boolean);

        return { chats: reordered };
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

  decrementUnseenFor: (partnerId, messageId) => {
    const unseenCounts = { ...get().unseenCounts };
    const lastUnseenMessageId = { ...get().lastUnseenMessageId };

    // 1️⃣ decrement unseen count (never below 0)
    if (unseenCounts[partnerId] > 0) {
      unseenCounts[partnerId] -= 1;
      if (unseenCounts[partnerId] === 0) {
        delete unseenCounts[partnerId];
      }
    }

    // 2️⃣ clear last unseen marker if this message was it
    if (lastUnseenMessageId[partnerId] === messageId) {
      delete lastUnseenMessageId[partnerId];
    }

    // 3️⃣ update chats array
    const updatedChats = get().chats.map((c) =>
      c._id === partnerId
        ? { ...c, unseenCount: Math.max(0, (c.unseenCount || 0) - 1) }
        : c
    );

    set({
      unseenCounts,
      lastUnseenMessageId,
      chats: updatedChats,
    });
  },

  // --------------------- SOCKET MESSAGE LISTENER ---------------------
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

    const onNewMessage = (incoming) => {
      (async () => {
        try {
          console.log("[socket] newMessage received:", incoming);

          const newMessage = { ...incoming };

          // Normalize server message: cipherText is server.text
          newMessage.cipherText =
            newMessage.text ?? newMessage.cipherText ?? null;

          // attempt to decrypt to plainText (defensive)
          try {
            const decrypt = useCryptoStore.getState().decryptMessage;
            if (newMessage.type !== "video_call") {
              newMessage.plainText =
                (await decrypt(newMessage.cipherText)) ||
                newMessage.plainText ||
                "";
            } else {
              newMessage.plainText = newMessage.text ?? newMessage.cipherText;
            }
          } catch (e) {
            console.log("error in subscribe to message:", e);
            newMessage.plainText = newMessage.text || "";
          }

          // ignore duplicates
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
          const getUserInfo = async (id) => {
            if (typeof get().getUserFromCache === "function") {
              const u = get().getUserFromCache(id);
              if (u) return { fullName: u.fullName, profilePic: u.profilePic };
            }
            if (typeof get().fetchUserById === "function") {
              try {
                const u = await get().fetchUserById(id);
                if (u)
                  return { fullName: u.fullName, profilePic: u.profilePic };
              } catch (e) {
                console.warn("[chat store] fetchUserById failed for", id, e);
              }
            }
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
                  newMessage.plainText || (newMessage.image ? "📷 Image" : ""),
                lastMessageSender: senderId,
                lastMessageTime: newMessage.createdAt,
                plainText: newMessage.plainText ?? chat.plainText ?? "",
                cipherText: newMessage.cipherText ?? chat.cipherText ?? null,
                type: newMessage.type || null,
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
            const stubChat = {
              _id: partnerId,
              fullName: newMessage.senderName || "Loading...",
              profilePic: newMessage.senderProfilePic || "/avatar.png",
              lastMessageText:
                newMessage.text ||
                newMessage.plainText ||
                (newMessage.image ? "📷 Image" : ""),
              lastMessageSender: senderId,
              lastMessageTime: newMessage.createdAt,
              plainText: newMessage.plainText || "",
              cipherText: newMessage.cipherText || null,
              type: newMessage.type,
              unseenCount:
                (get().unseenCounts && get().unseenCounts[partnerId]) || 1,
            };
            finalChats = [stubChat, ...updatedChats];

            // asynchronously fetch full user info and replace the stub when we have it
            getUserInfo(partnerId)
              .then((info) => {
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
    const onTyping = ({ userId, isTyping }) => {
      try {
        const newTyping = { ...get().typingStatuses, [userId]: !!isTyping };
        set({ typingStatuses: newTyping });
        // console.log("[chat store] typing status updated", newTyping);
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

    const onDeleteMessage = ({ messageId, partnerId }) => {
      const chatId = normalizeId(partnerId);

      // 🔑 1️⃣ Capture deleted message BEFORE mutation
      const stateBefore = get();
      const deletedMsg =
        stateBefore.messagesCache?.[chatId]?.find(
          (m) => String(m._id) === String(messageId)
        ) ?? null;

      set((state) => {
        /* 2️⃣ Remove from open messages */
        const updatedMessages = state.messages.filter(
          (m) => String(m._id) !== String(messageId)
        );

        /* 3️⃣ Remove from cache */
        const prevCache = state.messagesCache?.[chatId] || [];
        const updatedCache = prevCache.filter(
          (m) => String(m._id) !== String(messageId)
        );

        /* 4️⃣ Decide last message source */
        const openMessages =
          normalizeId(state.selectedUser?._id) === chatId
            ? updatedMessages
            : [];

        const lastMsg = openMessages.at(-1) || updatedCache.at(-1) || null;

        /* 5️⃣ Update chats list SAFELY */
        const updatedChats = (state.chats || []).map((chat) => {
          if (normalizeId(chat._id) !== chatId) return chat;

          return {
            ...chat,
            lastMessageText: lastMsg
              ? lastMsg.plainText || (lastMsg.image ? "📷 Image" : "")
              : chat.lastMessageText || "No messages yet",
            lastMessageSender:
              lastMsg?.senderId ?? chat.lastMessageSender ?? null,
            lastMessageTime: lastMsg?.createdAt ?? chat.lastMessageTime ?? null,
            plainText: lastMsg?.plainText ?? chat.plainText ?? "",
            cipherText: lastMsg?.cipherText ?? chat.cipherText ?? null,
            type: lastMsg?.type ?? chat.type ?? null,
          };
        });

        return {
          messages: updatedMessages,
          messagesCache: {
            ...state.messagesCache,
            [chatId]: updatedCache,
          },
          chats: updatedChats,
        };
      });

      /* 6️⃣ unseen logic AFTER state update */
      const { authUser } = useAuthStore.getState();
      const authId = normalizeId(authUser?._id);

      const wasUnseen =
        deletedMsg &&
        normalizeId(deletedMsg.receiverId) === authId &&
        normalizeId(deletedMsg.senderId) !== authId;

      if (wasUnseen) {
        get().decrementUnseenFor(chatId, messageId);
      }
    };

    // socket.off("deleteMessage", onDeleteMessage);
    socket.off("deleteMessage", onDeleteMessage);

    socket.on("deleteMessage", ({ messageId, partnerId }) => {
      onDeleteMessage({ messageId, partnerId });
    });

    socket.on("deleteMessage", (data) => {
      console.log("DELETE EVENT", data);
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

  // inside useChatStore create(...) return object — add this method near _persistCacheToStorage

  /**
   * One-time migration:
   * - reads messagesCache_v1 from localStorage
   * - attempts to decrypt any cached messages that have cipherText/text but no plainText
   * - writes back updated cache and marks migration complete in localStorage
   *
   * Options:
   *  - batchSize: number of messages decrypted concurrently per tick (default 20)
   *  - progressCb: optional (done,total) callback to report progress
   *
   * Usage:
   *   useChatStore.getState().migrateDecryptCache({ batchSize: 20, progressCb: (done,total) => {} })
   */
  migrateDecryptCache: async ({ batchSize = 20, progressCb } = {}) => {
    try {
      const MIGRATION_FLAG = "messagesCache_v1_migrated_v1";
      if (localStorage.getItem(MIGRATION_FLAG)) {
        console.info("[migrateDecryptCache] already migrated");
        return { migrated: false, reason: "already_migrated" };
      }

      const raw = localStorage.getItem("messagesCache_v1");
      if (!raw) {
        console.info("[migrateDecryptCache] no messagesCache found");
        localStorage.setItem(MIGRATION_FLAG, "1");
        return { migrated: false, reason: "no_cache" };
      }

      let parsed;
      try {
        parsed = JSON.parse(raw);
      } catch (e) {
        console.warn("[migrateDecryptCache] invalid JSON, aborting", e);
        localStorage.setItem(MIGRATION_FLAG, "1");
        return { migrated: false, reason: "invalid_json" };
      }

      // flatten all messages into a list of { userId, index, msg } for processing
      const userIds = Object.keys(parsed || {});
      const items = [];
      for (const uid of userIds) {
        const list = Array.isArray(parsed[uid]) ? parsed[uid] : [];
        for (let i = 0; i < list.length; i++) {
          const m = list[i];
          // skip if plainText already present
          if (m && (m.plainText || m.plain_text || m.textPlain)) continue;
          // only attempt if we have a likely cipher field
          if (m && (m.cipherText || m.text)) {
            items.push({ userId: uid, index: i, msg: m });
          }
        }
      }

      if (items.length === 0) {
        console.info("[migrateDecryptCache] nothing to migrate");
        localStorage.setItem(MIGRATION_FLAG, "1");
        return { migrated: true, migratedCount: 0 };
      }

      console.info(
        `[migrateDecryptCache] will attempt to decrypt ${items.length} cached messages`
      );

      const decrypt = useCryptoStore.getState().decryptMessage;
      let done = 0;

      // Helper to update the parsed cache and persist intermittently
      const persistPartial = () => {
        try {
          localStorage.setItem("messagesCache_v1", JSON.stringify(parsed));
        } catch (e) {
          console.error("[migrateDecryptCache] persistPartial failed", e);
        }
      };

      // process in batches to avoid blocking the main thread for too long
      for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);

        // map to Promises (each tries to decrypt and writes into 'parsed')
        const promises = batch.map(async ({ userId, index, msg }) => {
          try {
            const cipher = msg.cipherText ?? msg.text ?? null;
            let pt = "";
            if (!cipher) return null;
            // decryptMessage returns string or null (defensive)
            if (msg.type !== "video_call") {
              pt = await decrypt(cipher);
            } else {
              pt = msg.text ?? msg.cipherText;
            }
            if (pt) {
              // write normalized field(s) back into parsed
              // ensure both plainText and plain_text variants for compatibility
              parsed[userId][index] = {
                ...parsed[userId][index],
                plainText: pt,
                plain_text: pt,
              };
              return true;
            }
          } catch (e) {
            // log and continue — don't throw
            console.warn(
              "[migrateDecryptCache] decrypt failed for message",
              { userId, index },
              e
            );
          }
          return null;
        });

        // wait for batch to complete
        await Promise.all(promises);

        // persist progress and notify
        done = Math.min(items.length, i + batchSize);
        persistPartial();
        if (typeof progressCb === "function") {
          try {
            progressCb(done, items.length);
          } catch (e) {
            console.log("error in migrate:", e);
            // ignore progress callback errors
          }
        }
        console.info(`[migrateDecryptCache] progress ${done}/${items.length}`);
        // slight yield to browser to keep UI responsive
        await new Promise((r) => setTimeout(r, 50));
      }

      // final persist
      try {
        localStorage.setItem("messagesCache_v1", JSON.stringify(parsed));
        localStorage.setItem(MIGRATION_FLAG, "1");
      } catch (e) {
        console.error("[migrateDecryptCache] final persist failed", e);
      }

      // update in-memory store so UI picks up the new plainText fields
      try {
        set({ messagesCache: parsed });
        // If the currently-open chat is present, set messages to updated cache
        const sel = get().selectedUser;
        if (sel && sel._id && Array.isArray(parsed[sel._id])) {
          set({ messages: parsed[sel._id] });
        }
      } catch (e) {
        console.warn(
          "[migrateDecryptCache] updating in-memory cache failed",
          e
        );
      }

      console.info("[migrateDecryptCache] done");
      return { migrated: true, migratedCount: items.length };
    } catch (err) {
      console.error("[migrateDecryptCache] unexpected error", err);
      return {
        migrated: false,
        reason: "unexpected_error",
        error: String(err),
      };
    }
  },

  deleteMessage: async (messageId, partnerId) => {
    try {
      await axiosInstance.delete(`/messages/delete/${messageId}`);

      set((state) => {
        const updatedMessages = state.messages.filter(
          (m) => m._id !== messageId
        );

        const lastMsg = updatedMessages
          .filter(
            (m) =>
              String(m.senderId) === String(partnerId) ||
              String(m.receiverId) === String(partnerId)
          )
          .slice(-1)[0];

        return {
          messages: updatedMessages,
          chats: state.chats.map((chat) =>
            String(chat._id) === String(partnerId)
              ? {
                  ...chat,
                  lastMessageText: lastMsg
                    ? lastMsg.plainText || (lastMsg.image ? "📷 Image" : "")
                    : "No messages yet",
                  lastMessageSender: lastMsg?.senderId || null,
                  lastMessageTime: lastMsg?.createdAt || null,
                  plainText: lastMsg?.plainText ?? "",
                  cipherText: lastMsg?.cipherText ?? null,
                  type: lastMsg?.type || null,
                }
              : chat
          ),
        };
      });
    } catch (err) {
      console.log(
        "Delete message failed:",
        err,
        err?.response?.data || err.message
      );
    }
  },
}));
