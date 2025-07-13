import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import Axios from "@/utils/Axios";
import { useState } from "react";

type FormValues = {
  email: string;
};

const VerifyEmail = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>();
  const [serverError, setServerError] = useState("");
  const navigate = useNavigate();

  const verifyEmail = async (email: string) => {
    setServerError("");
    try {
      const response = await Axios.post("/api/user/signup-email", { email });
      if (response.status === 200) {
        const token = response?.data?.token;
        localStorage.setItem("signupToken", token);
        navigate("/auth/verify-otp");
      }
    } catch (error: any) {
      setServerError(
        error?.response?.data?.message || "Failed to send OTP. Please try again."
      );
    }
  };

  const onSubmit = (data: FormValues) => {
    verifyEmail(data.email);
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div>
        <Input
          type="email"
          placeholder="Enter your college email"
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

      <Button type="submit" className="w-full">
        Send OTP
      </Button>
    </form>
  );
};

export default VerifyEmail;
