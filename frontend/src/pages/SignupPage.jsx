// SignUpPage.jsx
import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import BorderAnimatedContainer from "../components/BorderAnimatedContainer";
import { useNavigate, Link } from "react-router-dom";
import {
  MessageCircleIcon,
  LockIcon,
  MailIcon,
  UserIcon,
  EyeIcon,
  LoaderIcon,
  EyeOffIcon,
} from "lucide-react";
import toast from "react-hot-toast";

function SignUpPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    Email: "",
    Password: "",
  });
  const { signup, isSigningUp } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.Password.length < 6) {
        return toast.error("Password Must Be least 6 characters");
      }

      const result = await signup(formData);
      if (result?.success) {
        localStorage.setItem("pendingEmail", formData.Email);
        navigate("/verify-email");
      }
    } catch (error) {
      console.error("Error during signup: ", error);
    }
  };

  return (
    <div className="w-full h-full overflow-hidden flex items-center justify-center p-4 bg-slate-900">
      <div className="relative w-full max-w-5xl md:h-[700px] h-full mb-15">
        <BorderAnimatedContainer>
          <div className="w-full flex flex-col md:flex-row ">
            <div className="md:w-1/2 p-8 md:px-13 flex items-center justify-center md:border-r border-slate-600/30">
              <div className="w-full max-w-md">
                <div className="text-center mb-8">
                  <MessageCircleIcon className="w-12 h-12 mx-auto text-slate-400 mb-4" />
                  <h2 className="text-2xl font-bold text-slate-200 mb-2">
                    Create Account
                  </h2>
                  <p className="text-slate-400">Sign up for a new account</p>
                </div>
                <form
                  onSubmit={handleSubmit}
                  className=" space-y-3 md:space-y-5"
                >
                  <div>
                    <label className="auth-input-label">Full Name</label>
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
                        className="input"
                        placeholder="Enter your Name"
                        required
                      />
                    </div>
                  </div>

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
                  </div>

                  <button
                    className="auth-btn mt-2"
                    type="submit"
                    disabled={isSigningUp}
                  >
                    {isSigningUp ? (
                      <LoaderIcon className="w-full h-5 animate-spin text-center" />
                    ) : (
                      "Create Account"
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
                        "http://localhost:3000/api/auth/google")
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
                  <Link to="/login" className="auth-link">
                    Already have an account? Login
                  </Link>
                </div>
              </div>
            </div>

            <div className="hidden md:w-1/2 md:flex items-center justify-center p-6 bg-gradient-to-bl from-slate-800/20 to-transparent">
              <div>
                <img
                  src="/signup.png"
                  alt="Signup Illustration"
                  className="w-full h-auto"
                />
                <div className="mt-6 text-center">
                  <h3 className="text-xl font-medium text-cyan-400">
                    Start Your Journey Today
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

export default SignUpPage;
