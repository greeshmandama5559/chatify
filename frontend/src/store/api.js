import { axiosInstance } from "../lib/axios";

export async function getStreamToken() {
  const response = await axiosInstance.get("/auth/stream-token");
  console.log("Fetched stream token:", response.data);
  return response.data;
}