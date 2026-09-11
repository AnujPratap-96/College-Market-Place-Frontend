import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { useState, useEffect, useRef } from "react";
import Axios from "@/utils/Axios";
import { useNavigate, Link, useLocation } from "react-router-dom";
import useFetchUser from "@/hooks/useFetchUser";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { KeyRound, Sparkles, ArrowLeft } from "lucide-react";

type FormValues = {
  email: string;
  password: string;
};

const OTP_LENGTH = 6;

const LoginForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>();
  const [loginMode, setLoginMode] = useState<"PASSWORD" | "OTP">("PASSWORD");
  const [serverError, setServerError] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
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
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const onPasswordSubmit = async (data: FormValues) => {
    setServerError("");
    setInfoMessage("");
    setLoading(true);
    try {
      const response = await Axios.post("/user/login", data);
      if (response.status === 200) {
        const token = response.data?.data?.token || response.data?.token;
        if (token) localStorage.setItem("token", token);
        const success = await fetchUser();
        if (success) navigate("/dashboard");
      }
    } catch (error: any) {
      setServerError(
        error?.response?.data?.error || error?.response?.data?.message || "Invalid email or password"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSendLoginOtp = async () => {
    if (!otpEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(otpEmail)) {
      setServerError("Please enter a valid college email address");
      return;
    }
    setServerError("");
    setInfoMessage("");
    setLoading(true);
    try {
      await Axios.post("/user/login-otp", { email: otpEmail });
      setOtpSent(true);
      setCountdown(60);
      setInfoMessage(`We sent a 6-digit login code to ${otpEmail}`);
    } catch (error: any) {
      setServerError(
        error?.response?.data?.message || error?.response?.data?.error || "Failed to send login OTP. Please check your email."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendLoginOtp = async () => {
    if (countdown > 0 || resending) return;
    setResending(true);
    setServerError("");
    setInfoMessage("");
    try {
      await Axios.post("/user/login-otp", { email: otpEmail });
      setCountdown(60);
      setInfoMessage("A fresh login code has been sent to your email.");
    } catch (error: any) {
      setServerError(
        error?.response?.data?.message || error?.response?.data?.error || "Failed to resend login OTP."
      );
    } finally {
      setResending(false);
    }
  };

  const handleOtpDigitChange = (value: string, index: number) => {
    if (!/^\d?$/.test(value)) return;
    setServerError("");
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
      setServerError("Please enter all 6 digits.");
      return;
    }

    setServerError("");
    setLoading(true);
    try {
      const response = await Axios.post("/user/verify-login-otp", {
        email: otpEmail,
        otp: code,
      });

      if (response.status === 200) {
        const token = response.data?.data?.token || response.data?.token;
        if (token) localStorage.setItem("token", token);
        const success = await fetchUser();
        if (success) navigate("/dashboard");
      }
    } catch (error: any) {
      setServerError(
        error?.response?.data?.message || error?.response?.data?.error || "Invalid or expired OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5 bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-md border border-zinc-200 dark:border-zinc-700 max-w-md mx-auto">
      {successMessage && (
        <p className="text-sm text-green-500 text-center bg-green-500/10 p-2 rounded-lg">
          {successMessage}
        </p>
      )}

      <div className="flex rounded-lg bg-zinc-100 dark:bg-zinc-800 p-1">
        <button
          type="button"
          onClick={() => {
            setLoginMode("PASSWORD");
            setServerError("");
            setInfoMessage("");
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all cursor-pointer ${
            loginMode === "PASSWORD"
              ? "bg-white dark:bg-zinc-900 text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <KeyRound size={16} />
          Password
        </button>
        <button
          type="button"
          onClick={() => {
            setLoginMode("OTP");
            setServerError("");
            setInfoMessage("");
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all cursor-pointer ${
            loginMode === "OTP"
              ? "bg-white dark:bg-zinc-900 text-orange-500 dark:text-orange-400 shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Sparkles size={16} />
          Login with OTP
        </button>
      </div>

      {loginMode === "PASSWORD" ? (
        <form className="space-y-4" onSubmit={handleSubmit(onPasswordSubmit)}>
          <div>
            <Input
              type="email"
              placeholder="Email"
              className="bg-white dark:bg-zinc-800"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Invalid email address",
                },
              })}
            />
            {errors.email && (
              <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
            )}
          </div>

          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="bg-white dark:bg-zinc-800"
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters",
                },
              })}
            />
            <div
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute top-1/2 right-3 transform -translate-y-1/2 cursor-pointer text-muted-foreground"
            >
              {showPassword ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />}
            </div>
            {errors.password && (
              <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>
            )}
          </div>

          <div className="flex justify-end">
            <Link
              to="/auth/forgot-password"
              className="text-sm text-orange-500 hover:text-orange-600 hover:underline transition-colors"
            >
              Forgot password?
            </Link>
          </div>

          {serverError && (
            <p className="text-sm text-red-500 text-center">{serverError}</p>
          )}

          <Button type="submit" disabled={loading} className="w-full bg-orange-500 hover:bg-orange-600 text-white cursor-pointer">
            {loading ? "Logging in..." : "Login with Password"}
          </Button>
        </form>
      ) : (
        <div className="space-y-4">
          {!otpSent ? (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Enter your registered college email and we will send you a one-time login code.
                </p>
              </div>

              <div>
                <Input
                  type="email"
                  placeholder="name@college.edu"
                  value={otpEmail}
                  onChange={(e) => {
                    setOtpEmail(e.target.value);
                    setServerError("");
                  }}
                  className="bg-white dark:bg-zinc-800"
                />
              </div>

              {serverError && (
                <p className="text-sm text-red-500 text-center">{serverError}</p>
              )}

              <Button
                type="button"
                onClick={handleSendLoginOtp}
                disabled={loading || !otpEmail}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white cursor-pointer"
              >
                {loading ? "Sending Code..." : "Send Login OTP"}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">
                  Code sent to <span className="text-orange-500">{otpEmail}</span>
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setOtpSent(false);
                    setOtpDigits(Array(OTP_LENGTH).fill(""));
                    setServerError("");
                    setInfoMessage("");
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mt-1 cursor-pointer"
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
                    className="h-12 w-12 text-center text-lg font-semibold"
                  />
                ))}
              </div>

              {infoMessage && (
                <p className="text-emerald-500 text-sm text-center">{infoMessage}</p>
              )}
              {serverError && (
                <p className="text-red-500 text-sm text-center">{serverError}</p>
              )}

              <Button
                type="button"
                onClick={handleVerifyLoginOtp}
                disabled={loading || otpDigits.some((d) => !/^\d$/.test(d))}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white cursor-pointer"
              >
                {loading ? "Verifying..." : "Verify & Login"}
              </Button>

              <div className="flex items-center justify-between text-sm pt-2">
                <span className="text-muted-foreground">Didn't receive the code?</span>
                <button
                  type="button"
                  onClick={handleResendLoginOtp}
                  disabled={countdown > 0 || resending}
                  className="text-orange-500 hover:text-orange-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
