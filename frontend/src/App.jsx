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

  const ProtectedRoute = ({ children }) => {

    const {isAuthenticated, deleteUser, authUser } = useAuthStore();
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }

    if (!authUser.isVerified) {
      deleteUser(authUser._id);
      return <Navigate to="/signup" replace />
    }

    return children;
  };

  // redirect authenticated users to the home page
  const RedirectAuthenticatedUser = ({ children }) => {

    const {authUser, isAuthenticated } = useAuthStore();
    if (isAuthenticated && authUser?.isVerified) {
      return <Navigate to="/" replace />; 
    }

    return children;
  };

function App() {
  const { checkAuth, isCheckingAuth, isAuthenticated } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const socket = useAuthStore((s) => s.socket);
  const subscribeToMessages = useChatStore((s) => s.subscribeToMessages);

  useEffect(() => {
    if (!socket) return;
    subscribeToMessages();
  }, [socket, subscribeToMessages]);

  if (isCheckingAuth) return <PageLoader />;

  return (
    <div className="min-h-screen bg-slate-900 relative flex items-center justify-center overflow-hidden">
      {/* DECORATORS - GRID BG & GLOW SHAPES */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px]" />
      <div className="absolute top-0 -left-4 size-96 bg-pink-500 opacity-20 blur-[100px]" />
      <div className="absolute bottom-0 -right-4 size-96 bg-cyan-500 opacity-20 blur-[100px]" />

      <Routes>
        <Route
          index
          element={ 
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          }
        />

        <Route path="/verify-email" element={isAuthenticated ? <EmailVerification /> : <SignupPage />} />

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
					path='/reset-password/:token'
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
