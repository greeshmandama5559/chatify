import { useState, useRef } from "react";
import { useAuthStore } from "../store/useAuthStore";
import {
  LoaderIcon,
  Camera,
  Mars,
  Venus,
  Transgender,
  CheckCircle2,
  AlertCircle,
  Pencil,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import BorderAnimatedContainer from "../components/BorderAnimatedContainer";
import toast from "react-hot-toast";

const avatars = [
  "/maleAavatars/male1.jpg",
  "/maleAavatars/male8.jpg",
  "/maleAavatars/male4.jpg",
  "/femaleAavatars/female1.jpg",
  "/femaleAavatars/female2.jpg",
  "/femaleAavatars/female3.jpg",
];

function CompleteProfile() {
  const navigate = useNavigate();

  const { isLoading, completeProfile, authUser, updateProfileName } =
    useAuthStore();
  const [gender, setGender] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [backendErrors, setBackendErrors] = useState({});

  const [isEditing, setIsEditing] = useState(false);
  const [editingName, setEditingName] = useState(authUser?.fullName || "");
  const [isSaving, setIsSaving] = useState(false);
  const nameInputRef = useRef(null);

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

  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        return toast.error("Image must be less than 3MB");
      }
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBackendErrors({});

    if (!gender) {
      return toast.error("Please select your gender");
    }

    const res = await completeProfile({
      fullName: editingName.trim(),
      gender,
      profilePic: imagePreview,
    });

    if (res?.success) {
      toast.success("Profile completed!");
      navigate("/", { replace: true });
    } else if (res?.errors) {
      setBackendErrors(res.errors);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#020617] relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-size-[4rem_4rem] mask-[radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-size-[4rem_4rem] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 blur-[120px] rounded-full" />

      <div className="relative w-full max-w-4xl z-10">
        <BorderAnimatedContainer>
          <div className="w-full bg-slate-900/80 backdrop-blur-2xl rounded-3xl border border-white/10 p-8 md:p-12">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-white tracking-tight">
                Finish Setting Up
              </h2>
              <p className="text-slate-400 mt-2">
                Let people know who you are.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Profile Picture Upload */}
              <div className="flex flex-col items-center">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-full border-4 border-slate-800 overflow-hidden bg-slate-800 flex items-center justify-center transition-all group-hover:border-cyan-500/50 shadow-xl">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Camera className="w-10 h-10 text-slate-500" />
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current.click()}
                    className="absolute bottom-1 right-1 bg-cyan-500 p-2 rounded-full text-slate-900 hover:scale-110 transition-transform shadow-lg"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-3 font-medium">
                  Upload Profile Photo
                </p>
              </div>

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
                      className={`w-full bg-slate-800/40 border ${
                        backendErrors.userName
                          ? "border-red-500"
                          : "border-slate-700"
                      } text-white rounded-2xl py-4 px-12 outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all`}
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

                {backendErrors.userName && (
                  <div className="flex items-center gap-1 text-red-400 text-xs mt-1 ml-1 animate-pulse">
                    <AlertCircle className="w-3 h-3" /> {backendErrors.userName}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4 py-4">
                {avatars.map((image, index) => {
                  const isSelected = image === imagePreview;

                  return (
                    <div
                      key={index}
                      className={`relative group cursor-pointer transition-all duration-300 ease-in-out transform 
          ${isSelected ? "scale-110" : "hover:scale-105"}`}
                      onClick={() => setImagePreview(image)}
                    >
                      {/* The Outer Ring / Gradient Border */}
                      <div
                        className={`rounded-full p-1 transition-all duration-500 
            ${
              isSelected
                ? "bg-linear-to-tr from-cyan-500 to-indigo-600 shadow-lg shadow-indigo-200"
                : "bg-transparent"
            }`}
                      >
                        <div className="rounded-full bg-white p-0.5">
                          <img
                            src={image}
                            alt={`Avatar ${index}`}
                            className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover border border-gray-100"
                          />
                        </div>
                      </div>

                      {/* Improved Checkmark Badge */}
                      {isSelected && (
                        <div className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                          <CheckCircle2 className="w-6 h-6 text-indigo-600 fill-white" />
                        </div>
                      )}

                      {/* Subtle Hover Overlay (Only if not selected) */}
                      {!isSelected && (
                        <div className="absolute inset-0 bg-black/5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Gender Selection */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-slate-300 ml-1">
                  Gender Identity
                </label>
                <div className="grid grid-cols-3 gap-4 mt-2">
                  {[
                    {
                      id: "male",
                      label: "Male",
                      icon: Mars,
                      color: "text-blue-400",
                    },
                    {
                      id: "female",
                      label: "Female",
                      icon: Venus,
                      color: "text-pink-400",
                    },
                    {
                      id: "other",
                      label: "Other",
                      icon: Transgender,
                      color: "text-purple-400",
                    },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setGender(item.id)}
                      className={`relative flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-300 ${
                        gender === item.id
                          ? "border-cyan-500 bg-cyan-500/10"
                          : "border-slate-800 bg-slate-800/20 hover:border-slate-600"
                      }`}
                    >
                      {gender === item.id && (
                        <CheckCircle2 className="absolute top-2 right-2 w-4 h-4 text-cyan-500" />
                      )}
                      <item.icon className={`w-6 h-6 mb-2 ${item.color}`} />
                      <span className="text-xs font-semibold text-slate-300">
                        {item.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-linear-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-cyan-500/20 active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <LoaderIcon className="w-5 h-5 animate-spin" />
                ) : (
                  "Complete My Profile"
                )}
              </button>
            </form>
          </div>
        </BorderAnimatedContainer>
      </div>
    </div>
  );
}

export default CompleteProfile;
