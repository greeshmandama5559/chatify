import { create } from "zustand";
import { axiosInstace } from "../lib/axios";
import toast from "react-hot-toast";

export const useAuthStore = create((set) => ({
  authUser: null,
  isCheckingAuth: true,
  isSigningUp: false,
  isLoggingIn: false,

  checkAuth: async () => {
    try {
      const res = await axiosInstace.get("/auth/check");
      set({ authUser: res.data });
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
      toast.success("Logout successfull");
    } catch (error) {
      console.log("Logout Error: " + error);
      toast.error("Logout Failed, Try later");
    }
  },
}));
