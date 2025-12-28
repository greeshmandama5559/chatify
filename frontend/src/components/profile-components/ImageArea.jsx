import { PlusIcon, Trash2, Loader2, X } from "lucide-react";
import { useRef, useState, useEffect } from "react"; // Added useEffect
import { useAuthStore } from "../../store/useAuthStore";
import { useProfileStore } from "../../store/useProfileStore";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

function ImageArea({ modalOpen, openImageModal, setIsDeleting }) {
  const fileRef = useRef(null);
  const [preview, setPreview] = useState(null);

  const [ImageId, setImageId] = useState(null);

  const { authUser } = useAuthStore();

  const [deleteBox, showDeleteBox] = useState(false);

  const { uploadImage, deleteImage, uploading, uploadProgress } =
    useProfileStore();

  const gallery = authUser?.gallery || [];

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (modalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [modalOpen]);

  const handleImageDelete = async (imageId) => {
    setIsDeleting(true);
    showDeleteBox(false);
    await deleteImage(imageId);
    setIsDeleting(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);

    const formData = new FormData();
    formData.append("image", file);

    uploadImage(formData).finally(() => {
      setPreview(null);
      URL.revokeObjectURL(previewUrl);
    });

    e.target.value = null;
  };

  return (
    <section className="relative w-full bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-4 md:p-8 shadow-2xl">
      <h3 className="text-sm md:text-md font-bold tracking-tight text-slate-400 mb-6 text-center md:text-left">
        Your Gallery ({gallery.length}/4 images)
      </h3>

      <div className="flex flex-wrap justify-center md:justify-start items-center gap-6 py-3">
        {/* Existing Images */}
        {gallery.map((img) => (
          <motion.div
            key={img._id}
            whileHover={{ y: -8 }}
            className="relative group w-25 h-35 md:w-60 md:h-80 overflow-hidden rounded-2xl ring-1 ring-white/10 shadow-xl cursor-pointer"
            onClick={() => openImageModal(img.url)}
          >
            <img
              src={img.url}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            {/* Delete button */}
            {!uploading && (
              <button
                onClick={async (e) => {
                  e.stopPropagation();
                  setImageId(img._id)
                  showDeleteBox(true);
                }}
                className="absolute top-0 right-0 bg-black/60 hover:bg-red-500/80 p-2 rounded-full backdrop-blur-md opacity-100"
              >
                <Trash2 size={16} className="text-white" />
              </button>
            )}
          </motion.div>
        ))}

        {deleteBox && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-md shadow-2xl">
              {/* Header */}
              <div className="px-6 py-4 border-b border-slate-700">
                <h2 className="text-lg font-semibold text-slate-100">
                  Delete Image
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  Are you sure you want to delete this image? This action cannot
                  be undone.
                </p>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 px-6 py-4 bg-slate-800">
                <button
                  className="px-4 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-colors"
                  onClick={() => handleImageDelete(ImageId)}
                >
                  Yes, Delete
                </button>
                <button
                  className="px-4 py-2 rounded-lg bg-slate-700 text-slate-200 font-medium hover:bg-slate-600 transition-colors"
                  onClick={() => {
                    showDeleteBox(false);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Uploading Preview */}
        {preview && (
          <div className="relative w-25 h-35 md:w-60 md:h-80 rounded-2xl overflow-hidden ring-1 ring-cyan-500/30 shadow-xl">
            <img
              src={preview}
              className="w-full h-full object-cover opacity-40"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-4 bg-black/40 backdrop-blur-sm">
              <Loader2 className="animate-spin text-cyan-400" />
              <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div
                  style={{ width: `${uploadProgress}%` }}
                  className="h-full bg-cyan-400 transition-all duration-300"
                />
              </div>
              <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">
                Uploading {uploadProgress}%
              </span>
            </div>
          </div>
        )}

        {/* Add Button */}
        {gallery.length + (preview ? 1 : 0) < 4 && !uploading && (
          <button
            onClick={() => fileRef.current.click()}
            className="w-25 h-35 md:w-60 md:h-80 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/10 hover:border-cyan-400 hover:bg-cyan-400/5 transition-all ring-1 ring-white/5 shadow-lg group"
          >
            <PlusIcon
              size={34}
              className="text-slate-500 group-hover:text-cyan-400 transition-colors"
            />
            <span className="text-xs font-medium text-slate-500 group-hover:text-cyan-400 mt-3">
              Add Photo
            </span>
          </button>
        )}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        hidden
        onChange={handleFileChange}
      />
    </section>
  );
}

export default ImageArea;
