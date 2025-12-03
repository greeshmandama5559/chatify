import { LoaderIcon } from "lucide-react";

function PageLoader() {
  return (
    <div className="min-h-screen bg-slate-900 relative flex items-center justify-center overflow-hidden">
      <div className="flex justify-center items-center h-screen bg-gray-900">
        <div className="relative">
          {/* Image */}
          <img
            src="/convox.png"
            alt="ConvoX Logo"
            className="w-60 animate-bounce drop-shadow-lg"
          />

          {/* Text overlay */}
          <h4 className="absolute animate-bounce ml-10 inset-0 flex items-center justify-center text-cyan-200 text-2xl font-bold tracking-wide">
            ConvoX
          </h4>
        </div>
      </div>
    </div>
  );
}

export default PageLoader;
