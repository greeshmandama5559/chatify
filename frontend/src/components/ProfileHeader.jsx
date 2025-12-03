import { useState, useRef } from "react";
import { LogOutIcon, VolumeOffIcon, Volume2Icon, CameraIcon } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";

const mouseClickSound = new Audio("/sounds/mouse-click.mp3");

function ProfileHeader() {
  const { logout, authUser, updateProfilePic } = useAuthStore();
  const { isSoundEnabled, toggleSound } = useChatStore();
  const [selectedImg, setSelectedImg] = useState(null);

  const fileInputRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onloadend = async () => {
      const base64Image = reader.result;
      setSelectedImg(base64Image);
      await updateProfilePic({ profilePic: base64Image });
    };
  };

  return (
    <div className="p-4 border-b border-slate-800 bg-slate-900/90 backdrop-blur-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* AVATAR */}
          <div className="relative">
            <button
              className="relative w-12 h-12 rounded-full overflow-hidden border border-slate-700 hover:border-cyan-500/50 transition-all duration-300 group"
              onClick={() => fileInputRef.current.click()}
            >
              <img
                src={selectedImg || authUser.profilePic || "/avatar.png"}
                alt="User image"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                <CameraIcon className="w-5 h-5 text-white/80" />
              </div>
            </button>
            
            {/* Online Status Dot */}
            <span className="absolute bottom-1 right-1 w-3 h-3 bg-green-500 border-2 border-slate-900 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>

            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>

          {/* USERNAME & ONLINE TEXT */}
          <div>
            <h3 className="text-slate-100 font-semibold text-base max-w-[160px] truncate tracking-wide">
              {authUser.fullName}
            </h3>
            <p className="text-cyan-500/80 text-xs mt-1 font-medium">Online</p>
          </div>
        </div>

        {/* BUTTONS */}
        <div className="flex gap-2 md:gap-0 items-center">
          {/* SOUND TOGGLE BTN */}
          <button
            className={`p-2 rounded-full transition-all duration-200 ${
              isSoundEnabled 
                ? "text-cyan-400 bg-cyan-900/10 hover:bg-cyan-900/20" 
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
            onClick={() => {
              mouseClickSound.currentTime = 0;
              mouseClickSound.play().catch((error) => console.log(error));
              toggleSound();
            }}
            title={isSoundEnabled ? "Mute sounds" : "Enable sounds"}
          >
            {isSoundEnabled ? <Volume2Icon className="size-4" /> : <VolumeOffIcon className="size-4" />}
          </button>

          {/* LOGOUT BTN */}
          <button
            className="p-2 rounded-full text-slate-400 hover:text-red-400 hover:bg-red-900/10 transition-all duration-200"
            onClick={logout}
            title="Logout"
          >
            <LogOutIcon className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
export default ProfileHeader;