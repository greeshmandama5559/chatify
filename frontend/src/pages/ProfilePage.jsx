import { useEffect, useRef, useState } from "react";
import { CameraIcon, Pencil, Check, X, Loader2, Mail } from "lucide-react";
import SideNavBar from "../components/SideNavBar";
import { useAuthStore } from "../store/useAuthStore";
import toast from "react-hot-toast";
import ActiveStatusSection from "../components/profile-components/ActiveStatusSection";
import AccountInfoSection from "../components/profile-components/AccountInfoSection";
import StatusPrivacySection from "../components/profile-components/StatusPrivacySection";
import ImageArea from "../components/profile-components/ImageArea";
import ProfileLikes from "../components/profile-components/ProfileLikes";
import { useProfileStore } from "../store/useProfileStore";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";

function ProfilePage() {
  const { authUser, updateProfilePic, updateProfileName, logout } =
    useAuthStore();

  const { likedUsers } = useProfileStore();

  const fileInputRef = useRef(null);
  const nameInputRef = useRef(null);

  const [selectedImg, setSelectedImg] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingName, setEditingName] = useState(authUser?.fullName || "");
  const [isSaving, setIsSaving] = useState(false);
  const [isActive, setIsActive] = useState(authUser?.isActive ?? true);
  const [isSeenOn, setIsSeenOn] = useState(authUser?.isSeenOn ?? true);

  const [bio, setBio] = useState(authUser?.bio || "");

  const [interests, setInterests] = useState(authUser?.interests || []);
  const [originalInterests, setOriginalInterests] = useState(
    authUser?.interests || []
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [modalSrc, setModalSrc] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setEditingName(authUser?.fullName || "");
    setIsActive(authUser?.isActive ?? true);
    setIsSeenOn(authUser?.isSeenOn ?? true);
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
      } catch {
        toast.error("Failed to update photo");
      }
    };
  };

  const openImageModal = (src) => {
    if (!src) return;
    setModalSrc(src);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalSrc(null);
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
      setIsEditing(false);
    } catch (error) {
      if (error?.response?.data?.message) {
        toast.error(error?.response?.data?.message);
      } else {
        toast.error("Failed to update name");
      }
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
          <section className="relative group bg-slate-900/40 backdrop-blur-2xl border border-white/10 rounded-4xl p-10 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] overflow-hidden">
            {/* Decorative Ambient Glows */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-cyan-500/10 blur-[80px] rounded-full" />
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-indigo-500/10 blur-[80px] rounded-full" />

            <div className="flex flex-col items-center relative z-10">
              {/* Avatar Section with Animated Ring */}
              <div className="relative group">
                <div className="w-36 h-36 md:w-40 md:h-40 rounded-full overflow-hidden">
                  <img
                    src={selectedImg || authUser?.profilePic || "/avatar.png"}
                    alt="Profile"
                    className="w-full h-full object-cover rounded-full cursor-pointer"
                    onClick={() => openImageModal(authUser?.profilePic)}
                  />
                </div>

                <button
                  onClick={() => fileInputRef.current.click()}
                  className="absolute bottom-1 right-1 bg-slate-800 hover:bg-slate-700 p-2.5 rounded-full border border-slate-700 transition-all shadow-lg"
                >
                  <CameraIcon size={18} className="text-cyan-400" />
                </button>

                {authUser?.gender === "female" && (
                  <div className="absolute top-0 left-2 -rotate-40 opacity-95">
                    <img src="/ribbon.png" alt="" className="w-12 h-12" />
                  </div>
                )}

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
                      onKeyDown={(e) => e.key === "Enter" && saveName()}
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
                <p className="mt-2 text-slate-500 font-medium tracking-widest uppercase text-xs">
                  Verified Member
                </p>
              </div>

              {/* Footer Section */}
              <div className="mt-5 justify-center items-center w-full pt-8 border-t border-white/5"></div>
              <ProfileLikes authUser={authUser} likedUsers={likedUsers} />
            </div>
          </section>

          {/* ACCOUNT SETTINGS & STATS GRID */}
          {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6"> */}
          <div className="flex flex-col gap-6">
            {/* Status & Privacy Section */}
            <StatusPrivacySection
              bio={bio}
              setBio={setBio}
              interests={interests}
              setInterests={setInterests}
              originalInterests={originalInterests}
              setOriginalInterests={setOriginalInterests}
            />

            <ImageArea
              modalOpen={modalOpen}
              openImageModal={openImageModal}
              setIsDeleting={setIsDeleting}
            />

            <div className="flex flex-col md:flex-row gap-8">
              {/* Account status Section */}
              <ActiveStatusSection
                isActive={isActive}
                isSeenOn={isSeenOn}
                setIsSeenOn={setIsSeenOn}
                setIsActive={setIsActive}
              />

              {/* Account Information Section */}
              <div className="flex-1 gap">
                <AccountInfoSection authUser={authUser} logout={logout} />
              </div>
            </div>
          </div>

          <AnimatePresence>
            {modalOpen && modalSrc && !isDeleting && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-100 flex items-center justify-center bg-black/70 p-4 md:p-10 backdrop-blur-md"
                onClick={closeModal}
              >
                <button
                  className="absolute md:hidden top-20 right-5 text-white/60 hover:text-white transition-colors z-110"
                  onClick={closeModal}
                >
                  <X size={36} />
                </button>

                <motion.img
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  src={modalSrc}
                  className="max-w-70 max-h-[85vh] md:max-w-full md:max-h-[90vh] object-contain rounded-xl shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

export default ProfilePage;
