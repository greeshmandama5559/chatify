import { useState, useRef, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import BorderAnimatedContainer from "../components/BorderAnimatedContainer";
import { MailCheck } from "lucide-react";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";

function EmailVerification() {
  const { verifySignUpOtp, resendSignupOtp, isOtpVerifying, error } = useAuthStore();

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);
  const navigate = useNavigate();

  // Store email from signup (you must save this in store or localStorage)
  const pendingEmail = localStorage.getItem("pendingEmail");

  // ----------- RESEND OTP TIMER -------------
  const RESEND_DELAY = 60; 
  const [timer, setTimer] = useState(RESEND_DELAY);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((t) => (t > 0 ? t - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleResend = async () => {
    if (!pendingEmail) {
      toast.error("No email found. Please signup again.");
      return;
    }

    setIsResending(true);
    const ok = await resendSignupOtp(pendingEmail);
    setIsResending(false);

    if (ok) {
      setTimer(RESEND_DELAY); // restart timer
    }
  };

  // ----------- OTP HANDLING -------------
  const handleChange = (index, value) => {
    const newCode = [...otp];

    if (value.length > 1) {
      const pastedCode = value.slice(0, 6).split("");
      for (let i = 0; i < 6; i++) {
        newCode[i] = pastedCode[i] || "";
      }
      setOtp(newCode);

      const lastFilledIndex = newCode.findLastIndex((digit) => digit !== "");
      const focusIndex = lastFilledIndex < 5 ? lastFilledIndex + 1 : 5;
      inputRefs.current[focusIndex]?.focus();
    } else {
      newCode[index] = value;
      setOtp(newCode);
      if (value && index < 5) inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0)
      inputRefs.current[index - 1]?.focus();
    if (e.key === "ArrowLeft" && index > 0)
      inputRefs.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < 5)
      inputRefs.current[index + 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!paste) return;

    const newOtp = paste.split("");
    while (newOtp.length < 6) newOtp.push("");

    setOtp(newOtp);
    const lastFilled = Math.min(paste.length - 1, 5);
    inputRefs.current[lastFilled]?.focus();
  };

  const submitOtp = async (verificationCode) => {
    try {
      const result = await verifySignUpOtp(verificationCode);
      if (result?.success || result) {
        toast.success("Email verified successfully!");
        navigate("/", { replace: true });
      }
    } catch (err) {
      console.error("Error during OTP verification:", err);
    }
  };

  useEffect(() => {
    if (otp.every((digit) => digit !== "")) {
      submitOtp(otp.join(""));
    }
  }, [otp]);

  return (
    <div className="w-full flex items-center justify-center p-4 bg-slate-900">
      <div className="relative w-full mt-10 max-w-5xl md:h-[700px] h-[600px] md:mt-10">
        <BorderAnimatedContainer>
          <div className="w-full flex flex-col md:flex-row ">
            <div className="md:w-1/2 p-8 md:px-13 flex items-center justify-center md:border-r border-slate-600/30">
              <div className="w-full max-w-md">
                <div className="text-center mb-8">
                  <MailCheck className="w-12 h-12 mx-auto text-slate-400 mb-4" />
                  <h2 className="text-2xl font-bold text-slate-200 mb-2">
                    Verify Your Email
                  </h2>
                  <p className="text-slate-400">Enter OTP For Email Verification</p>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    submitOtp(otp.join(""));
                  }}
                  className="space-y-10"
                >
                  <div className="relative flex justify-between items-center">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => (inputRefs.current[index] = el)}
                        type="text"
                        maxLength={1}
                        value={digit}
                        required
                        onChange={(e) =>
                          handleChange(index, e.target.value.replace(/[^0-9]/g, ""))
                        }
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onPaste={handlePaste}
                        className="w-9 h-9 md:w-13 md:h-13 text-center text-2xl font-bold bg-gray-700 text-white border-2 border-gray-600 rounded-lg focus:border-cyan-500 focus:outline-none"
                        inputMode="numeric"
                      />
                    ))}
                  </div>

                  {error && <p className="text-red-500 font-semibold">{error}</p>}

                  <button
                    className="auth-btn w-full"
                    type="submit"
                    disabled={isOtpVerifying || otp.some((d) => !d)}
                  >
                    {isOtpVerifying ? "Verifying..." : "Verify Email"}
                  </button>

                  {/* -------- RESEND SECTION -------- */}
                  <div className="text-center mt-4">
                    {timer > 0 ? (
                      <p className="text-slate-400">
                        Resend OTP in <span className="text-cyan-400">{timer}s</span>
                      </p>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResend}
                        disabled={isResending}
                        className="text-cyan-400 hover:text-cyan-300 font-semibold"
                      >
                        {isResending ? "Sending..." : "Resend OTP"}
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>

            <div className="hidden md:w-1/2 md:flex items-center justify-center p-6 bg-gradient-to-bl from-slate-800/20 to-transparent">
              <div>
                <img src="/signup.png" alt="Signup Illustration" className="w-full h-auto" />
                <div className="mt-6 text-center">
                  <h3 className="text-xl font-medium text-cyan-400">Start Your Journey Today</h3>
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

export default EmailVerification;
