import { useEffect, useRef, useState } from "react";
import {
  CameraIcon,
  Pencil,
  Check,
  X,
  Loader2,
  Mail,
} from "lucide-react";
import SideNavBar from "../components/SideNavBar";
import { useAuthStore } from "../store/useAuthStore";
import toast from "react-hot-toast";
import ActiveStatusSection from "../components/profile-components/ActiveStatusSection";
import AccountInfoSection from "../components/profile-components/AccountInfoSection";
import StatusPrivacySection from "../components/profile-components/StatusPrivacySection";

function ProfilePage() {
  const { authUser, updateProfilePic, updateProfileName, logout } = useAuthStore();

  const fileInputRef = useRef(null);
  const nameInputRef = useRef(null);

  const [selectedImg, setSelectedImg] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingName, setEditingName] = useState(authUser?.fullName || "");
  const [isSaving, setIsSaving] = useState(false);
  const [isActive, setIsActive] = useState(authUser?.isActive ?? true);

  const [bio, setBio] = useState(authUser?.bio || "");

  const [interests, setInterests] = useState(authUser?.interests || []);
  const [originalInterests, setOriginalInterests] = useState(
    authUser?.interests || []
  );

  useEffect(() => {
    setEditingName(authUser?.fullName || "");
    setIsActive(authUser?.isActive ?? true);
  }, [authUser]);

  useEffect(() => {
    setBio(authUser?.bio || "");
  }, [authUser]);

  useEffect(() => {
    if (isEditing && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [isEditing]);

  useEffect(() => {
    setInterests(authUser?.interests || []);
    setOriginalInterests(authUser?.interests || []);
  }, [authUser]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onloadend = async () => {
      try {
        setSelectedImg(reader.result);
        await updateProfilePic({ profilePic: reader.result });
        toast.success("Profile photo updated");
      } catch {
        toast.error("Failed to update photo");
      }
    };
  };

  const saveName = async () => {
    const trimmed = editingName.trim();
    if (trimmed.length < 2) {
      toast.error("Name must be at least 2 characters");
      return;
    }
    if (trimmed === authUser.fullName) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      await updateProfileName({ fullName: trimmed });
      toast.success("Name updated");
      setIsEditing(false);
    } catch {
      toast.error("Failed to update name");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="relative z-10 w-full flex bg-[#08090a] text-slate-200 overflow-y-auto scrollbar-hide">
      <SideNavBar />

      {/* Decorative background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
      </div>

      <main className="relative z-10 mx-auto pb-30 px-4 py-8 w-6xl overflow-y-auto scrollbar-hide">
        <div className="space-y-6">
          {/* PROFILE HEADER CARD */}
          <section className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl">
            <div className="flex flex-col items-center">
              {/* Avatar section */}
              <div className="relative group">
                <div className="p-1 rounded-full bg-linear-to-tr from-cyan-500 to-blue-600">
                  <img
                    src={selectedImg || authUser?.profilePic || "/avatar.png"}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover border-4 border-[#08090a]"
                  />
                </div>
                <button
                  onClick={() => fileInputRef.current.click()}
                  className="absolute bottom-1 right-1 bg-slate-800 hover:bg-slate-700 p-2.5 rounded-full border border-slate-700 transition-all shadow-lg"
                >
                  <CameraIcon size={18} className="text-cyan-400" />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  className="hidden"
                  accept="image/*"
                />
              </div>

              {/* Name & Email Section */}
              <div className="mt-6 text-center w-full">
                {!isEditing ? (
                  <div className="flex items-center justify-center gap-2 group">
                    <h1 className="text-3xl font-bold tracking-tight text-white">
                      {authUser?.fullName || "Unnamed User"}
                    </h1>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="opacity-100 p-1 ml-1 mt-2 text-slate-400 hover:text-cyan-400 transition"
                    >
                      <Pencil size={18} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2 max-w-sm mx-auto">
                    <input
                      ref={nameInputRef}
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="w-full bg-slate-800/50 border border-cyan-500/50 rounded-lg px-4 py-2 text-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                    />
                    <button
                      onClick={saveName}
                      disabled={isSaving}
                      className="p-2 text-green-400 hover:bg-green-400/10 rounded-lg"
                    >
                      {isSaving ? (
                        <Loader2 className="animate-spin" size={20} />
                      ) : (
                        <Check size={20} />
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setEditingName(authUser.fullName);
                        setIsEditing(false);
                      }}
                      className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg"
                    >
                      <X size={20} />
                    </button>
                  </div>
                )}

                <p className="flex items-center justify-center gap-2 text-slate-400 mt-2">
                  <Mail size={14} />
                  {authUser?.Email || "user@example.com"}
                </p>
              </div>
              <p className="text-md text-slate-400 mt-2">
                Your profile have {authUser.likesCount} likes
              </p>
            </div>
          </section>

          {/* ACCOUNT SETTINGS & STATS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Status & Privacy Section */}
            <StatusPrivacySection
              bio={bio}
              setBio={setBio}
              interests={interests}
              setInterests={setInterests}
              originalInterests={originalInterests}
              setOriginalInterests={setOriginalInterests}
            />

            {/* Account Information Section */}
            <AccountInfoSection authUser={authUser} logout={logout} />

            {/* Account status Section */}
            <ActiveStatusSection
              isActive={isActive}
              setIsActive={setIsActive}
            />
          </div>

          <section className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl">
          </section>

        </div>
      </main>
    </div>
  );
}

export default ProfilePage;
