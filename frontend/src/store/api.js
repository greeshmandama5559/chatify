import { axiosInstance } from "../lib/axios";

export async function getStreamToken() {
  const response = await axiosInstance.get("/auth/stream-token");
  return response.data;
}