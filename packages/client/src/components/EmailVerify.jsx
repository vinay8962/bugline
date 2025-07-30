import React, { useState } from "react";
import { Mail, RefreshCcw, Shield } from "lucide-react";

const EmailVerify = ({ email }) => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    const fullOtp = otp.join("");
    console.log("Entered OTP:", fullOtp);
    // TODO: Add API verification logic here
  };

  return (
    <div className="space-y-6">
      {/* Shield Icon Centered with Border */}
      <div className="flex justify-center">
        <div className="p-3 rounded-full border border-gray-800 text-blue-500">
          <Shield className="w-8 h-8" />
        </div>
      </div>

      {/* Header and Email Info */}
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

      {/* OTP Inputs */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex justify-between gap-2">
          {otp.map((digit, index) => (
            <input
              key={index}
              id={`otp-${index}`}
              placeholder="-"
              type="text"
              maxLength="1"
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              className="w-10 h-12 text-center text-white bg-transparent border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
            />
          ))}
        </div>

        <button
          type="submit"
          className="w-full bg-[#2463eb] text-white py-2 rounded-md hover:bg-blue-500 transition"
        >
          Verify OTP
        </button>
      </form>

      {/* Resend Option */}
      <div className="w-full flex flex-col items-center space-y-3 text-gray-400 mt-4">
        <p className="text-sm text-center">Didn't receive the code?</p>
        <button className="flex items-center gap-2 text-[#2057cd] border border-gray-800 px-4 py-2 rounded-md hover:underline hover:border-[#2057cd] transition">
          <RefreshCcw className="w-4 h-4" />
          Resend
        </button>
      </div>
    </div>
  );
};

export default EmailVerify;
