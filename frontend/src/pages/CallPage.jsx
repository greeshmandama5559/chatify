import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router";
import { useAuthStore } from "../store/useAuthStore";
import { useQuery } from "@tanstack/react-query";
import { getStreamToken } from "../store/api";
// import PageLoader from "../components/PageLoader";
import VideoLoader from "../loaders/VideoCallLoader";
import { useNavigate } from "react-router";

import {
  StreamVideo,
  StreamVideoClient,
  StreamCall,
  CallControls,
  SpeakerLayout,
  StreamTheme,
  CallingState,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";

import "@stream-io/video-react-sdk/dist/css/styles.css";
import toast from "react-hot-toast";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const CallPage = () => {
  const { id: callId } = useParams();
  const [client, setClient] = useState(null);
  const [call, setCall] = useState(null);

  const clientRef = useRef(null);
  const callRef = useRef(null);
  const mountedRef = useRef(true);

  const { authUser } = useAuthStore();

  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser,
  });

  useEffect(() => {
    mountedRef.current = true;

    // guard: if already initialized, don't re-init (prevents double join)
    if (!tokenData?.token || !authUser || !callId) {
      return;
    }

    if (clientRef.current || callRef.current) {
      return;
    }
    let didCancel = false;

    const initcall = async () => {
      try {
        console.log("Initializing Stream Video Client...");

        const user = {
          id: String(authUser._id),
          name: authUser.fullName,
          image: authUser.profilePic,
        };

        // create client once and keep reference
        const videoClient = new StreamVideoClient({
          apiKey: STREAM_API_KEY,
          user,
          token: tokenData.token,
        });

        // create call instance
        const callInstance = videoClient.call("default", callId);

        // Attempt to join (create true if you want a new call)
        await callInstance.join({ create: true });

        if (didCancel || !mountedRef.current) {
          // if unmounted while joining, leave immediately
          try {
            await callInstance.leave();
          } catch (err) {
            console.warn("left call after cancel:", err);
          }
          return;
        }

        // store references (both ref and state so children can render)
        clientRef.current = videoClient;
        callRef.current = callInstance;
        setClient(videoClient);
        setCall(callInstance);

        console.log("Joined call successfully");
      } catch (error) {
        console.error("Error initializing call: ", error);
        toast.error("Failed to join the call. Please try again.");
        // If something failed, make sure we didn't leave a partially joined call around
        try {
          if (callRef.current) await callRef.current.leave();
        } catch (e) {
          console.warn("Error leaving after failed join:", e);
        }
        clientRef.current = null;
        callRef.current = null;
        setClient(null);
        setCall(null);
      }
    };

    initcall();

    return () => {
      mountedRef.current = false;
      didCancel = true;

      const doCleanup = async () => {
        try {
          if (callRef.current) {
            await callRef.current.leave();
          }
        } catch (err) {
          console.warn("Error while leaving call in cleanup:", err);
        } finally {
          callRef.current = null;
          clientRef.current = null;
          setCall(null);
          setClient(null);
        }
      };

      void doCleanup();
    };
  }, [tokenData, authUser, callId]);

  return (
    <div className="h-screen flex items-center justify-center">
      <div className="w-full max-w-5xl">
        {client && call ? (
          <StreamVideo client={client}>
            <StreamCall call={call}>
              <CallContent />
            </StreamCall>
          </StreamVideo>
        ) : (
            <VideoLoader />
        )}
      </div>
    </div>
  );
};

const CallContent = () => {
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();

  const navigate = useNavigate();

  if (callingState === CallingState.JOINING) return <VideoLoader />;

  if (callingState === CallingState.LEFT) {
    navigate("/");
    return null;
  }

  return (
    <StreamTheme>
      <SpeakerLayout />
      <CallControls />
    </StreamTheme>
  );
};

export default CallPage;
