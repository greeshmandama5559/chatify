import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import BorderAnimatedContainer from "../components/BorderAnimatedContainer";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
// import { Navigate } from "react-router";
import {
  MessageCircleIcon,
  LockIcon,
  UserIcon,
  LoaderIcon,
  EyeIcon,
  EyeOffIcon,
  AlertCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import PasswordChange from "../components/PasswordChange";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

function LoginPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    Password: "",
  });

  const navigate = useNavigate();

  const [errors, setErrors] = useState({});
  const { login, isLoggingIn } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    try {
      const result = await login(formData);
      if (result?.success) {
        toast.success("Login successfully!");
        navigate("/");
      } else if (result?.fullName) {
        setErrors({ fullName: result?.message });
      } else if (result?.Password) {
        setErrors({ Password: result?.message });
      }
    } catch (error) {
      console.error("Error during signup: ", error);
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="w-full h-full overflow-hidden flex items-center justify-center p-4 md:p-10 bg-slate-900">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-size-[4rem_4rem] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 blur-[120px] rounded-full" />
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
                      <label className="auth-input-label">User Name</label>
                      <div className="relative">
                        <UserIcon className="auth-input-icon" />
                        <input
                          type="text"
                          value={formData.fullName}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              fullName: e.target.value,
                            })
                          }
                          className={`w-full bg-slate-800/50 border ${
                            errors?.fullName
                              ? "border-red-500/50"
                              : "border-slate-700"
                          } text-white rounded-xl py-3 px-10 outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/50 transition-all`}
                          placeholder="Enter your UserName"
                          required
                        />
                      </div>
                      {errors?.fullName && (
                        <div className="flex items-center gap-1 text-red-400 text-xs mt-1 animate-in fade-in slide-in-from-top-1">
                          <AlertCircle className="w-3 h-3" /> {errors.fullName}
                        </div>
                      )}
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
                          className={`w-full bg-slate-800/50 border ${
                            errors?.Password
                              ? "border-red-500/50"
                              : "border-slate-700"
                          } text-white rounded-xl py-3 px-10 outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/50 transition-all`}
                          placeholder="••••••••"
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
                      {errors?.Password ? (
                        <div className="flex items-center gap-1 text-red-400 text-xs mt-1 animate-in fade-in slide-in-from-top-1">
                          <AlertCircle className="w-3 h-3" /> {errors.Password}
                        </div>
                      ) : (
                        <div className="flex items-center mt-1">
                          <span
                            className="text-cyan-400 hover:underline cursor-pointer"
                            onClick={() => setIsChangingPassword(true)}
                          >
                            Forgot Password?
                          </span>
                        </div>
                      )}
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

                  <p className="mt-8 text-center text-slate-400 text-sm">
                    Dont have an account?{" "}
                    <Link
                      to="/signup"
                      className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
                    >
                      sign up
                    </Link>
                  </p>
                </div>
              </div>
            )}

            {isChangingPassword && (
              <PasswordChange setIsChangingPassword={setIsChangingPassword} />
            )}

            <div className="hidden md:w-1/2 md:flex items-center justify-center p-10 bg-linear-to-bl from-slate-800/20 to-transparent">
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
