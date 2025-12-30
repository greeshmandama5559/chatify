import React from "react";

const ProfileSkeleton = () => {
  return (
    <div className="min-h-screen w-full bg-[#030712] overflow-hidden">
      {/* --- Nav Skeleton --- */}
      <div className="h-20 w-full border-b border-white/5 bg-[#030712]/60 backdrop-blur-xl px-6 flex items-center justify-between">
        <div className="h-10 w-24 bg-white/5 rounded-full animate-pulse" />
        <div className="h-8 w-40 bg-white/5 rounded-full animate-pulse" />
      </div>

      <main className="max-w-full mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* --- Left Column Skeleton --- */}
          <div className="lg:col-span-4 space-y-6">
            <div className="p-8 rounded-[2.5rem] bg-white/3 border border-white/10 backdrop-blur-3xl space-y-8">
              {/* Profile Image Circle */}
              <div className="flex flex-col items-center">
                <div className="w-44 h-44 rounded-3xl bg-white/5 animate-pulse relative">
                  <div className="absolute inset-0 bg-linear-to-tr from-transparent via-white/5 to-transparent animate-shimmer" />
                </div>

                {/* Name & Username */}
                <div className="h-8 w-48 bg-white/5 rounded-lg mt-6 animate-pulse" />
                <div className="h-4 w-32 bg-white/5 rounded-lg mt-3 animate-pulse" />

                {/* Buttons */}
                <div className="flex w-full gap-3 mt-8">
                  <div className="flex-1 h-14 bg-white/10 rounded-2xl animate-pulse" />
                  <div className="w-20 h-14 bg-white/10 rounded-2xl animate-pulse" />
                </div>
              </div>

              {/* Stats Grid */}
              <div className="pt-8 border-t border-white/5 grid grid-cols-2 gap-4">
                <div className="h-16 bg-white/5 rounded-2xl animate-pulse" />
                <div className="h-16 bg-white/5 rounded-2xl animate-pulse" />
              </div>
            </div>
          </div>

          {/* --- Right Column Skeleton --- */}
          <div className="lg:col-span-8 space-y-8">
            {/* About Card */}
            <div className="p-8 rounded-[2.5rem] bg-white/2 border border-white/5 space-y-4">
              <div className="h-4 w-24 bg-cyan-500/20 rounded animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 w-full bg-white/5 rounded animate-pulse" />
                <div className="h-4 w-5/6 bg-white/5 rounded animate-pulse" />
                <div className="h-4 w-4/6 bg-white/5 rounded animate-pulse" />
              </div>
              <div className="flex gap-2 pt-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-8 w-20 bg-white/5 rounded-full animate-pulse"
                  />
                ))}
              </div>
            </div>

            {/* Gallery Grid */}
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="h-4 w-32 bg-cyan-500/20 rounded animate-pulse" />
                <div className="h-px flex-1 bg-white/5" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-80 rounded-4xl bg-white/5 border border-white/5 animate-pulse overflow-hidden relative"
                  >
                    <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/[0.02] to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `,
        }}
      />
    </div>
  );
};

export default ProfileSkeleton;
