import { Routes, Route, Navigate } from "react-router-dom";
import ChatPage from "./pages/ChatPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "./store/useAuthStore";
import { useEffect } from "react";
import PageLoader from "./components/PageLoader";
import { useChatStore } from "./store/useChatStore";
import CallPage from "./pages/CallPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import CompleteProfile from "./pages/CompleteProfile";
import Home from "./pages/Home";
import ProfilePage from "./pages/ProfilePage";
import DiscoverPage from "./pages/DiscoverPage";
import { useProfileStore } from "./store/useProfileStore";
import NotificationPage from "./pages/NotificationPage";
import SelectedUserProfile from "./pages/SelectedUserProfile";
import SimilarInteretsPage from "./pages/SimilarInteretsPage";
import ScrollToTop from "./components/ScrollToTop";
import DiscoverCreateAccount from "./components/DiscoverCreateAccount";
import ChatCreateProfile from "./components/ChatCreateProfile";
import LocationComponent from "./pages/Location";
import ProfileCreateAccount from "./components/ProfileCreateAcount";
import AvatarsPage from "./pages/AvatarsPage";
import { getStreamToken } from "./store/api";
import { useQuery } from "@tanstack/react-query";
import { streamClient } from "./utils/StreamClient";

const AuthGuard = ({ allow, children }) => {
  const { authStatus } = useAuthStore();

  if (!allow.includes(authStatus)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  const {
    checkAuth,
    isCheckingAuth,
    authUser,
    isAuthenticated,
    getSimilarInterestUsers,
    authStatus,
  } = useAuthStore();

  const socket = useAuthStore((s) => s.socket);
  const subscribeToMessages = useChatStore((s) => s.subscribeToMessages);

  const {
    hydrateFromServer,
    getAllContacts,
    getTrendingUsers,
    getMessagesByUserId,
    chats,
  } = useChatStore();

  const { subscribeToLike, getMyLikes, getMyLikesForNotification } =
    useProfileStore();


  //--------------on browser back button for chats----------------//
  useEffect(() => {
    const onBack = () => {
      const { setSelectedUser } = useChatStore.getState();
      setSelectedUser(null); // go back to chats
    };

    window.addEventListener("popstate", onBack);
    return () => window.removeEventListener("popstate", onBack);
  }, []);


  //--------------Check authentication of user----------------//
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);


  //--------------Get cache from localStorage----------------//
  useEffect(() => {
    useChatStore.getState().migrateDecryptCache();
  }, []);

  //--------------send message when new message is arrived----------------//
  useEffect(() => {
    if (authStatus !== "ready") return;
    if (!socket || !isAuthenticated || !authUser?.isVerified) return;

    subscribeToMessages();

    return () => {
      socket.off("newMessage");
    };
  }, [
    socket,
    isAuthenticated,
    authUser?.isVerified,
    subscribeToMessages,
    authStatus,
  ]);


  //--------------Notifies when someone likes the profile----------------//
  useEffect(() => {
    if (authStatus !== "ready") return;
    if (!socket) return;

    subscribeToLike();

    return () => {
      socket.off("profile:liked");
      socket.off("profile:unliked");
    };
  }, [authStatus, socket, subscribeToLike]);


  //--------------Get chats----------------//
  useEffect(() => {
    if (authStatus !== "ready") return;
    if (!isAuthenticated || !authUser?.isVerified) return;

    const hydrate = async () => {
      // await getMyChatPartners();
      await hydrateFromServer();
    };

    hydrate();
  }, [isAuthenticated, authUser?.isVerified, authStatus, hydrateFromServer]);


  //--------------Connect Video Call----------------//
  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser,
  });

  useEffect(() => {
    if (!authUser || !tokenData?.token || isAuthenticated) return;

    if (streamClient.userID) return; // already connected

    streamClient.connectUser(
      {
        id: authUser._id,
        name: authUser.fullName,
        image: authUser.profilePic,
      },
      tokenData.token
    );

    return () => {
      streamClient.disconnectUser();
    };
  }, [authUser, isAuthenticated, tokenData]);


  //--------------Get my Likes To show in profile page----------------//
  useEffect(() => {
    if (authStatus !== "ready") return;
    if (!isAuthenticated || !authUser?.isVerified) return;

    getMyLikes();
  }, [
    authStatus,
    authUser?.isVerified,
    getMyLikes,
    authUser?.likesCount,
    isAuthenticated,
  ]);


  //--------------Get Trending Users and get likes for notofication----------------//
  useEffect(() => {
    if (authStatus !== "ready") return;
    if (!isAuthenticated || !authUser?.isVerified) return;

    if (authUser?.likesCount !== undefined) {
      getMyLikesForNotification();
    }
    getTrendingUsers();
  }, [
    authStatus,
    authUser?.isVerified,
    authUser?.likesCount,
    getMyLikesForNotification,
    getTrendingUsers,
    isAuthenticated,
  ]);


  //--------------Get Similar Interest Users----------------//
  useEffect(() => {
    if (authStatus !== "ready") return;
    if (!isAuthenticated || !authUser?.isVerified) return;

    getSimilarInterestUsers();
  }, [
    authUser?.isVerified,
    authUser?.interests,
    getSimilarInterestUsers,
    isAuthenticated,
    authStatus,
  ]);


  //--------------get all users to show in discovery page and chats users tab----------------//
  useEffect(() => {
    if (authStatus !== "ready") return;
    if (!isAuthenticated || !authUser?.isVerified) return;

    getAllContacts();
  }, [authStatus, authUser?.isVerified, getAllContacts, isAuthenticated]);


  //--------------Prefetch messages of top 10 users in chatsList----------------//
  useEffect(() => {
    if (authStatus !== "ready") return;
    if (!isAuthenticated || !authUser?.isVerified) return;

    const prefetchTopChats = async () => {
      const topChats = chats.slice(0, 8);

      await Promise.allSettled(
        topChats.map((chat) => getMessagesByUserId(chat._id, { silent: true }))
      );
    };

    if (chats.length > 0) {
      prefetchTopChats();
    }
  }, [
    authStatus,
    authUser?.isVerified,
    chats,
    getMessagesByUserId,
    isAuthenticated,
  ]);

  //--------------Main routing code----------------//

  if (isCheckingAuth) return <PageLoader />;

  return (
    <div className="bg-slate-900 relative min-h-screen overflow-hidden flex justify-center items-center">
      {/* DECORATORS - GRID BG & GLOW SHAPES */}
      {/* <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px]" /> */}
      <div className="absolute top-0 -left-4 size-96 bg-pink-500 opacity-20 blur-[100px]" />
      <div className="absolute bottom-0 -right-4 size-96 bg-cyan-500 opacity-20 blur-[100px]" />

      <ScrollToTop />

      <Routes>
        {/* PUBLIC */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

        <Route path="/location" element={<LocationComponent />} />

        {/* AUTHENTICATED BUT NOT VERIFIED */}
        <Route
          path="/complete-profile"
          element={
            <AuthGuard allow={["verified"]}>
              <CompleteProfile />
            </AuthGuard>
          }
        />

        {/* FULL ACCESS */}
        <Route
          path="/chats"
          element={isAuthenticated ? <ChatPage /> : <ChatCreateProfile />}
        />

        <Route
          path="/chats/:chatId"
          element={
            <AuthGuard allow={["ready"]}>
              <ChatPage />
            </AuthGuard>
          }
        />

        <Route
          path="/avatars"
          element={isAuthenticated ? <AvatarsPage /> : <LoginPage />}
        />

        <Route
          path="/profile"
          element={isAuthenticated ? <ProfilePage /> : <ProfileCreateAccount />}
        />

        <Route
          path="/discover"
          element={
            isAuthenticated ? <DiscoverPage /> : <DiscoverCreateAccount />
          }
        />

        <Route
          path="/notifications"
          element={isAuthenticated ? <NotificationPage /> : <LoginPage />}
        />

        <Route
          path="/similar-interests"
          element={
            <AuthGuard allow={["ready"]}>
              <SimilarInteretsPage />
            </AuthGuard>
          }
        />

        <Route
          path="/user-profile"
          element={
            <AuthGuard allow={["ready"]}>
              <SelectedUserProfile />
            </AuthGuard>
          }
        />

        <Route
          path="/user-profile/:userId"
          element={
            <AuthGuard allow={["ready"]}>
              <SelectedUserProfile />
            </AuthGuard>
          }
        />

        <Route
          path="/call/:id"
          element={
            <AuthGuard allow={["ready"]}>
              <CallPage />
            </AuthGuard>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <Toaster position="top-center" />
    </div>
  );
}

export default App;
