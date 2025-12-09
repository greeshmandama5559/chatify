import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import BorderAnimatedContainer from "../components/BorderAnimatedContainer";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
// import { Navigate } from "react-router";
import {
  MessageCircleIcon,
  LockIcon,
  MailIcon,
  Mail,
  LoaderIcon,
  EyeIcon,
  EyeOffIcon,
  LockKeyhole,
} from "lucide-react";
import { Link } from "react-router-dom";

function LoginPage() {
  const [formData, setFormData] = useState({
    Email: "",
    Password: "",
  });
  const { login, isLoggingIn, sendResetPasswordMail, isLoading, error } =
    useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(formData);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    await sendResetPasswordMail(formData);
    setIsSubmitted(true);
  };

  return (
    <div className="w-full h-full overflow-hidden flex items-center justify-center p-4 md:p-10 bg-slate-900">
      <div className="relative w-full max-w-3xl mb-15 md:max-w-5xl">
        <BorderAnimatedContainer>
          <div className="w-full flex flex-col md:flex-row ">
            {!isChangingPassword && (
              <div className="md:w-1/2 px-10 py-10 md:py-8 md:px-15 flex items-center justify-center md:border-r border-slate-600/30">
                <div className="w-full max-w-md">
                  <div className="text-center mb-10">
                    <MessageCircleIcon className="w-12 h-12 mx-auto text-slate-400 mb-4" />
                    <h2 className="text-2xl font-bold text-slate-200 mb-2">
                      Welcome Back
                    </h2>
                    <p className="text-slate-400">
                      Login to your existing account
                    </p>
                  </div>

                  <form
                    onSubmit={handleSubmit}
                    className=" space-y-3 md:space-y-5"
                  >
                    <div>
                      <label className="auth-input-label">Email</label>
                      <div className="relative">
                        <MailIcon className="auth-input-icon" />
                        <input
                          type="email"
                          value={formData.Email}
                          onChange={(e) =>
                            setFormData({ ...formData, Email: e.target.value })
                          }
                          className="input"
                          placeholder="Enter your Email"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="auth-input-label">Password</label>
                      <div className="relative">
                        <LockIcon className="auth-input-icon" />
                        <input
                          type={showPassword ? "text" : "password"}
                          value={formData.Password}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              Password: e.target.value,
                            })
                          }
                          className="input"
                          placeholder="Enter your password"
                          required
                        />

                        {showPassword ? (
                          <EyeOffIcon
                            className="eye-btn pointer-events-auto z-20"
                            onClick={() => setShowPassword(false)}
                          />
                        ) : (
                          <EyeIcon
                            className="eye-btn pointer-events-auto z-20"
                            onClick={() => setShowPassword(true)}
                          />
                        )}
                      </div>
                      <div className="flex items-center mt-1">
                        <span
                          className="text-cyan-400 hover:underline cursor-pointer"
                          onClick={() => setIsChangingPassword(true)}
                        >
                          Forgot Password?
                        </span>
                      </div>
                    </div>

                    <button
                      className="auth-btn mt-2"
                      type="submit"
                      disabled={isLoggingIn}
                    >
                      {isLoggingIn ? (
                        <LoaderIcon className="w-full h-5 animate-spin text-center" />
                      ) : (
                        "Login"
                      )}
                    </button>
                  </form>

                  <div className="mt-4">
                    <div className="flex items-center w-full gap-4 my-4">
                      <div className="flex-1 h-px bg-slate-600/40"></div>
                      <span className="text-slate-400 text-sm font-medium">
                        OR
                      </span>
                      <div className="flex-1 h-px bg-slate-600/40"></div>
                    </div>

                    <button
                      onClick={() =>
                        (window.location.href =
                          `${import.meta.env.REACT_APP_BACKEND_URL}/api/auth/google`)
                      }
                      type="button"
                      className="w-full flex items-center justify-center gap-3 py-3 bg-white/90 hover:bg-white 
               text-slate-900 font-medium border border-slate-300 rounded-xl shadow-sm opacity-90 cursor-pointer
               transition-all duration-200 hover:shadow-md hover:opacity-100 active:scale-[0.98] "
                    >
                      <img
                        src="/google-icon.png"
                        alt="Google icon"
                        className="w-5 h-5"
                      />
                      Continue with Google
                    </button>
                  </div>

                  <div className="mt-6 text-center">
                    <Link to="/signup" className="auth-link">
                      Dont have an account? Signup
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {isChangingPassword && (
              <div className="md:w-1/2 px-10 py-13 md:py-12 md:px-15 flex items-center justify-center md:border-r border-slate-600/30">
                <div className="w-full max-w-md">
                  <div className="text-center mb-10">
                    <LockKeyhole className="w-12 h-12 mx-auto text-slate-400 mb-4" />
                    <h2 className="text-2xl font-bold text-slate-200 mb-2">
                      Email Verification
                    </h2>
                    <p className="text-slate-400">
                      Enter your Email for Verification
                    </p>
                  </div>

                  {!isSubmitted || error ? (
                    <form onSubmit={handlePasswordChange} className="space-y-0">
                      <div>
                        <label className="auth-input-label">Email</label>
                        <div className="relative">
                          <MailIcon className="auth-input-icon" />
                          <input
                            type="email"
                            value={formData.Email}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                Email: e.target.value,
                              })
                            }
                            className="input"
                            placeholder="Enter your Email"
                            required
                          />
                        </div>
                      </div>

                      {error && (
                        <p className="text-red-500 mt-2 font-semibold">
                          {error}
                        </p>
                      )}

                      <div className="flex justify-center items-center w-full h-full">
                        <button
                          className="auth-btn mt-10 max-w-50"
                          type="submit"
                          disabled={isLoggingIn}
                        >
                          {isLoading ? (
                            <LoaderIcon className="w-full h-5 animate-spin text-center" />
                          ) : (
                            "send verification link"
                          )}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="text-center">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 30,
                        }}
                        className="w-16 h-16 bg-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4"
                      >
                        <Mail className="h-8 w-8 text-white" />
                      </motion.div>
                      <p className="text-gray-300 mb-6">
                        If an account exists for {formData.Email}, you will
                        receive a password reset link shortly.
                      </p>
                    </div>
                  )}

                  <div
                    className="mt-10 text-center "
                    onClick={() => setIsChangingPassword(false)}
                  >
                    <Link to="/login" className="auth-link">
                      back to login
                    </Link>
                  </div>
                </div>
              </div>
            )}

            <div className="hidden md:w-1/2 md:flex items-center justify-center p-10 bg-gradient-to-bl from-slate-800/20 to-transparent">
              <div>
                <img
                  src="/login.png"
                  alt="Signup Illustration"
                  className="w-full h-auto"
                />
                <div className="mt-6 text-center">
                  <h3 className="text-xl font-medium text-cyan-400">
                    Connect any time anywhere
                  </h3>
                  <div className="mt-4 flex justify-center gap-4">
                    <span className="auth-badge">Free</span>
                    <span className="auth-badge">Easy Setup</span>
                    <span className="auth-badge">Private</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </BorderAnimatedContainer>
      </div>
    </div>
  );
}

export default LoginPage;
