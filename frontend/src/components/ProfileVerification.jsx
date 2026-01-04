import React from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, ArrowRight } from "lucide-react"; // Assuming you use lucide-react for icons

function ProfileVerification() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4">
      {/* Main Card */}
      <div className="max-w-md w-full bg-linear-to-bl from-cyan-500/20 to-transparent rounded-3xl shadow-xl shadow-slate-200/60 p-8 md:p-12 flex flex-col items-center">
        
        {/* Decorative Icon */}
        <div className="w-20 h-20 bg-cyan-100 rounded-full flex items-center justify-center mb-6 text-cyan-600">
          <ShieldCheck size={40} strokeWidth={1.5} />
        </div>

        {/* Text Content */}
        <h1 className="text-2xl md:text-3xl font-bold text-slate-300 mb-3">
          Verify your profile
        </h1>
        <p className="text-slate-500 text-center leading-relaxed mb-8">
          To access all features and ensure your account stays secure, please take a moment to complete your profile verification.
        </p>

        {/* Action Button */}
        <button
          onClick={() => navigate("/complete-profile")}
          className="group w-full flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
        >
          Complete Profile
          <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}

export default ProfileVerification;