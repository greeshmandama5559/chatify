import { useAuthStore } from "../store/useAuthStore";
import { useNavigate, useParams } from "react-router";
import BorderAnimatedContainer from "../components/BorderAnimatedContainer";
import { useState } from "react";
import { LockIcon, EyeIcon, EyeOffIcon, KeyRoundIcon } from "lucide-react";

function ResetPasswordPage() {
  const { resetPassword, isLoading } = useAuthStore();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");

  const { token } = useParams();
  const navigate = useNavigate();

  console.log("token:", token);

  const validatePasswordStrength = (pw) => {
    if (pw.length < 6) return "Password must be at least 6 characters.";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      setError("Please fill both password fields.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    const strengthErr = validatePasswordStrength(password);
    if (strengthErr) {
      setError(strengthErr);
      return;
    }

    setError("");
    try {
      await resetPassword( token, password );
      navigate("/login", { replace: true });
    } catch (err) {
      console.error("Error in reset password page: ", err);
      setError("Failed to reset password. Please try again.");
    }
  };

  return (
    <div className="w-full flex items-center justify-center p-5 mt-10 md:mt-8 bg-slate-900">
      <div className="relative w-full max-w-5xl md:h-[700px] h-[600px] md:mt-4">
        <BorderAnimatedContainer>
          <div className="w-full flex flex-col md:flex-row ">
            <div className="md:w-1/2 p-8 md:px-13 flex items-center justify-center md:border-r border-slate-600/30">
              <div className="w-full max-w-md">
                <div className="text-center mb-8">
                  <LockIcon className="w-12 h-12 mx-auto text-slate-400 mb-4" />
                  <h2 className="text-2xl font-bold text-slate-200 mb-2">
                    Reset Password
                  </h2>
                  <p className="text-slate-400">Update Your Password</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="mb-6">
                    <label className="auth-input-label">Password</label>
                    <div className="relative">
                      <KeyRoundIcon className="auth-input-icon" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (
                            confirmPassword &&
                            e.target.value !== confirmPassword
                          ) {
                            setError("Passwords do not match.");
                          } else {
                            setError("");
                          }
                        }}
                        className="input"
                        placeholder="Enter your password"
                        required
                      />

                      {showPassword ? (
                        <EyeOffIcon
                          className="eye-btn pointer-events-auto z-20"
                          onClick={() => setShowPassword(false)}
                        />
                      ) : (
                        <EyeIcon
                          className="eye-btn pointer-events-auto z-20"
                          onClick={() => setShowPassword(true)}
                        />
                      )}
                    </div>
                  </div>

                  <div className="mb-2">
                    <label className="auth-input-label">Confirm Password</label>
                    <div className="relative">
                      <KeyRoundIcon className="auth-input-icon" />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => {
                          const val = e.target.value;
                          setConfirmPassword(val);
                          if (password && val !== password) {
                            setError("Passwords do not match.");
                          } else {
                            setError("");
                          }
                        }}
                        className="input"
                        placeholder="Confirm your password"
                        required
                      />

                      {showConfirmPassword ? (
                        <EyeOffIcon
                          className="eye-btn pointer-events-auto z-20"
                          onClick={() => setShowConfirmPassword(false)}
                        />
                      ) : (
                        <EyeIcon
                          className="eye-btn pointer-events-auto z-20"
                          onClick={() => setShowConfirmPassword(true)}
                        />
                      )}
                    </div>
                  </div>

                  {error && (
                    <p className="text-red-500 mt-2 font-semibold">{error}</p>
                  )}

                  <button
                    className="auth-btn mt-5"
                    type="submit"
                    disabled={isLoading || Boolean(error)}
                  >
                    {isLoading ? "Please wait..." : "Reset Password"}
                  </button>
                </form>
              </div>
            </div>

            <div className="hidden md:w-1/2 md:flex items-center justify-center py-15 p-6 bg-gradient-to-bl from-slate-800/20 to-transparent">
              <div>
                <img
                  src="/forgot-password.webp"
                  alt="Signup Illustration"
                  className="w-full h-auto"
                />
                <div className="mt-6 text-center">
                  <h3 className="text-xl font-medium text-cyan-400">
                    Your Privacy Is Our Priority
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

export default ResetPasswordPage;
