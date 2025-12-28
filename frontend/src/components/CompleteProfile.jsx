// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { UserCircle, Zap, ArrowRight, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CompleteProfileCTA = ({ profilePic, completion }) => {
  const navigate = useNavigate();

  return (
    <section className="relative w-full py-20 px-6 flex justify-center">
      {/* Background Decorative Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-64 bg-purple-600/10 blur-[100px] -z-10" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="relative w-full max-w-5xl overflow-hidden rounded-[3rem] border border-white/10 bg-slate-900/40 backdrop-blur-xl p-8 md:p-12 shadow-2xl"
      >
        {/* Animated Corner Gradient */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-bl from-cyan-500/20 to-transparent" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side: Content */}
          <div className="space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-wider">
              <Zap size={14} className="fill-current" /> Identity
            </div>

            <h2 className="text-3xl md:text-5xl font-black text-white leading-tight">
              Ready to <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-cyan-400 to-blue-500">
                Be Found?
              </span>
            </h2>

            <p className="text-slate-400 text-lg leading-relaxed max-w-md">
              Your profile is your digital aura. Complete it to unlock AI
              matches that truly resonate with your soul.
            </p>

            <ul className="space-y-3">
              {[
                "Upload a high-vibe profile picture",
                "Share your unique interests",
                "Write a bio that sparks conversation",
              ].map((text, i) => (
                <li
                  key={i}
                  className="flex items-center gap-3 text-slate-300 text-sm"
                >
                  <CheckCircle2 size={18} className="text-emerald-400" />
                  {text}
                </li>
              ))}
            </ul>
          </div>

          {/* Right Side: Visual & Button */}
          <div className="relative flex flex-col items-center justify-center space-y-8">
            {/* Visual Profile Mockup */}
            <div className="relative group">
              {/* Outer Glow */}
              <div className="absolute inset-0 bg-linear-to-r from-cyan-500 to-purple-600 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-500" />

              {/* Outer Circle */}
              <div className="relative flex justify-center items-center w-40 h-40 md:w-56 md:h-56 rounded-full border-2 border-dashed border-slate-700 p-2 group-hover:border-cyan-500/50 transition-colors duration-500">
                {/* Inner Avatar */}
                <div className="w-full h-full md:w-full md:h-full rounded-full bg-slate-800 flex items-center justify-center overflow-hidden ring-4 ring-slate-700/50 group-hover:ring-cyan-400/30 transition-all duration-500">
                  {profilePic ? (
                    <img
                      src={profilePic}
                      alt="Profile"
                      className="w-full h-full object-cover rounded-full transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <UserCircle
                      size={80}
                      className="text-slate-600 group-hover:text-cyan-400 transition-colors duration-500"
                    />
                  )}
                </div>

                {/* Floating Badge */}
                {/* Example: dynamic completion percentage */}
                <motion.div className="absolute -top-2 -right-2 bg-white text-slate-900 px-4 py-2 rounded-2xl font-black text-sm shadow-xl">
                  {completion}% Complete
                </motion.div>
              </div>
            </div>

            {/* Main Action Button */}
            <button className="group relative w-full max-w-sm overflow-hidden rounded-2xl p-px transition-transform active:scale-95">
              {/* Animated Border */}
              <div className="absolute inset-0 bg-linear-to-r from-cyan-500 via-blue-600 to-purple-600 animate-[gradient_3s_linear_infinite]" />

              <div
                onClick={() => navigate("/profile")}
                className="relative flex items-center justify-center gap-3 bg-slate-900 px-8 py-5 rounded-2xl group-hover:bg-slate-900/80 transition-colors"
              >
                <span className="text-white font-bold text-lg">
                  Complete My Profile
                </span>
                <ArrowRight className="text-cyan-400 group-hover:translate-x-2 transition-transform" />
              </div>
            </button>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default CompleteProfileCTA;
