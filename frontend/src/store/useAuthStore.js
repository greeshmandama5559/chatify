import { create } from "zustand";
import { axiosInstace } from "../lib/axios";
import toast from "react-hot-toast";

export const useAuthStore = create((set) => ({
  authUser: null,
  isCheckingAuth: true,
  isSigningUp: false,

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
}));
