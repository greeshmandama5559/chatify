// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { UserCircle, Zap, ArrowRight, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CompleteProfileCTA = ({ profilePic, completion = 0 }) => {
  const navigate = useNavigate();

  // Animation variants for the list items
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.3 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 },
  };

  return (
    <section className="relative w-full mt-10 md:mt-20 py-12 md:py-20 px-4 md:px-6 flex justify-center overflow-hidden">
      {/* Background Decorative Glow - Optimized for mobile */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-48 md:h-64 blur-[80px] md:blur-[100px] -z-10" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="
          relative
          w-screen md:w-full
          -mx-4 md:mx-0
          overflow-hidden
          rounded-none md:rounded-[3rem]
          backdrop-blur-2xl
          p-6 md:p-14
          shadow-none md:shadow-2xl
        "
      >
        {/* Animated Corner Gradient */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-bl from-cyan-500/20 to-transparent hidden md:block" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-12 items-center">
          {/* Content Side: Centered on mobile, Left-aligned on desktop */}
          <div className="space-y-6 text-center lg:text-left order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] md:text-xs font-bold uppercase tracking-widest">
              <Zap size={14} className="fill-current" /> Identity
            </div>

            <h2 className="text-3xl md:text-5xl font-black text-white leading-[1.1]">
              Ready to <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-cyan-400 via-blue-400 to-purple-500">
                Be Found?
              </span>
            </h2>

            <p className="text-slate-400 text-base md:text-lg leading-relaxed max-w-md mx-auto lg:mx-0">
              Your profile is your digital aura. Complete it to unlock AI
              matches that truly resonate with your soul.
            </p>

            <motion.ul
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="space-y-3 inline-block text-left"
            >
              {[
                "Upload a high-vibe profile picture",
                "Share your unique interests",
                "Write a bio that sparks conversation",
              ].map((text, i) => (
                <motion.li
                  key={i}
                  variants={itemVariants}
                  className="flex items-center gap-3 text-slate-300 text-sm md:text-base"
                >
                  <div className="shrink-0">
                    <CheckCircle2 size={18} className="text-cyan-400" />
                  </div>
                  {text}
                </motion.li>
              ))}
            </motion.ul>
          </div>

          {/* Visual Side: Visual pops more on mobile */}
          <div className="relative mt-8 md:mt-0 flex flex-col items-center justify-center space-y-8 order-1 lg:order-2">
            <div className="relative group">
              {/* Pulsing Outer Glow */}
              <div className="absolute inset-0 bg-linear-to-r from-cyan-500 to-purple-600 rounded-full blur-2xl opacity-20 group-hover:opacity-50 transition-opacity duration-700 animate-pulse" />

              {/* Avatar Ring */}
              <div className="relative flex justify-center items-center w-44 h-44 md:w-60 md:h-60 rounded-full border-2 border-dashed border-slate-700 p-2 group-hover:border-cyan-500/50 transition-colors duration-700">
                <div className="w-full h-full rounded-full bg-slate-800/80 flex items-center justify-center overflow-hidden ring-4 ring-slate-800 group-hover:ring-cyan-400/20 transition-all duration-700 shadow-inner">
                  {profilePic ? (
                    <img
                      src={profilePic}
                      alt="Profile"
                      className="w-full h-full object-cover rounded-full transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <UserCircle
                      size={100}
                      strokeWidth={1}
                      className="text-slate-600 group-hover:text-cyan-400 transition-colors duration-700"
                    />
                  )}
                </div>

                {/* Floating Completion Badge */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 20,
                    delay: 0.5,
                  }}
                  className="absolute -top-1 -right-1 md:top-2 md:right-2 bg-linear-to-br from-white to-slate-200 text-slate-900 px-3 py-1.5 md:px-4 md:py-2 rounded-2xl font-black text-[10px] md:text-sm shadow-xl flex items-center gap-1.5 border border-white"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                  </span>
                  {completion}% Complete
                </motion.div>
              </div>
            </div>

            {/* Main Action Button - Full width on mobile */}
            <button
              onClick={() => navigate("/profile")}
              className="group relative w-full max-w-60 md:max-w-sm overflow-hidden rounded-2xl p-px transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-cyan-500/10"
            >
              {/* Glowing Gradient Border */}
              <div className="absolute inset-0 bg-linear-to-r from-cyan-400 via-blue-500 to-purple-600 animate-[gradient_3s_linear_infinite]" />

              <div className="relative flex items-center justify-center gap-3 bg-slate-950 px-6 py-4 md:py-5 rounded-2xl group-hover:bg-transparent transition-colors duration-300">
                <span className="text-white font-bold text-base md:text-lg">
                  Complete My Profile
                </span>
                <ArrowRight
                  size={20}
                  className="text-cyan-400 group-hover:text-white group-hover:translate-x-1 transition-all"
                />
              </div>
            </button>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default CompleteProfileCTA;
