import { LoaderIcon } from "lucide-react";

function PageLoader() {
  return (
    <div className="min-h-screen bg-slate-900 relative flex items-center justify-center overflow-hidden">
      {/* DECORATORS - GRID BG & GLOW SHAPES */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px]" />
      <div className="absolute top-0 -left-4 size-96 bg-pink-500 opacity-20 blur-[100px]" />
      <div className="absolute bottom-0 -right-4 size-96 bg-cyan-500 opacity-20 blur-[100px]" />
      {/* Image */}
      <img
        src="/convox.png"
        alt="ConvoX Logo"
        className="w-60 animate-bounce drop-shadow-lg"
      />

      {/* Text overlay */}
      {/* <h4 className="absolute animate-bounce ml-10 inset-0 flex items-center justify-center text-cyan-200 text-2xl font-bold tracking-wide">
            ConvoX
          </h4> */}
    </div>
  );
}

export default PageLoader;
