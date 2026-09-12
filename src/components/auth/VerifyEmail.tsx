import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import Axios from "@/utils/Axios";
import { useState } from "react";
import { toast } from "@/components/ui/toast";

type FormValues = {
  email: string;
};

const VerifyEmail = () => {
  const { register, handleSubmit } = useForm<FormValues>();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onInvalid = (errors: any) => {
    const firstError = Object.values(errors)[0] as any;
    if (firstError?.message) {
      toast.error(firstError.message);
    }
  };

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    try {
      const response = await Axios.post("/user/signup-email", { email: data.email });
      if (response.status === 200) {
        const token = response?.data?.data?.token || response?.data?.token;
        if (token) localStorage.setItem("signupToken", token);
        localStorage.setItem("signupEmail", data.email);
        toast.info(`Verification code sent to ${data.email}`);
        navigate("/auth/verify-otp");
      }
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.message || error?.response?.data?.error || "Failed to send OTP. Please try again.";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit, onInvalid)}>
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
      </div>

      <Button
        size="lg"
        type="submit"
        disabled={loading}
        className="w-full text-lg font-semibold bg-orange-500 hover:bg-orange-600 text-white py-3"
      >
        {loading ? "Sending OTP..." : "Send OTP"}
      </Button>
    </form>
  );
};

export default VerifyEmail;
