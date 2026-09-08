import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { useState } from "react";
import Axios from "@/utils/Axios";
import { useNavigate, Link, useLocation } from "react-router-dom";
import useFetchUser from "@/hooks/useFetchUser";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

type FormValues = {
  email: string;
  password: string;
};

const LoginForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>();
  const [serverError, setServerError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { fetchUser } = useFetchUser();

  const successMessage = (location.state as any)?.message || "";

  const onSubmit = async (data: FormValues) => {
    setServerError("");
    setLoading(true);
    try {
      const response = await Axios.post("/user/login", data);
      if (response.status === 200) {
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

  return (
    <form
      className="space-y-4 bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-md border border-zinc-200 dark:border-zinc-700 max-w-md mx-auto"
      onSubmit={handleSubmit(onSubmit)}
    >
      {successMessage && (
        <p className="text-sm text-green-500 text-center bg-green-500/10 p-2 rounded-lg">
          {successMessage}
        </p>
      )}

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

      <Button type="submit" disabled={loading} className="w-full bg-orange-500 hover:bg-orange-600 text-white">
        {loading ? "Logging in..." : "Login"}
      </Button>
    </form>
  );
};

export default LoginForm;
