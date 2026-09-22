import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { useState, useEffect, useRef } from "react";
import Axios from "@/utils/Axios";
import { useNavigate, Link, useLocation } from "react-router-dom";
import useFetchUser from "@/hooks/useFetchUser";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { KeyRound, Sparkles, ArrowLeft, Mail, Lock } from "lucide-react";
import { toast } from "@/components/ui/toast";

type FormValues = {
  email: string;
  password: string;
};

const OTP_LENGTH = 6;

const LoginForm = () => {
  const { register, handleSubmit } = useForm<FormValues>();
  const [loginMode, setLoginMode] = useState<"PASSWORD" | "OTP">("PASSWORD");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [otpEmail, setOtpEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpDigits, setOtpDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const navigate = useNavigate();
  const location = useLocation();
  const { fetchUser } = useFetchUser();

  const successMessage = (location.state as any)?.message || "";

  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
    }
  }, [successMessage]);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const onInvalid = (formErrors: any) => {
    const firstError = Object.values(formErrors)[0] as any;
    if (firstError?.message) {
      toast.error(firstError.message);
    }
  };

  const onPasswordSubmit = async (data: FormValues) => {
    setLoading(true);
    try {
      const response = await Axios.post("/user/login", data);
      if (response.status === 200) {
        const success = await fetchUser();
        toast.success("Welcome back! Logged in successfully.");
        if (success) navigate("/dashboard");
      }
    } catch (error: any) {
      const msg = error?.response?.data?.error || error?.response?.data?.message || "Invalid email or password";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSendLoginOtp = async () => {
    if (!otpEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(otpEmail)) {
      toast.error("Please enter a valid college email address");
      return;
    }
    setLoading(true);
    try {
      await Axios.post("/user/login-otp", { email: otpEmail });
      setOtpSent(true);
      setCountdown(60);
      toast.info(`We sent a 6-digit login code to ${otpEmail}`);
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.response?.data?.error || "Failed to send login OTP. Please check your email.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResendLoginOtp = async () => {
    if (countdown > 0 || resending) return;
    setResending(true);
    try {
      await Axios.post("/user/login-otp", { email: otpEmail });
      setCountdown(60);
      toast.info("A fresh login code has been sent to your email.");
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.response?.data?.error || "Failed to resend login OTP.";
      toast.error(msg);
    } finally {
      setResending(false);
    }
  };

  const handleOtpDigitChange = (value: string, index: number) => {
    if (!/^\d?$/.test(value)) return;
    const updated = [...otpDigits];
    updated[index] = value;
    setOtpDigits(updated);
    if (value && index < OTP_LENGTH - 1) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && otpDigits[index] === "" && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const data = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    const updated = Array(OTP_LENGTH).fill("");
    for (let i = 0; i < data.length; i++) updated[i] = data[i];
    setOtpDigits(updated);
    otpInputRefs.current[data.length - 1]?.focus();
  };

  const handleVerifyLoginOtp = async () => {
    const code = otpDigits.join("");
    if (code.length !== OTP_LENGTH) {
      toast.error("Please enter all 6 digits.");
      return;
    }

    setLoading(true);
    try {
      const response = await Axios.post("/user/verify-login-otp", {
        email: otpEmail,
        otp: code,
      });

      if (response.status === 200) {
        const success = await fetchUser();
        toast.success("Welcome back! Logged in successfully.");
        if (success) navigate("/dashboard");
      }
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.response?.data?.error || "Invalid or expired OTP. Please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5 w-full">
      <div className="flex rounded-xl bg-muted/70 p-1 border border-border/50">
        <button
          type="button"
          onClick={() => setLoginMode("PASSWORD")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer ${
            loginMode === "PASSWORD"
              ? "bg-card text-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <KeyRound size={15} />
          Password
        </button>
        <button
          type="button"
          onClick={() => setLoginMode("OTP")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer ${
            loginMode === "OTP"
              ? "bg-card text-orange-600 dark:text-orange-400 shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Sparkles size={15} />
          One-Time Code (OTP)
        </button>
      </div>

      {loginMode === "PASSWORD" ? (
        <form className="space-y-4" onSubmit={handleSubmit(onPasswordSubmit, onInvalid)}>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">College Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="you@college.edu"
                className="pl-10 h-11 rounded-xl bg-background/50 border-border/70 focus-visible:ring-orange-500"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Invalid email address",
                  },
                })}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground">Password</label>
              <Link
                to="/auth/forgot-password"
                className="text-xs font-medium text-orange-600 hover:text-orange-500 hover:underline transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="pl-10 pr-10 h-11 rounded-xl bg-background/50 border-border/70 focus-visible:ring-orange-500"
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                })}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                {showPassword ? <AiOutlineEyeInvisible size={18} /> : <AiOutlineEye size={18} />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-700 text-white font-semibold shadow-md shadow-orange-500/20 cursor-pointer transition-all"
          >
            {loading ? "Signing in..." : "Sign In to CollegeMart"}
          </Button>
        </form>
      ) : (
        <div className="space-y-4">
          {!otpSent ? (
            <div className="space-y-4">
              <div className="text-center p-3 rounded-xl bg-orange-500/10 border border-orange-500/20">
                <p className="text-xs text-orange-700 dark:text-orange-300 font-medium">
                  Enter your registered college email. We will send an instant 6-digit login code.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Registered Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="name@college.edu"
                    value={otpEmail}
                    onChange={(e) => setOtpEmail(e.target.value)}
                    className="pl-10 h-11 rounded-xl bg-background/50 border-border/70 focus-visible:ring-orange-500"
                  />
                </div>
              </div>

              <Button
                type="button"
                onClick={handleSendLoginOtp}
                disabled={loading || !otpEmail}
                className="w-full h-11 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold shadow-md shadow-orange-500/20 cursor-pointer"
              >
                {loading ? "Sending Code..." : "Send Login Code (OTP)"}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center p-3 rounded-xl bg-muted/60 border border-border/60">
                <p className="text-xs text-muted-foreground">
                  Verification code sent to
                </p>
                <p className="text-sm font-bold text-foreground truncate mt-0.5">
                  {otpEmail}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setOtpSent(false);
                    setOtpDigits(Array(OTP_LENGTH).fill(""));
                  }}
                  className="text-xs text-orange-600 hover:text-orange-500 inline-flex items-center gap-1 mt-1 font-medium cursor-pointer"
                >
                  <ArrowLeft size={12} />
                  Change email
                </button>
              </div>

              <div className="flex justify-center gap-2">
                {otpDigits.map((digit, index) => (
                  <Input
                    key={index}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpDigitChange(e.target.value, index)}
                    onKeyDown={(e) => handleOtpKeyDown(e, index)}
                    onPaste={handleOtpPaste}
                    ref={(el) => {
                      otpInputRefs.current[index] = el;
                    }}
                    className="h-12 w-12 text-center text-lg font-bold rounded-xl border-border/80 focus-visible:ring-orange-500"
                  />
                ))}
              </div>

              <Button
                type="button"
                onClick={handleVerifyLoginOtp}
                disabled={loading || otpDigits.some((d) => !/^\d$/.test(d))}
                className="w-full h-11 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold shadow-md shadow-orange-500/20 cursor-pointer"
              >
                {loading ? "Verifying..." : "Verify & Enter Dashboard"}
              </Button>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-muted-foreground">Didn't receive code?</span>
                <button
                  type="button"
                  onClick={handleResendLoginOtp}
                  disabled={countdown > 0 || resending}
                  className="text-orange-600 hover:text-orange-500 font-semibold disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {resending ? "Sending..." : countdown > 0 ? `Resend in ${countdown}s` : "Resend OTP"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LoginForm;
