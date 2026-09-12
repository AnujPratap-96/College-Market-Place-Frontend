import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";
import Axios from "@/utils/Axios";
import { toast } from "@/components/ui/toast";

const OTP_LENGTH = 6;

const ResetOtp = () => {
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [userEmail, setUserEmail] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("resetToken");
    const email = localStorage.getItem("resetEmail");
    if (email) setUserEmail(email);
    if (!token && !email) navigate("/auth/forgot-password");
  }, [navigate]);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const isAllFilled = otp.every((d) => /^\d$/.test(d));

  const handleChange = (value: string, index: number) => {
    if (!/^\d?$/.test(value)) return;
    const updated = [...otp];
    updated[index] = value;
    setOtp(updated);
    if (value && index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const data = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    const updated = Array(OTP_LENGTH).fill("");
    for (let i = 0; i < data.length; i++) updated[i] = data[i];
    setOtp(updated);
    inputRefs.current[data.length - 1]?.focus();
  };

  const handleResend = async () => {
    if (countdown > 0 || resending) return;
    const email = localStorage.getItem("resetEmail");
    if (!email) {
      navigate("/auth/forgot-password");
      return;
    }
    setResending(true);
    try {
      const response = await Axios.post("/user/forgot-password", { email });
      const newToken = response.data?.data?.token || response.data?.token;
      if (newToken) localStorage.setItem("resetToken", newToken);
      setCountdown(60);
      const msg = "A new OTP has been sent to your email.";
      toast.info(msg);
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.response?.data?.error || "Failed to resend OTP. Please wait.";
      toast.error(msg);
    } finally {
      setResending(false);
    }
  };

  const handleSubmit = async () => {
    if (!isAllFilled) {
      const err = "Please fill in all 6 digits.";
      toast.error(err);
      return;
    }

    const token = localStorage.getItem("resetToken");
    if (!token) {
      navigate("/auth/forgot-password");
      return;
    }

    setLoading(true);
    try {
      const response = await Axios.post(
        "/user/verify-reset-otp",
        { otp: otp.join("") },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.status === 200) {
        const newToken = response.data?.data?.token || response.data?.token;
        if (newToken) localStorage.setItem("resetToken", newToken);
        toast.success("OTP verified successfully!");
        navigate("/auth/reset-password");
      }
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.response?.data?.error || "Invalid OTP. Please try again.";
      toast.error(msg);
      setOtp(Array(OTP_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-lg text-center space-y-4">
      <h2 className="text-2xl font-bold text-foreground">Enter Reset OTP</h2>
      <p className="text-sm text-muted-foreground">
        We sent a 6-digit code to{" "}
        <span className="font-medium text-orange-500">{userEmail || "your email"}</span>
      </p>
      <div>
        <button
          type="button"
          onClick={() => navigate("/auth/forgot-password")}
          className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 cursor-pointer"
        >
          <ArrowLeft size={12} />
          Change email address
        </button>
      </div>

      <div className="flex justify-center gap-2">
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

      <Button
        size="lg"
        className="bg-orange-500 hover:bg-orange-600 text-white w-full"
        onClick={handleSubmit}
        disabled={!isAllFilled || loading}
      >
        {loading ? "Verifying..." : "Verify OTP"}
      </Button>

      <div className="flex items-center justify-between text-sm pt-2">
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
};

export default ResetOtp;
