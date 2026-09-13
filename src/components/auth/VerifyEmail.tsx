import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import Axios from "@/utils/Axios";
import { useState } from "react";
import { toast } from "@/components/ui/toast";
import { Mail, ShieldCheck, Sparkles } from "lucide-react";

type FormValues = {
  email: string;
};

const COLLEGE_DOMAINS = [
  "college.edu",
  ".ac.in",
  "university.edu",
  "iit.ac.in",
  "nit.ac.in",
  "edu.in",
];

const VerifyEmail = () => {
  const { register, handleSubmit, setValue } = useForm<FormValues>();
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
    <div className="space-y-5 w-full">
      <div className="text-center space-y-1.5 pb-1">
        <div className="inline-flex p-3 rounded-2xl bg-orange-500/10 text-orange-600 dark:text-orange-400 mb-1">
          <Sparkles className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Join Your Campus Network</h2>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto">
          Enter your university email to verify student status and unlock your college circle.
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit(onSubmit, onInvalid)}>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">University Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="email"
              placeholder="rollnumber@college.edu or .ac.in"
              className="pl-10 h-11 rounded-xl bg-background/50 border-border/70 focus-visible:ring-orange-500"
              {...register("email", {
                required: "College email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Please enter a valid email address",
                },
              })}
            />
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {COLLEGE_DOMAINS.map((domain) => (
              <button
                key={domain}
                type="button"
                onClick={() => {
                  const currentValue = (register("email") as any)?.value || "";
                  if (currentValue.includes("@")) {
                    const localPart = currentValue.split("@")[0];
                    setValue("email", `${localPart}@${domain}`, { shouldValidate: true });
                  } else {
                    setValue("email", `${currentValue}${currentValue ? "@" : ""}${domain}`, { shouldValidate: true });
                  }
                }}
                className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-orange-500/8 text-orange-600 dark:text-orange-400 border border-orange-500/15 hover:bg-orange-500/15 hover:border-orange-500/30 transition-all cursor-pointer"
              >
                {domain}
              </button>
            ))}
          </div>
        </div>

        <Button
          size="lg"
          type="submit"
          disabled={loading}
          className="w-full h-11 text-sm font-semibold rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-700 text-white shadow-md shadow-orange-500/20 cursor-pointer transition-all"
        >
          {loading ? "Sending Verification Code..." : "Send Verification OTP"}
        </Button>
      </form>

      <div className="p-3 rounded-xl bg-muted/60 border border-border/60 flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          <strong>100% Peer Verified:</strong> Only students with verified campus domains can access your campus listings, keeping your transactions safe from non-college scammers.
        </p>
      </div>
    </div>
  );
};

export default VerifyEmail;
