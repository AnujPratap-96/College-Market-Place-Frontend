import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import Axios from "@/utils/Axios";

const OTP_LENGTH = 6;

export default function OtpInput() {
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [errorMessage, setErrorMessage] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("signupToken");
    const email = localStorage.getItem("signupEmail");
    if (!token && !email) {
      navigate("/auth/signup");
    }
  }, [navigate]);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const isAllDigitsFilled = otp.every((digit) => /^\d$/.test(digit));

  const handleChange = (value: string, index: number) => {
    if (!/^\d?$/.test(value)) return;
    setErrorMessage("");
    setInfoMessage("");
    const updatedOtp = [...otp];
    updatedOtp[index] = value;
    setOtp(updatedOtp);
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const data = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    const updatedOtp = Array(OTP_LENGTH).fill("");
    for (let i = 0; i < data.length; i++) {
      updatedOtp[i] = data[i];
    }
    setOtp(updatedOtp);
    inputRefs.current[data.length - 1]?.focus();
  };

  const handleResend = async () => {
    if (countdown > 0 || resending) return;
    const email = localStorage.getItem("signupEmail");
    if (!email) {
      navigate("/auth/signup");
      return;
    }
    setResending(true);
    setErrorMessage("");
    setInfoMessage("");
    try {
      const response = await Axios.post("/user/resend-otp", { email, type: "SIGNUP" });
      const newToken = response.data?.data?.token || response.data?.token;
      if (newToken) localStorage.setItem("signupToken", newToken);
      setCountdown(60);
      setInfoMessage("A new OTP has been sent to your email.");
    } catch (error: any) {
      setErrorMessage(
        error?.response?.data?.message || error?.response?.data?.error || "Failed to resend OTP. Please wait."
      );
    } finally {
      setResending(false);
    }
  };

  const handleSubmit = async () => {
    const enteredOtp = otp.join("");
    if (!isAllDigitsFilled) {
      setErrorMessage("Please fill in all 6 digits with valid numbers.");
      return;
    }

    const token = localStorage.getItem("signupToken");
    if (!token) {
      navigate("/auth/signup");
      return;
    }

    setLoading(true);
    try {
      const response = await Axios.post(
        "/user/verify-otp",
        { otp: enteredOtp },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.status === 200) {
        navigate("/auth/complete-signup");
      }
    } catch (error: any) {
      setErrorMessage(
        error?.response?.data?.error || error?.response?.data?.message || "Invalid OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-lg text-center">
      <h2 className="text-2xl font-bold mb-2 text-foreground">Enter your OTP</h2>
      <p className="text-sm text-muted-foreground mb-6">We sent a 6-digit code to your email</p>

      <div className="flex justify-center gap-2 mb-4">
        {otp.map((digit, index) => (
          <Input
            key={index}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(e.target.value, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onPaste={handlePaste}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            className="h-12 w-12 text-center text-lg font-semibold"
          />
        ))}
      </div>

      {infoMessage && <p className="text-emerald-500 text-sm mb-4">{infoMessage}</p>}
      {errorMessage && (
        <p className="text-red-500 text-sm mb-4">{errorMessage}</p>
      )}

      <Button
        size="lg"
        className="bg-orange-500 hover:bg-orange-600 text-white w-full"
        onClick={handleSubmit}
        disabled={!isAllDigitsFilled || loading}
      >
        {loading ? "Verifying..." : "Submit OTP"}
      </Button>

      <div className="flex items-center justify-between text-sm pt-4">
        <span className="text-muted-foreground">Didn't receive the code?</span>
        <button
          type="button"
          onClick={handleResend}
          disabled={countdown > 0 || resending}
          className="text-orange-500 hover:text-orange-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {resending ? "Sending..." : countdown > 0 ? `Resend in ${countdown}s` : "Resend OTP"}
        </button>
      </div>
    </div>
  );
}
