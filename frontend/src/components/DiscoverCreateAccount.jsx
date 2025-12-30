import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sparkles, Trophy, Rocket, ChevronRight, UserPlus } from "lucide-react"; // npm install lucide-react
import SideNavBar from "./SideNavBar";

const DiscoverCreateAccount = () => {
  const navigate = useNavigate();
  
  return (
    <div className="relative min-h-screen flex justify-center items-center w-full bg-[#0a0a0c] text-slate-200 pb-28 pt-5 px-4 overflow-hidden">
      
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/10 blur-[130px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-cyan-500/10 blur-[130px] rounded-full" />
      </div>

      {/* Main Container with Glassmorphism & Animated Border */}
      <div className="relative group max-w-5xl w-full bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row transition-all duration-500 hover:border-indigo-500/30">
        
        {/* Left Side: Value Proposition */}
        <div className="md:w-3/5 p-8 md:p-12 flex flex-col justify-center border-b md:border-b-0 md:border-r border-slate-800/50">
          <div className="inline-flex items-center space-x-2 bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase mb-6 w-fit">
            <Sparkles size={14} />
            <span>Join 5,000+ top users</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight mb-8">
            The Hub for <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-400 to-blue-500">
              High Achievers.
            </span>
          </h1>

          <ul className="space-y-8">
            {[
              { icon: <Sparkles className="text-yellow-400" />, title: "Find Your Interests", desc: "AI-curated content just for you." },
              { icon: <Trophy className="text-indigo-400" />, title: "Climb the Leaderboard", desc: "Compete with the world's best." },
              { icon: <Rocket className="text-cyan-400" />, title: "Unlock Perks", desc: "Exclusive badges and beta access." }
            ].map((item, idx) => (
              <li key={idx} className="flex items-start group/item">
                <div className="bg-slate-800/80 p-3 rounded-2xl mr-5 group-hover/item:scale-110 group-hover/item:bg-indigo-500/20 transition-all duration-300">
                  {item.icon}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white group-hover/item:text-indigo-300 transition-colors">{item.title}</h3>
                  <p className="text-slate-400 text-sm">{item.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Right Side: Action Area */}
        <div className="md:w-2/5 p-8 md:p-12 flex flex-col justify-center bg-slate-950/30 backdrop-blur-sm">
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-gradient-to-tr from-indigo-600 to-cyan-500 rounded-2xl rotate-12 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-500/20">
              <UserPlus className="text-white w-8 h-8 -rotate-12" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Ready to shine?</h2>
            <p className="text-slate-500">Your profile is your digital legacy.</p>
          </div>

          <button
            onClick={() => navigate("/signup")}
            className="group relative w-full bg-white text-slate-900 font-black py-4 px-6 rounded-2xl transition-all duration-300 transform active:scale-95 flex items-center justify-center space-x-2 overflow-hidden"
          >
            <span className="relative z-10">Create Account</span>
            <ChevronRight className="relative z-10 group-hover:translate-x-1 transition-transform" size={20} />
            {/* Shimmer effect on hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-shimmer" />
          </button>

          <div className="mt-8 flex items-center w-full opacity-50">
            <div className="grow border-t border-slate-700"></div>
            <span className="px-4 text-slate-500 text-xs font-bold tracking-widest">OR</span>
            <div className="grow border-t border-slate-700"></div>
          </div>

          <p className="mt-8 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-indigo-400 font-bold hover:text-indigo-300 hover:underline transition-all"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>

      <SideNavBar />

      {/* Tailwind Custom Animation Injection */}
      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 1.5s infinite;
        }
      `}</style>
    </div>
  );
};

export default DiscoverCreateAccount;