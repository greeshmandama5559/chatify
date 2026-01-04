// SignUpPage.jsx
import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import BorderAnimatedContainer from "../components/BorderAnimatedContainer";
import { useNavigate, Link } from "react-router-dom";
import {
  MessageCircleIcon,
  LockIcon,
  UserIcon,
  EyeIcon,
  LoaderIcon,
  EyeOffIcon,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";

function SignUpPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    Password: "",
  });

  const [errors, setErrors] = useState({});

  const { signup, isSigningUp } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({}); // Clear previous errors

    if (formData.Password.length < 6) {
      setErrors({ Password: "Password must be at least 6 characters" });
      return;
    }

    if (formData.fullName.length < 3) {
      setErrors({ fullName: "name should be least 3 letters" });
    }

    try {
      const result = await signup(formData);
      if (result?.success) {
        toast.success("Account created successfully!");
        navigate("/complete-profile");
      } else if (!result?.success) {
        setErrors({ fullName: result?.error });
      }
    } catch (error) {
      console.error("Error during signup: ", error);
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#020617] relative overflow-hidden">
      {/* Creative Background Elements */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-size-[4rem_4rem] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 blur-[120px] rounded-full" />

      <div className="relative w-full max-w-5xl z-10">
        <BorderAnimatedContainer>
          <div className="w-full flex flex-col md:flex-row bg-slate-900/50 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/5">
            {/* Left Side: Form */}
            <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
              <div className="w-full max-w-md mx-auto">
                <div className="mb-10 w-full flex justify-center items-center flex-col text-center">
                  <div className="inline-flex items-center justify-center w-14 h-14">
                    <MessageCircleIcon className="w-12 h-12 text-slate-400" />
                  </div>
                  <h2 className="text-3xl font-bold text-white tracking-tight">
                    Create Account
                  </h2>
                  <p className="text-slate-400 mt-2">
                    Join our community and start chatting.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Full Name Input */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300 ml-1">
                      User Name
                    </label>
                    <div className="relative group mt-2">
                      <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            fullName: e.target.value,
                          });
                          setErrors((prev) => ({ ...prev, fullName: "" }));
                        }}
                        className={`w-full bg-slate-800/50 border ${
                          errors.fullName
                            ? "border-red-500/50"
                            : "border-slate-700"
                        } text-white rounded-xl py-3 px-10 outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/50 transition-all`}
                        placeholder="User Name"
                        required
                      />
                    </div>
                    {errors.fullName && (
                      <div className="flex items-center gap-1 text-red-400 text-xs mt-1 animate-in fade-in slide-in-from-top-1">
                        <AlertCircle className="w-3 h-3" /> {errors.fullName}
                      </div>
                    )}
                  </div>

                  {/* Password Input */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300 ml-1">
                      Password
                    </label>
                    <div className="relative group mt-2">
                      <LockIcon
                        className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-cyan-400 transition-colors`}
                      />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={formData.Password}
                        onChange={(e) =>
                          setFormData({ ...formData, Password: e.target.value })
                        }
                        className={`w-full bg-slate-800/50 border ${
                          errors.Password
                            ? "border-red-500/50"
                            : "border-slate-700"
                        } text-white rounded-xl py-3 px-10 outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/50 transition-all`}
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                      >
                        {showPassword ? (
                          <EyeOffIcon className="w-5 h-5" />
                        ) : (
                          <EyeIcon className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    {errors.Password && (
                      <div className="flex items-center gap-1 text-red-400 text-xs mt-1 animate-in fade-in slide-in-from-top-1">
                        <AlertCircle className="w-3 h-3" /> {errors.Password}
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isSigningUp}
                    className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-bold py-3 px-4 rounded-xl transition-all transform active:scale-[0.98] shadow-[0_0_20px_rgba(6,182,212,0.3)] mt-4"
                  >
                    {isSigningUp ? (
                      <LoaderIcon className="w-5 h-5 animate-spin mx-auto" />
                    ) : (
                      "Create Account"
                    )}
                  </button>
                </form>

                <p className="mt-8 text-center text-slate-400 text-sm">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
                  >
                    Log in
                  </Link>
                </p>
              </div>
            </div>

            {/* Right Side: Visuals */}
            <div className="hidden md:flex md:w-1/2 bg-slate-800/30 items-center justify-center p-12 relative overflow-hidden">
              <div className="absolute inset-0 bg-linear-to-br from-cyan-500/5 to-purple-500/5" />
              <div className="relative z-10 text-center">
                <div className="relative inline-block">
                  <div className="absolute -inset-4 bg-cyan-500/20 blur-2xl rounded-full animate-pulse" />
                  <img
                    src="/signup.png"
                    alt="Signup Illustration"
                    className="w-80 h-auto relative drop-shadow-[0_0_30px_rgba(6,182,212,0.2)]"
                  />
                </div>
                <h3 className="text-2xl font-bold text-white mt-10">
                  Start Your Journey Today
                </h3>
                <p className="text-slate-400 mt-3 max-w-xs mx-auto">
                  Experience the next generation of secure messaging and
                  collaboration.
                </p>

                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  {["Free", "Secure", "Fast"].map((tag) => (
                    <span
                      key={tag}
                      className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-slate-300 backdrop-blur-md"
                    >
                      {tag}
                    </span>
                  ))}
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
