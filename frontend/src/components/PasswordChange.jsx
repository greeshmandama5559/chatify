import React, { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { PhoneIcon, LoaderIcon, LockKeyhole } from "lucide-react";
import { Link } from "react-router-dom";

function PasswordChange({ setIsChangingPassword }) {
  const { isLoggingIn, isLoading, error, sendResetPasswordMail } =
    useAuthStore();
  const [phoneNumber, setPhoneNumber] = useState();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    await sendResetPasswordMail(phoneNumber);
    setIsSubmitted(true);
  };

  return (
    <div>
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <LockKeyhole className="w-12 h-12 mx-auto text-slate-400 mb-4" />
          <h2 className="text-2xl font-bold text-slate-200 mb-2">
            Account Verification
          </h2>
          <p className="text-slate-400">
            Enter your phone number for Verification
          </p>
        </div>

        {!isSubmitted || error ? (
          <form onSubmit={handlePasswordChange} className="space-y-0 md:mt-20">
            <div>
              <label className="auth-input-label">phone number</label>
              <div className="relative">
                <PhoneIcon className="auth-input-icon" />
                <input
                  type="number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="input"
                  placeholder="Enter your phone number"
                  required
                />
              </div>
            </div>

            {/* {error && (
                <p className="text-red-500 mt-2 font-semibold">{error}</p>
              )} */}

            <div className="flex justify-center items-center w-full h-full">
              <button
                className="auth-btn mt-10 max-w-50"
                type="submit"
                disabled={isLoggingIn}
              >
                {isLoading ? (
                  <LoaderIcon className="w-full h-5 animate-spin text-center" />
                ) : (
                  "send verification link"
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 30,
              }}
              className="w-16 h-16 bg-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <Mail className="h-8 w-8 text-white" />
            </motion.div>
            <p className="text-gray-300 mb-6">
              If an <b>{phoneNumber}</b> exists, you will receive a OTP.
            </p>
          </div>
        )}

        <div
          className="mt-10 text-center "
          onClick={() => setIsChangingPassword(false)}
        >
          <Link to="/login" className="auth-link">
            back to login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default PasswordChange;
