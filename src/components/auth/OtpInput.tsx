import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import Axios from "@/utils/Axios";

const OTP_LENGTH = 6;

export default function OtpInput() {
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [errorMessage, setErrorMessage] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("signupToken");
    if (!token) {
      navigate("/auth/signup");
    }
  }, [navigate]);

  const isAllDigitsFilled = otp.every((digit) => /^\d$/.test(digit));

  const handleChange = (value: string, index: number) => {
    if (!/^\d?$/.test(value)) return;
    setErrorMessage("");
    const updatedOtp = [...otp];
    updatedOtp[index] = value;
    setOtp(updatedOtp);
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const data = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);
    const updatedOtp = Array(OTP_LENGTH).fill("");
    for (let i = 0; i < data.length; i++) {
      updatedOtp[i] = data[i];
    }
    setOtp(updatedOtp);
    inputRefs.current[data.length - 1]?.focus();
  };

  const handleSubmit = async () => {
    const enteredOtp = otp.join("");

    if (!isAllDigitsFilled) {
      setErrorMessage("Please fill in all 6 digits with valid numbers.");
      return;
    }

    try {
      const response = await Axios.post("/api/user/verify-otp", { otp: enteredOtp }, {},);
      if (response.status === 200) {
        navigate("/auth/complete-signup");
      }
    } catch (error: any) {
      setErrorMessage(
        error?.response?.data?.message || "Invalid OTP. Please try again."
      );
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-lg text-center">
      <h2 className="text-2xl font-bold mb-6 text-foreground">Enter your OTP</h2>

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
            ref={(el) => (inputRefs.current[index] = el)}
            className="h-12 w-12 text-center text-lg font-semibold tracking-widest"
          />
        ))}
      </div>

      {/* Error Message */}
      {errorMessage && (
        <p className="text-red-500 text-sm mb-4">{errorMessage}</p>
      )}

      <Button
        size="lg"
        className="bg-orange-500 hover:bg-orange-600 text-white w-full"
        onClick={handleSubmit}
        disabled={!isAllDigitsFilled}
      >
        Submit OTP
      </Button>
    </div>
  );
}
