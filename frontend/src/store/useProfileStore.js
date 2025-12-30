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
  likedUsersForNotification: [],
  likesLoading: false,
  THREE_DAYS_MS: 3 * 24 * 60 * 60 * 1000,
  searchedUsers: [],
  query: "",
  uploading: false,
  uploadProgress: 0,
  likeLoading: false,

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
    set({ loading: true });
    try {
      if (!userId) {
        console.log("user not defined: ", userId);
        return;
      }
      const res = await axiosInstance.get(`/profile/${userId}/check`);
      set({ hasLiked: res.data.hasLiked });
    } catch (error) {
      console.log("error in like check:", error?.response?.data?.message);
    } finally {
      set({ loading: false });
    }
  },

  fetchLikesCount: async (userId) => {
    const res = await axiosInstance.get(`/profile/${userId}/likes-count`);
    set({ likesCount: res.data.likesCount });
  },

  likeProfile: async (userId) => {
    try {
      set({ hasLiked: true, likeLoading: true });

      useChatStore.setState((state) => {
        const updates = {};

        if (state.selectedprofileUser) {
          updates.selectedprofileUser = {
            ...state.selectedprofileUser,
            likesCount: (state.selectedprofileUser.likesCount || 0) + 1,
          };
        }

        if (state.selectedUser) {
          updates.selectedUser = {
            ...state.selectedUser,
            likesCount: (state.selectedUser.likesCount || 0) + 1,
          };
        }

        return updates;
      });

      await axiosInstance.post(`/profile/${userId}/like`);
    } catch (error) {
      console.log(
        "Error in like profile (frontend) : ",
        error?.response?.data?.message
      );
    } finally {
      set({ likeLoading: false });
    }
  },

  unlikeProfile: async (userId) => {
    try {
      set({ hasLiked: false, likeLoading: true });

      useChatStore.setState((state) => {
        const updates = {};

        if (state.selectedprofileUser) {
          updates.selectedprofileUser = {
            ...state.selectedprofileUser,
            likesCount: Math.max(
              (state.selectedprofileUser.likesCount || 1) - 1,
              0
            ),
          };
        }

        if (state.selectedUser) {
          updates.selectedUser = {
            ...state.selectedUser,
            likesCount: Math.max((state.selectedUser.likesCount || 1) - 1, 0),
          };
        }

        return updates;
      });

      await axiosInstance.delete(`/profile/${userId}/unlike`);
    } catch (error) {
      console.log(
        "Error in Unlike profile (frontend) : ",
        error?.response?.data?.message
      );
    } finally {
      set({ likeLoading: false });
    }
  },

  getMyLikesForNotification: async () => {
    set({ likesLoading: true });
    try {
      const res = await axiosInstance.get("/profile/likes/me");

      const now = Date.now();

      const recentLikes = res.data.filter((like) => {
        const likedTime = new Date(like.createdAt).getTime();
        return now - likedTime <= get().THREE_DAYS_MS;
      });

      set({ likedUsersForNotification: recentLikes });
    } catch (err) {
      console.log("Error fetching my likes:", err);
    } finally {
      set({ likesLoading: false });
    }
  },

  getMyLikes: async () => {
    set({ likesLoading: true });
    try {
      const res = await axiosInstance.get("/profile/likes/me");

      set({ likedUsers: res.data });
    } catch (err) {
      console.log("Error fetching my likes:", err);
    } finally {
      set({ likesLoading: false });
    }
  },

  uploadImage: async (formData) => {
    set({ uploading: true, uploadProgress: 0 });

    try {
      const res = await axiosInstance.put("/profile/upload-image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.lengthComputable) {
            const percent = Math.round(
              (progressEvent.loaded * 90) / progressEvent.total
            );
            set({ uploadProgress: percent });
          }
        },
      });

      set({ uploadProgress: 100 });

      useAuthStore.setState((state) => ({
        authUser: {
          ...state.authUser,
          gallery: res.data.gallery,
        },
      }));
    } finally {
      set({ uploading: false, uploadProgress: 0 });
    }
  },

  deleteImage: async (imageId) => {
    useAuthStore.setState((state) => ({
      authUser: {
        ...state.authUser,
        gallery: state.authUser.gallery.filter((img) => img._id !== imageId),
      },
    }));
    try {
      await axiosInstance.delete(`/profile/delete-image/${imageId}`);
    } catch (err) {
      console.error("Error deleting image:", err?.response?.data?.message);
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
