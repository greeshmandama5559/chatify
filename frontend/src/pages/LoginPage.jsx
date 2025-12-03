import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import BorderAnimatedContainer from "../components/BorderAnimatedContainer";
import {
  MessageCircleIcon,
  LockIcon,
  MailIcon,
  UserIcon,
  LoaderIcon,
  EyeIcon,
  EyeOffIcon,
} from "lucide-react";
import { Link } from "react-router";

function LoginPage() {
  const [formData, setFormData] = useState({ 
    Email: "",
    Password: "",
  });
  const { login, isLoggingIn } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    login(formData);
  };
  return (
    <div className="w-full flex items-center justify-center p-4 md:p-10 bg-slate-900">
      <div className="relative w-full max-w-3xl md:max-w-5xl">
        <BorderAnimatedContainer>
          <div className="w-full flex flex-col md:flex-row ">
            <div className="md:w-1/2 px-10 py-13 md:py-12 md:px-15 flex items-center justify-center md:border-r border-slate-600/30">
              <div className="w-full max-w-md">
                <div className="text-center mb-10">
                  <MessageCircleIcon className="w-12 h-12 mx-auto text-slate-400 mb-4" />
                  <h2 className="text-2xl font-bold text-slate-200 mb-2">
                    Welcome Back
                  </h2>
                  <p className="text-slate-400">Login to your existing account</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-10">

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
                          setFormData({ ...formData, Password: e.target.value })
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
                    className="auth-btn md:mt-5"
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

                <div className="mt-6 text-center">
                  <Link to="/signup" className="auth-link">
                    Dont have an account? Signup
                  </Link>
                </div>
              </div>
            </div>

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