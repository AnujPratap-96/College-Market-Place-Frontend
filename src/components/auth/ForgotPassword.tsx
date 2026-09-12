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
    <div className="space-y-6 bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-md border border-zinc-200 dark:border-zinc-700 max-w-md mx-auto">
      <div className="text-center">
        <div className="bg-orange-100 dark:bg-orange-500/10 p-3 rounded-full inline-flex mb-3">
          <Mail className="w-6 h-6 text-orange-500" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Forgot Password?</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Enter your email and we'll send you a reset OTP.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-4">
        <div>
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            className="mt-1"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Enter a valid email address",
              },
            })}
          />
        </div>

        <Button
          type="submit"
          disabled={loading || retryCooldown > 0}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center gap-2 cursor-pointer"
        >
          {loading ? (
            "Sending OTP..."
          ) : retryCooldown > 0 ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Retry in {retryCooldown}s
            </>
          ) : (
            "Send Reset OTP"
          )}
        </Button>
      </form>

      <div className="text-center">
        <Link
          to="/auth/login"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3 h-3" />
          Back to Login
        </Link>
      </div>
    </div>
  );
};

export default ForgotPassword;
