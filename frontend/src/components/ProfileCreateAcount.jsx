import React from "react";
import { Rocket, Trophy, Target, Sparkles, ArrowRight, Users } from "lucide-react";
import SideNavBar from "./SideNavBar";

const ProfileCreateAccount = () => {
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
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
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

            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="John Doe"
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="john@example.com"
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>

              <button className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-500/20 flex items-center justify-center group transition-all">
                Get Started
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>

            <div className="mt-8 flex justify-center space-x-6">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <img
                    key={i}
                    className="w-8 h-8 rounded-full border-2 border-slate-900"
                    src={`https://i.pravatar.cc/150?u=${i}`}
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
          <div className="absolute -bottom-6 -right-6 w-full h-full bg-indigo-600/10 rounded-3xl -z-0"></div>
        </div>
      </div>
      <SideNavBar />
    </div>
  );
};

export default ProfileCreateAccount;
