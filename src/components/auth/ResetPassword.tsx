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
    <div className="space-y-5 w-full">
      <div className="text-center space-y-1">
        <div className="inline-flex p-3 rounded-2xl bg-orange-500/10 text-orange-600 dark:text-orange-400 mb-1">
          <KeyRound className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Create New Password</h2>
        <p className="text-xs text-muted-foreground">
          Choose a strong password for your verified campus account.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-xs font-semibold text-foreground">New Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className="pr-10 h-11 rounded-xl bg-background/50 border-border/70 focus-visible:ring-orange-500"
              {...register("password", {
                required: "Password is required",
                minLength: { value: 6, message: "Minimum 6 characters" },
              })}
            />
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              className="absolute top-1/2 right-3.5 -translate-y-1/2 cursor-pointer text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <AiOutlineEyeInvisible size={18} /> : <AiOutlineEye size={18} />}
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword" className="text-xs font-semibold text-foreground">Confirm New Password</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirm ? "text" : "password"}
              placeholder="••••••••"
              className="pr-10 h-11 rounded-xl bg-background/50 border-border/70 focus-visible:ring-orange-500"
              {...register("confirmPassword", {
                required: "Please confirm your password",
                validate: (val) => val === watch("password") || "Passwords do not match",
              })}
            />
            <button
              type="button"
              onClick={() => setShowConfirm((p) => !p)}
              className="absolute top-1/2 right-3.5 -translate-y-1/2 cursor-pointer text-muted-foreground hover:text-foreground"
            >
              {showConfirm ? <AiOutlineEyeInvisible size={18} /> : <AiOutlineEye size={18} />}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-11 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-700 text-white font-semibold shadow-md shadow-orange-500/20 cursor-pointer transition-all"
        >
          {loading ? "Updating Password..." : "Update Password & Sign In"}
        </Button>
      </form>

      <div className="text-center pt-1">
        <Link
          to="/auth/login"
          className="text-xs text-muted-foreground hover:text-foreground transition-colors font-medium"
        >
          Return to Sign In
        </Link>
      </div>
    </div>
  );
};

export default ResetPassword;
