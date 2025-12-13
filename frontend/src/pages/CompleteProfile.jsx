import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { UserRoundPen, LoaderIcon } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import BorderAnimatedContainer from "../components/BorderAnimatedContainer";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

function CompleteProfile() {
  const navigate = useNavigate();

  const [userName, setUserName] = useState("");

  const { isLoading, error, completeProfile } = useAuthStore();

  const [params] = useSearchParams();

  const state = params.get("state");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (userName.trim().length >= 3) {
      const res = await completeProfile(state, userName);
      if (res?.success) {
        toast.success("Username is Set");
        navigate("/", { replace: true });
      }
    } else {
      toast.error("Name should be least 3 letters");
    }
  };

  return (
    <div className="w-full h-full overflow-hidden flex items-center justify-center p-4 md:p-10 bg-slate-900">
      <div className="relative w-full max-w-3xl mb-15 md:max-w-5xl">
        <BorderAnimatedContainer>
          <div className="w-full flex flex-col md:flex-row ">
            <div className="md:w-1/2 px-10 py-10 md:py-8 md:px-15 flex items-center justify-center md:border-r border-slate-600/30">
              <div className="w-full max-w-md">
                <div className="text-center mb-10">
                  <UserRoundPen className="w-12 h-12 mx-auto text-slate-400 mb-4" />
                  <h2 className="text-2xl font-bold text-slate-200 mb-2">
                    Set Your Name
                  </h2>
                  <p className="text-slate-400">
                    User Name Was Taken Please set Different One
                  </p>
                </div>

                <form
                  onSubmit={handleSubmit}
                  className=" space-y-3 md:space-y-5"
                >
                  <div>
                    <label className="auth-input-label mb-2">
                      Change User Name
                    </label>
                    <div className="relative mt-4">
                      <UserRoundPen className="auth-input-icon" />
                      <input
                        type="text"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        className={`${
                          error
                            ? "w-full bg-slate-800/50 border border-red-700 rounded-lg py-2 pl-10 pr-4 text-slate-200 placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                            : "w-full bg-slate-800/50 border border-slate-700 rounded-lg py-2 pl-10 pr-4 text-slate-200 placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                        }`}
                        placeholder="Enter your user name"
                        required
                      />
                    </div>
                  </div>

                  {error && (
                    <p className="text-red-500 -mt-4 font-semibold">{error}</p>
                  )}

                  <button
                    className="auth-btn mt-4"
                    type="submit"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <LoaderIcon className="w-full h-5 animate-spin text-center" />
                    ) : (
                      "set user name"
                    )}
                  </button>
                </form>
              </div>
            </div>
            <div className="hidden md:w-1/2 md:flex items-center justify-center p-10 bg-gradient-to-bl from-slate-800/20 to-transparent">
              <div>
                <img
                  src="/login.png"
                  alt="Signup Illustration"
                  className="w-full h-auto"
                />
                <div className="mt-6 text-center">
                  <h3 className="text-xl font-medium text-cyan-400">
                    Connect any time anywhere
                  </h3>
                  <div className="mt-4 flex justify-center gap-4">
                    <span className="auth-badge">Free</span>
                    <span className="auth-badge">Easy Setup</span>
                    <span className="auth-badge">Private</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </BorderAnimatedContainer>
      </div>
    </div>
  );
}

export default CompleteProfile;
