import { create } from "zustand";
import { axiosInstace } from "../lib/axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL =
  import.meta.env.MODE === "development" ? "http://localhost:3000/" : "/";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isCheckingAuth: true,
  isSigningUp: false,
  isLoggingIn: false,
  socket: null,
  onlineUsers: [],

  checkAuth: async () => {
    try {
      const res = await axiosInstace.get("/auth/check");
      set({ authUser: res.data });
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
      const res = await axiosInstace.post("/auth/signup", data);
      set({ authUser: res.data });

      toast.success("Account created successfully");
      get().connectSocket();
    } catch (error) {
      if (error?.response?.data?.message) {
        toast.error(error.response.data.message);
        console.log("Error in signup page: ", error.response.data);
      } else if (error?.message) {
        // Network errors, CORS, etc
        toast.error(error.message);
        console.log("Error in signup page (network/CORS): ", error);
      } else {
        toast.error("An unknown error occurred");
        console.log("Error in signup page (unknown): ", error);
      }
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstace.post("/auth/login", data);
      set({ authUser: res.data });

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

  logout: async () => {
    try {
      await axiosInstace.post("/auth/logout");
      set({ authUser: null });
      get().disconnectSocket();
      toast.success("Logout successfull");
    } catch (error) {
      console.log("Logout Error: " + error);
      toast.error("Logout Failed, Try later");
    }
  },

  updateProfilePic: async (profilePic) => {
    try {
      const res = await axiosInstace.put("/auth/update-profile", profilePic);
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
}));
