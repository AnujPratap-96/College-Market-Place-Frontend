import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Mail, RefreshCw } from "lucide-react";
import Axios from "@/utils/Axios";
import { toast } from "@/components/ui/toast";

type FormValues = { email: string };

const ForgotPassword = () => {
  const defaultEmail = typeof window !== "undefined" ? localStorage.getItem("resetEmail") || "" : "";
  const { register, handleSubmit } = useForm<FormValues>({
    defaultValues: { email: defaultEmail },
  });
  const [loading, setLoading] = useState(false);
  const [retryCooldown, setRetryCooldown] = useState(0);
  const navigate = useNavigate();

  const onInvalid = (errors: any) => {
    const firstError = Object.values(errors)[0] as any;
    if (firstError?.message) {
      toast.error(firstError.message);
    }
  };

  useEffect(() => {
    if (retryCooldown <= 0) return;
    const timer = setInterval(() => {
      setRetryCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [retryCooldown]);

  const onSubmit = async (data: FormValues) => {
    if (retryCooldown > 0) return;
    setLoading(true);
    try {
      const response = await Axios.post("/user/forgot-password", { email: data.email });
      if (response.status === 200) {
        const token = response.data?.token;
        if (token) localStorage.setItem("resetToken", token);
        localStorage.setItem("resetEmail", data.email);
        toast.info(`Password reset OTP sent to ${data.email}`);
        navigate("/auth/reset-otp");
      }
    } catch (error: any) {
      const msg =
        error?.response?.data?.message || error?.response?.data?.error || "Something went wrong.";
      toast.error(msg);
      if (error?.response?.status === 429 || msg.toLowerCase().includes("recently sent")) {
        setRetryCooldown(60);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5 w-full">
      <div className="text-center space-y-1">
        <div className="inline-flex p-3 rounded-2xl bg-orange-500/10 text-orange-600 dark:text-orange-400 mb-1">
          <Mail className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Reset Password</h2>
        <p className="text-xs text-muted-foreground">
          Enter your registered college email and we will send a password reset code.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-xs font-semibold text-foreground">College Email Address</Label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="you@college.edu"
              className="pl-10 h-11 rounded-xl bg-background/50 border-border/70 focus-visible:ring-orange-500"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Enter a valid email address",
                },
              })}
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading || retryCooldown > 0}
          className="w-full h-11 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-700 text-white font-semibold shadow-md shadow-orange-500/20 cursor-pointer transition-all"
        >
          {loading ? (
            "Sending Reset Code..."
          ) : retryCooldown > 0 ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Retry in {retryCooldown}s
            </>
          ) : (
            "Send Password Reset Code"
          )}
        </Button>
      </form>

      <div className="text-center pt-2">
        <Link
          to="/auth/login"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Sign In
        </Link>
      </div>
    </div>
  );
};

export default ForgotPassword;
