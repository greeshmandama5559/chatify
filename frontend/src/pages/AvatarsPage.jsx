import { useAuthStore } from "../store/useAuthStore";
import { useState } from "react";
import { CheckCircle2, X } from "lucide-react";
import SideNavBar from "../components/SideNavBar";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";

const maleAvatars = [
  "/maleAavatars/male1.jpg",
  "/maleAavatars/male2.jpg",
  "/maleAavatars/male3.jpg",
  "/maleAavatars/male4.jpg",
  "/maleAavatars/male5.jpg",
  "/maleAavatars/male6.jpg",
  "/maleAavatars/male7.jpg",
  "/maleAavatars/male8.jpg",
  "/maleAavatars/male9.jpg",
  "/maleAavatars/male10.jpg",
];
const femaleAvatars = [
  "/femaleAavatars/female1.jpg",
  "/femaleAavatars/female2.jpg",
  "/femaleAavatars/female3.jpg",
  "/femaleAavatars/female4.jpg",
  "/femaleAavatars/female5.jpg",
  "/femaleAavatars/female6.jpg",
  "/femaleAavatars/female7.jpg",
  "/femaleAavatars/female8.jpg",
  "/femaleAavatars/female9.jpg",
  "/femaleAavatars/female10.jpg",
];

function AvatarsPage() {
  const { authUser, isUpdatingProfile, updateProfilePic } = useAuthStore();
  const [imagePreview, setImagePreview] = useState(authUser?.profilePic);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalSrc, setModalSrc] = useState(null);

  const handleUpdate = async () => {
    if (!imagePreview) return;
    try {
      await updateProfilePic({ profilePic: imagePreview });
    } catch (error) {
      console.log("error in update profile avatar: ", error);
    }
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

  return (
    <div className="min-h-screen w-full bg-slate-900/40">
      <div className="absolute -top-24 -left-24 w-64 h-64 bg-indigo-600/20 rounded-full blur-[80px] group-hover:bg-indigo-600/30 transition-colors duration-700"></div>
      <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-emerald-600/10 rounded-full blur-[80px] group-hover:bg-emerald-600/20 transition-colors duration-700"></div>

      <div className="max-w-full mx-auto mb-20">
        {/* Main Profile Card */}
        <div className="rounded-3xl overflow-hidden transition-all">
          <div className="p-8 md:p-12">
            {/* Current Avatar Display */}
            {/* Fixed Current Avatar Display */}
            <div className="fixed top-0 left-0 right-0 z-50 bg-slate-900/40 shadow-xl backdrop-blur-xl">
              <div className="flex flex-col items-center py-6">
                <div className="relative group">
                  <div className="absolute -inset-1.5 bg-linear-to-r from-indigo-500 to-cyan-400 rounded-full group-hover:opacity-50 transition duration-1000"></div>

                  <div className="relative">
                    <img
                      src={
                        imagePreview || authUser?.profilePic || "/avatar.png"
                      }
                      onClick={() => {
                        openImageModal(imagePreview || authUser?.profilePic);
                      }}
                      alt="Current Avatar"
                      className="w-32 h-32 md:w-40 md:h-40 rounded-full cursor-pointer object-cover border-4 shadow-xl"
                    />
                  </div>
                </div>

                <h2 className="mt-4 text-xl font-semibold text-slate-300">
                  {authUser?.fullName}
                </h2>

                <div className="pt-6">
                  <button
                    disabled={!imagePreview || isUpdatingProfile}
                    onClick={handleUpdate}
                    className={`group flex items-center gap-2 px-8 py-4 rounded-2xl font-bold transition-all
          ${
            !imagePreview
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700 hover:scale-105 active:scale-95"
          }`}
                  >
                    {isUpdatingProfile ? "Updating..." : "Save"}
                    {!isUpdatingProfile && <CheckCircle2 size={20} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Selection Sections */}
            <div className="space-y-10 mt-70 md:mt-80 md:ml-20">
              {/* Male Section */}
              <section>
                <div className="flex items-center gap-2 mb-6">
                  <div className="h-8 w-1 bg-indigo-500 rounded-full" />
                  <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400">
                    Male Collection
                  </h3>
                </div>
                <div className="flex flex-wrap gap-6">
                  {maleAvatars.map((image, index) => (
                    <AvatarOption
                      key={index}
                      image={image}
                      isSelected={imagePreview === image}
                      onClick={() => setImagePreview(image)}
                    />
                  ))}
                </div>
              </section>

              {/* Female Section */}
              <section>
                <div className="flex items-center gap-2 mb-6">
                  <div className="h-8 w-1 bg-pink-500 rounded-full" />
                  <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400">
                    Female Collection
                  </h3>
                </div>
                <div className="flex flex-wrap gap-6">
                  {femaleAvatars.map((image, index) => (
                    <AvatarOption
                      key={index}
                      image={image}
                      isSelected={imagePreview === image}
                      onClick={() => setImagePreview(image)}
                    />
                  ))}
                </div>
              </section>
            </div>
          </div>
          <AnimatePresence>
            {modalOpen && modalSrc && (
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
      </div>

      <SideNavBar />
    </div>
  );
}

function AvatarOption({ image, isSelected, onClick }) {
  return (
    <div
      className={`relative cursor-pointer transition-all duration-300 ease-out transform 
      ${isSelected ? "scale-110" : "hover:scale-110 active:scale-90"}`}
      onClick={onClick}
    >
      <div
        className={`rounded-full p-1 transition-all duration-500 
        ${
          isSelected
            ? "bg-linear-to-tr from-indigo-500 to-cyan-400 shadow-xl"
            : "bg-gray-100 hover:bg-gray-200"
        }`}
      >
        <div className="rounded-full">
          <img
            src={image}
            alt="Avatar Option"
            className="w-16 h-16 md:w-22 md:h-22 rounded-full object-cover"
          />
        </div>
      </div>

      {isSelected && (
        <div className="absolute top-0 right-0 bg-white rounded-full p-0.5 shadow-md animate-in zoom-in duration-300">
          <CheckCircle2 className="w-6 h-6 text-indigo-600 fill-white" />
        </div>
      )}
    </div>
  );
}

export default AvatarsPage;
