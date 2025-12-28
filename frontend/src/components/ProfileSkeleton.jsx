const ProfileSkeleton = () => {
  return (
    <div className="w-full bg-[#020617]">
      <div className="max-w-7xl mx-auto p-8 grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-12 bg-[#020617] min-h-screen">
        {/* LEFT COLUMN: Profile Info */}
        <div className="flex flex-col md:mt-20 items-center lg:items-start space-y-8">
          {/* Avatar Skeleton */}
          <div className="relative">
            <div className="w-48 h-48 rounded-full bg-slate-800/50 animate-pulse border-4 border-slate-800" />
          </div>

          {/* Name and Message Button */}
          <div className="flex flex-col items-center lg:items-start w-full space-y-4">
            <div className="h-10 w-64 bg-slate-800/50 animate-pulse rounded-lg" />
            <div className="h-11 w-32 bg-slate-800/30 animate-pulse rounded-xl border border-slate-700/50" />
          </div>

          {/* Stats Row (Status & Appreciation) */}
          <div className="grid grid-cols-2 gap-12 w-full pt-4 border-t border-slate-800/50">
            <div className="space-y-2">
              <div className="h-3 w-16 bg-slate-800/50 animate-pulse rounded" />
              <div className="h-4 w-24 bg-slate-800/30 animate-pulse rounded" />
            </div>
            <div className="space-y-2">
              <div className="h-3 w-20 bg-slate-800/50 animate-pulse rounded" />
              <div className="h-5 w-12 bg-slate-800/30 animate-pulse rounded" />
            </div>
          </div>

          {/* About Section */}
          <div className="w-full space-y-3">
            <div className="h-3 w-16 bg-slate-800/50 animate-pulse rounded" />
            <div className="space-y-2">
              <div className="h-4 w-full bg-slate-800/30 animate-pulse rounded" />
              <div className="h-4 w-[80%] bg-slate-800/30 animate-pulse rounded" />
            </div>
          </div>

          {/* Interests Section */}
          <div className="w-full space-y-4">
            <div className="h-3 w-20 bg-slate-800/50 animate-pulse rounded" />
            <div className="flex gap-3">
              <div className="h-8 w-20 bg-slate-800/40 animate-pulse rounded-full" />
              <div className="h-8 w-24 bg-slate-800/40 animate-pulse rounded-full" />
              <div className="h-8 w-20 bg-slate-800/40 animate-pulse rounded-full" />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Visual Gallery */}
        <div className="space-y-6 mt-10">
          <div className="flex items-center gap-4">
            <div className="h-4 w-32 bg-slate-800/50 animate-pulse rounded" />
            <div className="flex-1 h-px bg-slate-800/50" />
          </div>

          {/* Gallery Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="aspect-3/4 w-full bg-slate-800/30 animate-pulse rounded-4xl border border-slate-800/50"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSkeleton;
