import React from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";

function SentSeen({ seen }) {
  return (
    <AnimatePresence mode="wait">
      {seen ? (
        <motion.div
          key="seen"
          initial={{ opacity: 0, y: 6, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="flex justify-end items-center gap-2 -translate-y-4 text-cyan-400"
        >
          <span className="text-xs tracking-wide font-medium">Seen</span>
        </motion.div>
      ) : (
        <motion.div
          key="sent"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="flex justify-end items-center gap-2 -translate-y-5 text-slate-400"
        >
          <span className="text-xs tracking-wide">Sent</span>

          {/* Double dot sent indicator */}
          <div className="flex gap-1">
            <span className="w-2 h-2 rounded-full bg-slate-500" />
            <span className="w-2 h-2 rounded-full bg-slate-500/60" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default SentSeen;
