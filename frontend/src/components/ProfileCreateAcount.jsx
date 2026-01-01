import React from "react";
import {
  Trophy,
  Sparkles,
  ArrowRight,
  Users,
  LockIcon,
  UserIcon,
  EyeIcon,
  LoaderIcon,
  EyeOffIcon,
  AlertCircle,
} from "lucide-react";
import SideNavBar from "./SideNavBar";
import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";


const avatars = [
  "/maleAavatars/male1.jpg",
  "/maleAavatars/male4.jpg",
  "/femaleAavatars/female2.jpg",
  "/femaleAavatars/female3.jpg",
];

const ProfileCreateAccount = () => {
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
    <div className="min-h-screen bg-[#0f172a] text-slate-200 flex items-center justify-center p-6 selection:bg-indigo-500/30">
      {/* Background Glow Effect */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px]"></div>
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px]"></div>
      </div>

      <div className="relative max-w-6xl mb-25 w-full grid lg:grid-cols-2 gap-12 items-center">
        {/* Left Side: The "Why" */}
        <div className="space-y-8">
          <div className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/20 px-4 py-2 rounded-full">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">
              Your Journey Starts Here
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl font-extrabold text-white leading-tight">
            Unlock your <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-400 to-cyan-400">
              True Potential.
            </span>
          </h1>

          <p className="text-lg text-slate-400 max-w-md">
            Join 10,000+ achievers tracking their progress, hitting milestones,
            and reaching the top of the leaderboard.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
            <div className="flex items-center space-x-4 group">
              <div className="p-3 bg-slate-800 rounded-xl group-hover:bg-indigo-600 transition-colors">
                <Users className="w-6 h-6 text-indigo-400 group-hover:text-white" />
              </div>
              <span className="font-medium">Match with Users</span>
            </div>
            <div className="flex items-center space-x-4 group">
              <div className="p-3 bg-slate-800 rounded-xl group-hover:bg-blue-600 transition-colors">
                <Trophy className="w-6 h-6 text-blue-400 group-hover:text-white" />
              </div>
              <span className="font-medium">Be The One In Top 3</span>
            </div>
          </div>
        </div>

        {/* Right Side: The Form Card */}
        <div className="relative">
          {/* Glass Card */}
          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-8 md:p-10 rounded-3xl shadow-2xl relative z-10">
            <h2 className="text-2xl font-bold text-white mb-2">
              Create your profile
            </h2>
            <p className="text-slate-500 mb-8">
              It only takes 30 seconds to level up.
            </p>

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
                      errors.fullName ? "border-red-500/50" : "border-slate-700"
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
                      errors.Password ? "border-red-500/50" : "border-slate-700"
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
                className="w-full bg-linear-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-500/20 flex items-center justify-center group transition-all"
              >
                {isSigningUp ? (
                  <LoaderIcon className="w-5 h-5 animate-spin mx-auto" />
                ) : (
                  <div className="flex justify-center items-center">
                    Get Started
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                )}
              </button>
            </form>

            <div className="mt-8 flex justify-center space-x-6">
              <div className="flex -space-x-2">
                {avatars.map((image, i) => (
                  <img
                    key={i}
                    className="w-8 h-8 rounded-full border-2 border-slate-900"
                    src={image}
                    alt="User"
                  />
                ))}
              </div>
              <p className="text-sm text-slate-500 flex items-center">
                Join the elite circle
              </p>
            </div>
          </div>

          {/* Abstract background shape for the card */}
          <div className="absolute -bottom-6 -right-6 w-full h-full bg-indigo-600/10 rounded-3xl z-0"></div>
        </div>
      </div>
      <SideNavBar />
    </div>
  );
};

export default ProfileCreateAccount;
