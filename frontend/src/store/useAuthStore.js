import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL = `${import.meta.env.VITE_BACKEN_URL}/`;

const getAuthStatus = (user) => {
  if (!user) return "guest";
  if (!user.isVerified) return "authenticated";
  if (!user.profileCompleted) return "verified";
  return "ready";
};

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isAuthenticated: false,
  isOtpVerifying: false,
  isCheckingAuth: true,
  isSigningUp: false,
  isLoggingIn: false,
  isLoading: false,
  socket: null,
  onlineUsers: [],
  error: null,
  similarInteretsUsers: [],
  authStatus: null,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");

      const user = res.data;
      set({
        authUser: user,
        authStatus: getAuthStatus(user),
        isCheckingAuth: false,
      });

      if (get().authStatus === "ready") {
        set({ isAuthenticated: true });
      }

      if (!get().authUser || get().socket) return;
      get().connectSocket();
    } catch (error) {
      console.log("Error in check Auth: ", error?.response?.data?.message);
      set({
        authUser: null,
        authStatus: "guest",
        isCheckingAuth: false,
      });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);

      localStorage.setItem("token", res.data.token);

      const user = res.data.user;

      set({
        authUser: user,
        authStatus: getAuthStatus(user),
      });

      return { success: true };
    } catch (error) {
      if (error?.response?.data?.message) {
        toast.error(error.response.data.message);
        set({ error: error.response.data.message });
        console.log("Error in signup page: ", error.response.data);
      }
      return {
        success: false,
        error: error?.response?.data?.message || error?.message,
      };
    } finally {
      set({ isSigningUp: false });
    }
  },

  completeProfile: async (data) => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.post("/auth/complete-profile", data);

      const user = res.data;

      set({
        authUser: user,
        authStatus: getAuthStatus(user),
      });

      return { success: true };
    } catch (error) {
      console.log(
        "error in complete profile: ",
        error?.response?.data?.message
      );
      const message = error?.response?.data?.message || "Profile update failed";
      set({ error: message });
      return { success: false, error: message };
    } finally {
      set({ isLoading: false });
    }
  },

  clearPendingSignup: () => set({ pendingSignup: null }),

  verifySignUpOtp: async (otp) => {
    set({ isOtpVerifying: true, error: null });
    try {
      const res = await axiosInstance.post("/auth/verify-email", { otp });

      // Backend should now create the real user and return it (plus set cookie)
      set({ authUser: res.data, isAuthenticated: true, pendingSignup: null });
      toast.success("Account created successfully");

      // ensure socket connects
      if (!get().authUser || get().socket?.connected) return { success: true };
      get().connectSocket();
      return { success: true };
    } catch (err) {
      console.error("Error in verifySignUpOtp: ", err);
      set({ error: err?.response?.data?.message || "Verification failed" });
      return {
        success: false,
        error: err?.response?.data?.message || err?.message,
      };
    } finally {
      set({ isOtpVerifying: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);

      localStorage.setItem("token", res.data.token);
      set({ authUser: res.data.user, isAuthenticated: true, authStatus: "ready" });

      get().connectSocket();
      return { success: true };
    } catch (error) {
      if (error?.response?.data?.message) {
        if (error?.response?.data?.error) {
          console.log("Error in login page: ", error.response.data);
          return;
        }
        return {
          fullName: error?.response?.data?.fullName,
          Password: error?.response?.data?.Password,
          message: error.response.data.message,
        };
      }
    } finally {
      set({ isLoggingIn: false });
    }
  },

  resendSignupOtp: async (email) => {
    set({ isLoading: true });
    try {
      const targetEmail = email || get().pendingSignup?.Email;
      if (!targetEmail) throw new Error("No email available to resend OTP");

      const res = await axiosInstance.post("/auth/resend-otp", {
        Email: targetEmail,
      });
      toast.success(res?.data?.message || "OTP resent");
      return { success: true };
    } catch (err) {
      console.error("resend OTP error:", err);
      toast.error(
        err?.response?.data?.message || err?.message || "Failed to resend OTP"
      );
      return {
        success: false,
        error: err?.response?.data?.message || err?.message,
      };
    } finally {
      set({ isLoading: false });
    }
  },

  sendResetPasswordMail: async (data) => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.post("/auth/forgot-password", data);
      set({ error: null });
      toast.success(res?.data?.message);
    } catch (err) {
      console.log("Error in sending reset password mail: ", err);
      set({ error: err.response?.data?.message });
    } finally {
      set({ isLoading: false });
    }
  },

  resetPassword: async (token, password) => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.post(`/auth/reset-password/${token}`, {
        Password: password,
      });
      toast.success(res?.data?.message || "password reset successfull");
    } catch (error) {
      console.log("error in update password: ", error?.response?.data?.message);
      toast.error(
        error?.response?.data?.message || "failed to update password"
      );
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    try {
      localStorage.removeItem("token");
      set({ authUser: null, isAuthenticated: false, authStatus: "guest" });
      get().disconnectSocket();
      toast.success("Logout successfull");
    } catch (error) {
      console.log("Logout Error: " + error);
      toast.error("Logout Failed, Try later");
    }
  },

  isUpdatingProfile: false,

  updateProfilePic: async (profilePic) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", profilePic);
      set({ authUser: res.data });
      toast.success("Profile updated");
    } catch (error) {
      console.error(
        "Error in update profile: ",
        error?.response?.data ?? error?.message ?? error
      );
      toast.error("Failed to update profile");
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  updateProfileName: async (fullName) => {
    try {
      const res = await axiosInstance.put(
        "/auth/update-profile-name",
        fullName
      );
      if (res.data.success) {
        set((state) => ({
          authUser: {
            ...state.authUser,
            fullName: res.data.fullName,
          },
        }));

        toast.success("Name Updated");
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        toast.error(error?.response?.data?.message);
      } else {
        toast.error("Failed to update name");
      }
    }
  },

  updateActiveStatus: async (isActive) => {
    try {
      const res = await axiosInstance.put("/auth/update-active-status", {
        isActive: isActive.isActive,
      });
      set((state) => ({
        authUser: { ...state.authUser, isActive: res.data.isActive },
      }));
    } catch (error) {
      console.log(
        "Error in update status (frontend):",
        error?.response?.data?.message
      );
    }
  },

  updateSeenStatus: async (isSeenOn) => {
    try {
      const res = await axiosInstance.put("/auth/update-seen-status", {
        isSeenOn: isSeenOn.isSeenOn,
      });
      set((state) => ({
        authUser: { ...state.authUser, isSeenOn: res.data.isSeenOn },
      }));
    } catch (error) {
      console.log(
        "Error in update status (frontend):",
        error?.response?.data?.message
      );
    }
  },

  updateBio: async (bio) => {
    try {
      const res = await axiosInstance.put("/auth/update-bio", {
        bio: bio.bio,
      });
      set((state) => ({
        authUser: {
          ...state.authUser,
          bio: res.data.bio,
        },
      }));
    } catch (error) {
      console.log(
        "Error in update bio (frontend):",
        error?.response?.data?.message
      );
    }
  },

  updateIntrests: async (interests) => {
    try {
      const res = await axiosInstance.put("/auth/update-intrests", {
        interests: interests.interests,
      });
      set((state) => ({
        authUser: {
          ...state.authUser,
          interests: res.data.interests,
        },
      }));
    } catch (error) {
      console.log(
        "Error in update intrests (frontend):",
        error?.response?.data?.message
      );
    }
  },

  connectSocket: () => {
    const { authUser, socket: existingSocket } = get();

    if (!authUser) return;
    if (existingSocket?.connected) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    const socket = io(BASE_URL, {
      auth: {
        token,
      },
    });

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
    });

    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    set({ socket });
  },

  disconnectSocket: () => {
    const socket = get().socket;
    if (socket) {
      socket.off();
      socket.disconnect();
    }
    set({ socket: null, onlineUsers: [] });
  },

  deleteUser: async (userId) => {
    try {
      const res = await axiosInstance(`/auth/delete-user/${userId}`);
      console.log("user deleted", res.data.message);
      set({ isAuthenticated: false });
      set({ authUser: null });
      toast.error("please signup again");
    } catch (error) {
      console.log("error in deleting user", error);
    }
  },

  getSimilarInterestUsers: async () => {
    try {
      const res = await axiosInstance.get("/auth/similar-interests");

      set({ similarInteretsUsers: res.data });
    } catch (error) {
      console.log(
        "error in get similar interests (frontend): ",
        error?.response?.data?.message
      );
    }
  },
}));
