
function DiscoverPageLoadingSkeleton({ size = 4 }) {
  return (
    <div className="flex flex-wrap gap-x-10 pt-5 gap-y-16 ml-5">
      {Array.from({ length: size }).map((_, index) => (
        <div
          key={index}
          className="relative mb-10 px-6 py-2 h-75 w-75 rounded-2xl flex flex-col items-center bg-slate-800/30 shadow-xl animate-pulse"
        >
          <div className="w-24 h-24 rounded-full mt-5 bg-slate-700/70 overflow-hidden shadow-lg"></div>

          <div className=" mt-3 flex flex-col items-center text-center w-full">
            <button className="w-30 py-2 bg-slate-700/50 h-6 font-semibold rounded-lg"></button>

            <div className="flex flex-col gap-2 w-full mt-6">
              <button className="w-full py-2 bg-slate-700/40 h-8 font-semibold rounded-lg"></button>
              <button className="w-full py-2 bg-slate-700/40 h-8 font-medium rounded-lg"></button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default DiscoverPageLoadingSkeleton;
