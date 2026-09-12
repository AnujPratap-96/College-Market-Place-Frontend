import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { KeyRound } from "lucide-react";
import Axios from "@/utils/Axios";
import { toast } from "@/components/ui/toast";

type FormValues = {
  password: string;
  confirmPassword: string;
};

const ResetPassword = () => {
  const { register, handleSubmit, watch } = useForm<FormValues>();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onInvalid = (errors: any) => {
    const firstError = Object.values(errors)[0] as any;
    if (firstError?.message) {
      toast.error(firstError.message);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("resetToken");
    if (!token) navigate("/auth/forgot-password");
  }, [navigate]);

  const onSubmit = async (data: FormValues) => {
    const token = localStorage.getItem("resetToken");
    if (!token) {
      navigate("/auth/forgot-password");
      return;
    }

    setLoading(true);
    try {
      const response = await Axios.post(
        "/user/reset-password",
        { password: data.password },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.status === 200) {
        localStorage.removeItem("resetToken");
        toast.success("Password reset successfully. Please log in.");
        navigate("/auth/login", { state: { message: "Password reset successfully. Please log in." } });
      }
    } catch (error: any) {
      const msg =
        error?.response?.data?.error || error?.response?.data?.message || "Something went wrong.";
      toast.error(msg);
      if (
        msg.toLowerCase().includes("expired") ||
        msg.toLowerCase().includes("unauthorized") ||
        msg.toLowerCase().includes("token")
      ) {
        setTimeout(() => {
          navigate("/auth/forgot-password");
        }, 1500);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-md border border-zinc-200 dark:border-zinc-700 max-w-md mx-auto">
      <div className="text-center">
        <div className="bg-orange-100 dark:bg-orange-500/10 p-3 rounded-full inline-flex mb-3">
          <KeyRound className="w-6 h-6 text-orange-500" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Set New Password</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Choose a strong password for your account.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-4">
        <div>
          <Label htmlFor="password">New Password</Label>
          <div className="relative mt-1">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className="pr-10"
              {...register("password", {
                required: "Password is required",
                minLength: { value: 6, message: "Minimum 6 characters" },
              })}
            />
            <div
              onClick={() => setShowPassword((p) => !p)}
              className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-muted-foreground"
            >
              {showPassword ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />}
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <div className="relative mt-1">
            <Input
              id="confirmPassword"
              type={showConfirm ? "text" : "password"}
              placeholder="••••••••"
              className="pr-10"
              {...register("confirmPassword", {
                required: "Please confirm your password",
                validate: (val) => val === watch("password") || "Passwords do not match",
              })}
            />
            <div
              onClick={() => setShowConfirm((p) => !p)}
              className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-muted-foreground"
            >
              {showConfirm ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />}
            </div>
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white"
        >
          {loading ? "Resetting..." : "Reset Password"}
        </Button>
      </form>

      <div className="text-center">
        <Link
          to="/auth/login"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Back to Login
        </Link>
      </div>
    </div>
  );
};

export default ResetPassword;
