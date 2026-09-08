import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Mail } from "lucide-react";
import Axios from "@/utils/Axios";

type FormValues = { email: string };

const ForgotPassword = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>();
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (data: FormValues) => {
    setServerError("");
    setLoading(true);
    try {
      const response = await Axios.post("/user/forgot-password", { email: data.email });
      if (response.status === 200) {
        const token = response.data?.token;
        if (token) localStorage.setItem("resetToken", token);
        navigate("/auth/reset-otp");
      }
    } catch (error: any) {
      setServerError(
        error?.response?.data?.error || error?.response?.data?.message || "Something went wrong."
      );
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

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
          {errors.email && (
            <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
          )}
        </div>

        {serverError && (
          <p className="text-sm text-red-500 text-center">{serverError}</p>
        )}

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white"
        >
          {loading ? "Sending OTP..." : "Send Reset OTP"}
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
