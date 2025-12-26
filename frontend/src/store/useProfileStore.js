import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";
import { useChatStore } from "./useChatStore";

export const useProfileStore = create((set, get) => ({
  isVisitingProfile: false,
  likesCount: 0,
  hasLiked: false,
  loading: false,
  searchUsersLoading: false,
  hasNewNotification: false,
  likedUsers: [],
  likesLoading: false,
  THREE_DAYS_MS: 3 * 24 * 60 * 60 * 1000,
  searchedUsers: [],
  query: "",

  setQuery: (que) => {
    set({ query: que });
  },

  setIsVisitingProfile: (res) => {
    set({ isVisitingProfile: res });
  },

  setHasNewNotification: async (isSeen) => {
    try {
      
      useAuthStore.setState((state) => ({
        authUser: {
          ...state.authUser,
          hasNewNotification: isSeen,
        },
      }));

      await axiosInstance.put("/profile/seen-notification", {
        isSeen,
      });
    } catch (error) {
      console.log("error in has new notification:", error);
    }
  },

  likeCheck: async (userId) => {
    if (!userId) {
      console.log("user not defined: ", userId);
      return;
    }
    const res = await axiosInstance.get(`/profile/${userId}/check`);
    set({ hasLiked: res.data.hasLiked });
    console.log("hasliked: ", get().hasLiked, ":  ", res.data.hasLiked);
  },

  fetchLikesCount: async (userId) => {
    const res = await axiosInstance.get(`/profile/${userId}/likes-count`);
    set({ likesCount: res.data.likesCount });
  },

  likeProfile: async (userId) => {
    set({ loading: true });
    try {
      await axiosInstance.post(`/profile/${userId}/like`);

      set({ hasLiked: true });

      useChatStore.setState((state) => ({
        selectedUser: {
          ...state.selectedUser,
          likesCount: (state.selectedUser.likesCount || 0) + 1,
        },
      }));
    } catch (error) {
      console.log(
        "Error in like profile (frontend) : ",
        error?.response?.data?.message
      );
    } finally {
      set({ loading: false });
    }
  },

  unlikeProfile: async (userId) => {
    set({ loading: true });
    try {
      await axiosInstance.delete(`/profile/${userId}/unlike`);

      set({ hasLiked: false });

      useChatStore.setState((state) => ({
        selectedUser: {
          ...state.selectedUser,
          likesCount: Math.max((state.selectedUser.likesCount || 1) - 1, 0),
        },
      }));
    } catch (error) {
      console.log(
        "Error in like profile (frontend) : ",
        error?.response?.data?.message
      );
    } finally {
      set({ loading: false });
    }
  },

  getMyLikes: async () => {
    set({ likesLoading: true });
    try {
      const res = await axiosInstance.get("/profile/likes/me");

      const now = Date.now();

      const recentLikes = res.data.filter((like) => {
        const likedTime = new Date(like.createdAt).getTime();
        return now - likedTime <= get().THREE_DAYS_MS;
      });

      set({ likedUsers: recentLikes });
    } catch (err) {
      console.log("Error fetching my likes:", err);
    } finally {
      set({ likesLoading: false });
    }
  },

  // getUserByName: async (userName) => {
  //   set({ loading: true });
  //   try {
  //     const res = await axiosInstance.get("/profile/search-user", {
  //       params: { userName },
  //     });

  //     set({ searchedUsers: res.data.users });

  //   } catch (error) {
  //     console.log("error in search by name:", error?.response?.data?.message);
  //   }finally {
  //     set({ loading: false });
  //   }
  // },

  getUserByName: async (userName) => {
    set({ searchUsersLoading: true });
    try {
      const contacts = useChatStore.getState().allContacts;

      const search = userName.trim().toLowerCase();

      const filtered = search
        ? contacts.filter((user) =>
            user.fullName.toLowerCase().includes(search)
          )
        : [];

      set({
        searchedUsers: filtered,
      });
    } catch (error) {
      console.log("error in search by name:", error);
    } finally {
      set({ searchUsersLoading: false });
    }
  },

  setSearchUsersNone: () => {
    set({ searchedUsers: [] });
  },

  subscribeToLike: () => {
    const socket = useAuthStore.getState().socket;
    const authUserId = useAuthStore.getState().authUser?._id;

    if (!socket || !authUserId) {
      console.log("no socket or authuser");
      return;
    }

    const onProfileLiked = async ({ likedBy }) => {
      if (likedBy === authUserId) {
        return;
      }

      useAuthStore.setState((state) => ({
        authUser: {
          ...state.authUser,
          likesCount: (state.authUser.likesCount || 0) + 1,
        },
      }));

      useAuthStore.setState((state) => ({
        authUser: {
          ...state.authUser,
          hasNewNotification: true,
        },
      }));
    };

    const onProfileUnliked = ({ likedBy }) => {
      if (likedBy === authUserId) return;

      useAuthStore.setState((state) => ({
        authUser: {
          ...state.authUser,
          likesCount: Math.max((state.authUser.likesCount || 1) - 1, 0),
        },
      }));

      useAuthStore.setState((state) => ({
        authUser: {
          ...state.authUser,
          hasNewNotification: false,
        },
      }));
    };

    socket.off("profile:liked", onProfileLiked);
    socket.off("profile:unliked", onProfileUnliked);

    socket.on("profile:liked", onProfileLiked);
    socket.on("profile:unliked", onProfileUnliked);
  },
}));
