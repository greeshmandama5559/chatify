import React from 'react';
import { MessageCircle, ShieldCheck, Zap, Heart } from 'lucide-react'; // Optional: npm install lucide-react
import SideNavBar from './SideNavBar';
import { useNavigate } from 'react-router-dom';

const ChatCreateProfile = () => {
    const navigate = useNavigate();
  return (
    <div className="min-h-screen w-full bg-linear-to-br from-gray-700 via-gray-500 to-cyan-50 flex items-center justify-center p-4">
      <div className="max-w-5xl w-full grid md:grid-cols-2 mb-25 gap-8 items-center">
        
        {/* Left Side: Creative Visuals */}
        <div className="block relative">
          {/* Decorative Blur Blobs */}
          <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-cyan-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          
          <div className="relative space-y-4">
            {/* Simulated Chat Bubbles */}
            <div className="bg-white p-4 rounded-2xl shadow-lg border border-gray-100 max-w-xs transform -rotate-2 hover:rotate-0 transition-transform duration-500">
              <p className="text-gray-800 font-medium">"Hey! I saw your profile on the leaderboard. Want to collaborate?"</p>
              <span className="text-xs text-indigo-500 font-bold mt-2 block">Online Now</span>
            </div>

            <div className="bg-indigo-600 p-4 rounded-2xl shadow-xl max-w-xs ml-auto transform rotate-1">
              <p className="text-white font-medium">"Absolutely! Let's build something amazing together. 🚀"</p>
            </div>

            <div className="bg-white p-4 rounded-2xl shadow-lg border border-gray-100 max-w-xs transform -rotate-1">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-tr from-pink-500 to-yellow-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-bold text-gray-900">Alex Rivers</p>
                  <p className="text-xs text-gray-500">Just sent you a message</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Registration Card */}
        <div className="bg-white/80 backdrop-blur-lg p-8 md:p-12 rounded-3xl shadow-2xl border border-white flex flex-col">
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Talk to <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500">Anyone.</span>
            </h1>
            <p className="text-gray-600 mt-3 text-lg">
              Create a profile to unlock private messaging and find your perfect match.
            </p>
          </div>

          <div className="space-y-4">
            <button 
            onClick={() => navigate("/signup")}
            className="w-full flex items-center justify-center gap-3 bg-gray-900 hover:bg-black text-white font-bold py-4 px-6 rounded-2xl transition-all active:scale-95 shadow-lg">
              <MessageCircle size={20} />
              Start Chatting Now
            </button>
            
          </div>

          <div className=" grid grid-cols-3 gap-4 border-t border-gray-100 pt-8">
            <div className="text-center">
              <div className="bg-indigo-50 text-indigo-600 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2">
                <ShieldCheck size={18} />
              </div>
              <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Secure</p>
            </div>
            <div className="text-center">
              <div className="bg-cyan-50 text-cyan-600 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2">
                <Zap size={18} />
              </div>
              <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Instant</p>
            </div>
            <div className="text-center">
              <div className="bg-pink-50 text-pink-600 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2">
                <Heart size={18} />
              </div>
              <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Matched</p>
            </div>
          </div>

          <p className="mt-8 text-center text-sm text-gray-500">
            By joining, you agree to our <a href="#" className="underline hover:text-indigo-600">Terms of Service</a>
          </p>
        </div>

      </div>

      <SideNavBar />

    </div>
  );
};

export default ChatCreateProfile;