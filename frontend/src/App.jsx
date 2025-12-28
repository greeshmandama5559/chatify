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
import EmailVerification from "./pages/EmailVerification";
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

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return children;
};

const ProtectedLogRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const RedirectAuthenticatedUser = ({ children }) => {
  const { authUser, isAuthenticated } = useAuthStore();
  if (isAuthenticated && authUser?.isVerified) {
    return <Navigate to={import.meta.env.VITE_CLIENT_ORIGIN} replace />;
  }

  return children;
};

function App() {
  const { checkAuth, isCheckingAuth, authUser, isAuthenticated } =
    useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    const setVh = () => {
      document.documentElement.style.setProperty(
        "--vh",
        `${window.innerHeight * 0.01}px`
      );
    };

    setVh();
    window.addEventListener("resize", setVh);
    return () => window.removeEventListener("resize", setVh);
  }, []);

  useEffect(() => {
    const onBack = () => {
      const { setSelectedUser } = useChatStore.getState();
      setSelectedUser(null); // go back to chats
    };

    window.addEventListener("popstate", onBack);
    return () => window.removeEventListener("popstate", onBack);
  }, []);

  const socket = useAuthStore((s) => s.socket);
  const subscribeToMessages = useChatStore((s) => s.subscribeToMessages);

  useEffect(() => {
    if (!socket) return;
    subscribeToMessages();
  }, [socket, subscribeToMessages]);

  const { subscribeToLike, likeCheck } = useProfileStore();

  const { selectedUser } = useChatStore();

  useEffect(() => {
    if (!socket) return;

    subscribeToLike();

    return () => {
      socket.off("profile:liked");
      socket.off("profile:unliked");
    };
  }, [socket, subscribeToLike]);

  useEffect(() => {
    if (!isAuthenticated || !authUser?.isVerified) return;

    if (selectedUser?._id) {
      likeCheck(selectedUser?._id);
    }
  }, [authUser?.isVerified, isAuthenticated, likeCheck, selectedUser?._id]);

  const { getMyChatPartners, hydrateFromServer } = useChatStore();

  useEffect(() => {
    if (!isAuthenticated || !authUser?.isVerified) return;

    const hydrate = async () => {
      await getMyChatPartners();
      await hydrateFromServer();
    };

    hydrate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, authUser?.isVerified]);

  const { getMyLikes, getMyLikesForNotification } = useProfileStore();

  useEffect(() => {
    if (!isAuthenticated || !authUser?.isVerified) return;

    getMyLikes();
  }, [authUser?.isVerified, getMyLikes, isAuthenticated]);

  const { getAllContacts, getTrendingUsers } = useChatStore();

  useEffect(() => {
    if (!isAuthenticated || !authUser?.isVerified) return;

    if (authUser?.likesCount !== undefined) {
      getMyLikesForNotification();
    }
    getTrendingUsers();
  }, [
    authUser?.isVerified,
    authUser?.likesCount,
    getMyLikesForNotification,
    getTrendingUsers,
    isAuthenticated,
  ]);

  const { getSimilarInterestUsers } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated || !authUser?.isVerified) return;

    getSimilarInterestUsers();
  }, [
    authUser?.isVerified,
    authUser?.interests,
    getSimilarInterestUsers,
    isAuthenticated,
  ]);

  useEffect(() => {
    if (!isAuthenticated || !authUser?.isVerified) return;

    getAllContacts();
  }, [authUser?.isVerified, getAllContacts, isAuthenticated]);

  // useEffect(() => {
  //   if (!isAuthenticated || !authUser?.isVerified) return;

  //   getTrendingUsers();
  // }, [
  //   getTrendingUsers,
  //   authUser?.isVerified,
  //   isAuthenticated,
  //   authUser?.likesCount,
  // ]);

  if (isCheckingAuth) return <PageLoader />;

  return (
    <div className="bg-slate-900 relative min-h-screen overflow-hidden flex justify-center items-center">
      {/* DECORATORS - GRID BG & GLOW SHAPES */}
      {/* <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px]" /> */}
      <div className="absolute top-0 -left-4 size-96 bg-pink-500 opacity-20 blur-[100px]" />
      <div className="absolute bottom-0 -right-4 size-96 bg-cyan-500 opacity-20 blur-[100px]" />

      <ScrollToTop />

      <Routes>
        <Route
          path="/chats"
          element={
            <ProtectedLogRoute>
              <ChatPage />
            </ProtectedLogRoute>
          }
        />

        <Route
          path="/chats/:chatId"
          element={
            <ProtectedLogRoute>
              <ChatPage />
            </ProtectedLogRoute>
          }
        />

        <Route path="/" element={<Home />} />

        <Route
          path="/discover"
          element={
            <ProtectedLogRoute>
              <DiscoverPage />
            </ProtectedLogRoute>
          }
        />

        <Route
          path="/similar-interests"
          element={
            <ProtectedLogRoute>
              <SimilarInteretsPage />
            </ProtectedLogRoute>
          }
        />

        <Route
          path="/user-profile"
          element={
            <ProtectedLogRoute>
              <SelectedUserProfile />
            </ProtectedLogRoute>
          }
        />

        <Route
          path="/user-profile/:userId"
          element={
            <ProtectedLogRoute>
              <SelectedUserProfile />
            </ProtectedLogRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedLogRoute>
              <ProfilePage />
            </ProtectedLogRoute>
          }
        />

        <Route path="/verify-email" element={<EmailVerification />} />

        <Route path="/complete-profile" element={<CompleteProfile />} />

        <Route path="/notifications" element={<NotificationPage />} />

        <Route
          path="/signup"
          element={
            <RedirectAuthenticatedUser>
              <SignupPage />
            </RedirectAuthenticatedUser>
          }
        />
        <Route
          path="/login"
          element={
            <RedirectAuthenticatedUser>
              <LoginPage />
            </RedirectAuthenticatedUser>
          }
        />
        <Route
          path="/call/:id"
          element={
            <ProtectedRoute>
              <CallPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reset-password/:token"
          element={
            <RedirectAuthenticatedUser>
              <ResetPasswordPage />
            </RedirectAuthenticatedUser>
          }
        />
      </Routes>

      <Toaster position="top-center" />
    </div>
  );
}

export default App;
