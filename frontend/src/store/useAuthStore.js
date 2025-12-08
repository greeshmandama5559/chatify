import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL =
  import.meta.env.MODE === "development" ? "http://localhost:3000/" : "/";

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
  pendingSignup: null,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data, isAuthenticated: true });
      if (!get().authUser || get().socket?.connected) return;
      get().connectSocket();
    } catch (error) {
      console.log(
        "Error in check Auth: ",
        error?.response ?? error?.message ?? error
      );
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);

      set({
        pendingSignup: {
          Email: data.Email,
          fullName: data.fullName || null,
        },
        error: null,
      });

      toast.success(res?.data?.message || "OTP sent to your email");

      return { success: true };
    } catch (error) {
      if (error?.response?.data?.message) {
        toast.error(error.response.data.message);
        set({ error: error.response.data.message });
        console.log("Error in signup page: ", error.response.data);
      } else if (error?.message) {
        toast.error(error.message);
        console.log("Error in signup page (network/CORS): ", error);
      } else {
        toast.error("An unknown error occurred");
        console.log("Error in signup page (unknown): ", error);
      }
      return {
        success: false,
        error: error?.response?.data?.message || error?.message,
      };
    } finally {
      set({ isSigningUp: false });
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

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data, isAuthenticated: true });

      toast.success("successfully logged in");

      get().connectSocket();
    } catch (error) {
      if (error?.response?.data?.message) {
        toast.error(error.response.data.message);
        console.log("Error in login page: ", error.response.data);
      } else if (error?.message) {
        toast.error(error.message);
        console.log("Error in login page (network/CORS): ", error);
      } else {
        toast.error("An unknown error occurred");
        console.log("Error in login page (unknown): ", error);
      }
    } finally {
      set({ isLoggingIn: false });
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
    console.log("token in reset auth: ", token);
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
      await axiosInstance.post("/auth/logout");
      set({ authUser: null, isAuthenticated: false });
      get().disconnectSocket();
      toast.success("Logout successfull");
    } catch (error) {
      console.log("Logout Error: " + error);
      toast.error("Logout Failed, Try later");
    }
  },

  updateProfilePic: async (profilePic) => {
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
    }
  },

  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;

    const socket = io(BASE_URL, {
      withCredentials: true, // ensures cookies sent
    });

    socket.connect();

    set({ socket: socket });

    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });
  },

  disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect();
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
}));
