import { User, Calendar, ShieldCheck, LogOut, ArrowRight } from "lucide-react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

function AccountInfoSection({ authUser, logout }) {
  return (
    <section className="bg-slate-900/40 backdrop-blur-2xl border border-white/5 rounded-4xl p-7 shadow-2xl overflow-hidden relative">
      {/* Decorative Glow */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/10 blur-[80px] rounded-full" />

      {/* Header */}
      <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2.5">
        <div className="p-2 bg-slate-800/50 rounded-lg shadow-inner">
          <User size={14} className="text-slate-400" />
        </div>
        Account Integrity
      </h3>

      <div className="space-y-5">
        {/* Member Since Row */}
        <div className="group flex items-center justify-between p-4 rounded-2xl bg-white/2 border border-transparent hover:border-white/5 hover:bg-white/4 transition-all duration-300">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400 group-hover:scale-110 transition-transform">
              <Calendar size={16} />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                Member Since
              </p>
              <p className="text-sm text-slate-200 font-medium">
                {authUser?.createdAt
                  ? new Date(authUser.createdAt).toLocaleDateString("en-US", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                  : "No Date Available"}
              </p>
            </div>
          </div>
        </div>

        {/* Account Status Row */}
        <div className="group flex items-center justify-between p-4 rounded-2xl bg-white/2 border border-transparent hover:border-white/5 hover:bg-white/4 transition-all duration-300">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400 group-hover:scale-110 transition-transform">
              <ShieldCheck size={16} />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                Verification
              </p>
              <div className="flex items-center gap-1.5">
                <p className="text-sm text-slate-200 font-medium tracking-tight">
                  Status Verified
                </p>
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
            </div>
          </div>
          <span className="text-[10px] font-bold text-emerald-500/80 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">
            PRO
          </span>
        </div>

        {/* Logout Button */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={logout}
          className="w-full mt-6 group relative flex items-center justify-center p-4 rounded-2xl bg-linear-to-r from-red-500/10 to-orange-500/5 border border-red-500/20 hover:border-red-500/40 transition-all overflow-hidden"
        >
          {/* Subtle button shine */}
          <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />

          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500 rounded-xl text-white shadow-lg shadow-red-900/40">
              <LogOut size={16} />
            </div>
            <span className="text-sm font-bold text-red-100">Sign Out</span>
          </div>

          {/* <ArrowRight
            size={16}
            className="text-red-500 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all"
          /> */}
        </motion.button>
      </div>
    </section>
  );
}

export default AccountInfoSection;
