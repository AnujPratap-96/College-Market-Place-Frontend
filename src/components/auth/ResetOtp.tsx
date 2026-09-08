import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Axios from "@/utils/Axios";

const OTP_LENGTH = 6;

const ResetOtp = () => {
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("resetToken");
    if (!token) navigate("/auth/forgot-password");
  }, [navigate]);

  const isAllFilled = otp.every((d) => /^\d$/.test(d));

  const handleChange = (value: string, index: number) => {
    if (!/^\d?$/.test(value)) return;
    setErrorMessage("");
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

  const handleSubmit = async () => {
    if (!isAllFilled) {
      setErrorMessage("Please fill in all 6 digits.");
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
        const newToken = response.data?.token;
        if (newToken) localStorage.setItem("resetToken", newToken);
        navigate("/auth/reset-password");
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
    <div className="max-w-md mx-auto p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-lg text-center space-y-4">
      <h2 className="text-2xl font-bold text-foreground">Enter Reset OTP</h2>
      <p className="text-sm text-muted-foreground">
        We sent a 6-digit code to your email. It expires in 5 minutes.
      </p>

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
            ref={(el) => (inputRefs.current[index] = el)}
            className="h-12 w-12 text-center text-lg font-semibold"
          />
        ))}
      </div>

      {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}

      <Button
        size="lg"
        className="bg-orange-500 hover:bg-orange-600 text-white w-full"
        onClick={handleSubmit}
        disabled={!isAllFilled || loading}
      >
        {loading ? "Verifying..." : "Verify OTP"}
      </Button>
    </div>
  );
};

export default ResetOtp;
