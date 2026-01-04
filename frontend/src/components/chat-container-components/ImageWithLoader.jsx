import { useState } from "react";
import { LoaderCircle, DownloadCloud, X } from "lucide-react";

function ImageWithLoader({
  src,
  isAutoScrollRef,
  shouldForceScrollRef,
  endRef,
  alt = "Image",
  isOptimistic = false,
  className = "",
  onClick,
}) {
  const [loading, setLoading] = useState(true);
  const [errored, setErrored] = useState(false);

  if (!src) {
    return null;
  }

  const isDataUrl = typeof src === "string" && src.startsWith("data:");

  return (
    <div className="relative w-full group">
      {/* Overlay loader */}
      {(loading || isOptimistic || isDataUrl) && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-black/30 rounded-xl">
          <div className="flex items-center justify-center bg-black/40 rounded-full p-2">
            <LoaderCircle size={20} className="animate-spin" />
          </div>
          <div className="text-xs text-white/90">
            {isDataUrl || isOptimistic ? "Uploading…" : "Loading image…"}
          </div>
        </div>
      )}

      {/* Image + hover fade */}
      <div className="relative overflow-hidden rounded-xl">
        {/* subtle light gray fade overlay that appears on hover */}
        <div className="pointer-events-none absolute inset-0 rounded-xl bg-white/0 group-hover:bg-white/6 transition-colors duration-200" />

        <img
          src={src}
          alt={alt}
          className={`rounded-xl object-cover max-h-48 w-full border transition-transform duration-200 ease-in-out transform 
            group-hover:scale-105 group-hover:brightness-80 group-hover:grayscale-10 ${className}`}
          onLoad={() => {
            if (isAutoScrollRef.current || shouldForceScrollRef.current) {
              endRef.current?.scrollIntoView({ behavior: "auto" });
            }
            setLoading(false);
          }}
          onError={() => {
            setLoading(false);
            setErrored(true);
          }}
          onClick={onClick}
        />
      </div>

      {/* Error fallback */}
      {errored && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 text-white rounded-xl">
          Failed to load image
        </div>
      )}
    </div>
  );
}

export default ImageWithLoader;
