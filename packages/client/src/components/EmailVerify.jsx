import React, { useState } from "react";
import { Mail, RefreshCcw, Shield } from "lucide-react";
import { toast } from "react-toastify"; // Optional toast for user feedback
// import { verifyOTP } from "../api/auth"; // <-- your actual API function here

const EmailVerify = ({ email }) => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);

  const handleChange = (index, value) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < otp.length - 1) {
      const next = document.getElementById(`otp-${index + 1}`);
      next?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpString = otp.join("");
    if (otpString.length < 6) {
      toast.error("Please enter the full 6-digit OTP");
      return;
    }

    try {
      setLoading(true);
      console.log("Entered OTP:", otpString);

      // TODO: Replace this with actual API call
      // const res = await verifyOTP({ email, otp: otpString });
      // if (res.success) { ... }

      toast.success("OTP verified successfully!");
    } catch (error) {
      console.error("OTP verification failed:", error);
      toast.error("Failed to verify OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Shield Icon Centered */}
      <div className="flex justify-center">
        <div className="p-3 rounded-full border border-gray-800 text-blue-500">
          <Shield className="w-8 h-8" />
        </div>
      </div>

      {/* Header and Email */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-white">Verify your email</h2>
        <p className="text-gray-500 text-sm flex items-center justify-center gap-1">
          <Mail className="w-4 h-4 text-blue-500" />
          <span>{email}</span>
        </p>
        <p className="text-gray-500 text-sm">
          We've sent a 6-digit OTP to your email. Enter it below to continue.
        </p>
      </div>

      {/* OTP Input */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex justify-between gap-2">
          {otp.map((digit, index) => (
            <input
              key={index}
              id={`otp-${index}`}
              aria-label={`OTP digit ${index + 1}`}
              role="textbox"
              inputMode="numeric"
              type="text"
              maxLength="1"
              placeholder="-"
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              className="w-10 h-12 text-center text-white bg-transparent border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
            />
          ))}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#2463eb] text-white py-2 rounded-md hover:bg-blue-500 transition disabled:opacity-60"
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>
      </form>

      {/* Resend OTP */}
      <div className="w-full flex flex-col items-center space-y-3 text-gray-400 mt-4">
        <p className="text-sm text-center">Didn't receive the code?</p>
        <button
          type="button"
          className="flex items-center gap-2 text-[#2057cd] border border-gray-800 px-4 py-2 rounded-md hover:underline hover:border-[#2057cd] transition"
          onClick={() => toast.info("Resend OTP feature coming soon.")}
        >
          <RefreshCcw className="w-4 h-4" />
          Resend
        </button>
      </div>
    </div>
  );
};

export default EmailVerify;
