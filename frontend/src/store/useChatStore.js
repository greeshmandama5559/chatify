import { create } from "zustand";
import { axiosInstace } from "../lib/axios";
import toast from "react-hot-toast";

export const useChatStore = create((set, get) => ({
  allContacts: [],
  chats: [],
  messages: [],
  activeTab: "chats",
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  isSoundEnabled: JSON.parse(localStorage.getItem("isSoundEnabled")) === true,

  toggleSound: () => {
    localStorage.setItem("isSoundEnabled", !get().isSoundEnabled);
    set({ isSoundEnabled: !get().isSoundEnabled });
  },

  setActiveTab: (tab) => {
    set({ activeTab: tab });
  },

  setSelectedUser: (selectedUser) => {
    set({selectedUser:selectedUser});
  },

  getAllContacts: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstace.get("/messages/contacts");
      set({ allContacts: res.data });
    } catch (error) {
      console.error("Error in loading contacts: " + error + "  " + error.response.data);
      toast.error(error.response.data.message)
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMyChatPartners: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstace.get("/messages/chats");
      set({ chats: res.data });
    } catch (error) {
      console.error("Error in loading chats: " + error + "  " + error.response.data);
      toast.error(error?.response?.data?.message)
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessagesByUserId: async (userId) => {
    set({isMessagesLoading:true});
    try {
      const res = await axiosInstace(`/messages/${userId}`);
      set({messages:res.data});
    } catch (error) {
      console.error("Error in get messages by user id:" + error + "  " + error?.response?.data)
      toast.error(error?.response?.data?.message || "Something Went Wrong")
    } finally{
      set({isMessagesLoading: false});
    }
  }

}));
