import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Axios from "@/utils/Axios";
import { Link, useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { User, Lock, GraduationCap, BookOpen, Phone, Sparkles } from "lucide-react";
import { toast } from "@/components/ui/toast";

type SignupFormData = {
  name: string;
  password: string;
  college: string;
  branch: string;
  year: string;
  phone: string;
};

const SignupForm = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
  } = useForm<SignupFormData>();

  const onInvalid = (formErrors: any) => {
    const firstError = Object.values(formErrors)[0] as any;
    if (firstError?.message) {
      toast.error(firstError.message);
    } else {
      toast.error("Please fill in all required fields.");
    }
  };

  const onSubmit = async (data: SignupFormData) => {
    const token = localStorage.getItem("signupToken");
    if (!token) {
      navigate("/auth/signup");
      return;
    }
    setLoading(true);
    try {
      const response = await Axios.post(
        "/user/complete-signup",
        { ...data },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.status === 200 || response.status === 201 || response.data?.success) {
        localStorage.removeItem("signupToken");
        const authToken = response.data?.data?.token || response.data?.token;
        if (authToken) {
          localStorage.setItem("authToken", authToken);
        }
        toast.success("Account created successfully! Welcome to CollegeMart.");
        navigate("/auth/thank-you");
      }
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        "Signup failed. Please try again.";

      if (
        errorMsg.toLowerCase().includes("already registered") ||
        errorMsg.toLowerCase().includes("already associated") ||
        errorMsg.toLowerCase().includes("already exists")
      ) {
        toast.error("Account already exists with this email. Please log in.");
        setTimeout(() => navigate("/auth/login"), 2000);
      } else {
        toast.error(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5 w-full">
      <div className="text-center space-y-1">
        <div className="inline-flex p-2.5 rounded-2xl bg-orange-500/10 text-orange-600 dark:text-orange-400 mb-1">
          <Sparkles className="w-5 h-5" />
        </div>
        <h2 className="text-xl font-bold text-foreground">
          Complete Your Student Profile
        </h2>
        <p className="text-xs text-muted-foreground">
          Enter your college details to set up your verified marketplace account.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-3.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="space-y-1">
            <Label htmlFor="name" className="text-xs font-semibold text-foreground">Full Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="name"
                className="pl-9 h-10 rounded-xl bg-background/50 border-border/70 text-xs sm:text-sm focus-visible:ring-orange-500"
                type="text"
                placeholder="Anuj Pratap"
                {...register("name", { required: "Name is required" })}
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="password" className="text-xs font-semibold text-foreground">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="password"
                className="pl-9 pr-9 h-10 rounded-xl bg-background/50 border-border/70 text-xs sm:text-sm focus-visible:ring-orange-500"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                {...register("password", {
                  required: "Password is required",
                  minLength: { value: 6, message: "At least 6 characters" },
                })}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground hover:text-foreground"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? <AiOutlineEyeInvisible size={16} /> : <AiOutlineEye size={16} />}
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <Label htmlFor="college" className="text-xs font-semibold text-foreground">College / University Name</Label>
          <div className="relative">
            <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="college"
              className="pl-9 h-10 rounded-xl bg-background/50 border-border/70 text-xs sm:text-sm focus-visible:ring-orange-500"
              type="text"
              placeholder="e.g. IIT Bombay, BITS Pilani, NIT Trichy"
              {...register("college", { required: "College is required" })}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="space-y-1">
            <Label htmlFor="branch" className="text-xs font-semibold text-foreground">Branch / Major</Label>
            <div className="relative">
              <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="branch"
                className="pl-9 h-10 rounded-xl bg-background/50 border-border/70 text-xs sm:text-sm focus-visible:ring-orange-500"
                type="text"
                placeholder="Computer Science"
                {...register("branch", { required: "Branch is required" })}
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="year" className="text-xs font-semibold text-foreground">Batch / Year</Label>
            <Select onValueChange={(val) => setValue("year", val, { shouldValidate: true })}>
              <SelectTrigger className="h-10 rounded-xl bg-background/50 border-border/70 text-xs sm:text-sm focus:ring-orange-500">
                <SelectValue placeholder="Select Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1st Year">1st Year (Freshman)</SelectItem>
                <SelectItem value="2nd Year">2nd Year (Sophomore)</SelectItem>
                <SelectItem value="3rd Year">3rd Year (Junior)</SelectItem>
                <SelectItem value="4th Year">4th Year (Senior)</SelectItem>
                <SelectItem value="Postgraduate">Postgraduate / PhD</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1">
          <Label htmlFor="phone" className="text-xs font-semibold text-foreground">Phone Number (For Campus Handshake OTPs)</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="phone"
              className="pl-9 h-10 rounded-xl bg-background/50 border-border/70 text-xs sm:text-sm focus-visible:ring-orange-500"
              type="tel"
              placeholder="9876543210"
              {...register("phone", {
                required: "Phone is required",
                pattern: {
                  value: /^[0-9]{10}$/,
                  message: "Enter a valid 10-digit number",
                },
              })}
            />
          </div>
        </div>

        <Button
          size="lg"
          type="submit"
          disabled={loading}
          className="w-full h-11 mt-2 text-sm font-semibold rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-700 text-white shadow-md shadow-orange-500/20 cursor-pointer transition-all"
        >
          {loading ? "Setting Up Account..." : "Create Verified Account"}
        </Button>
      </form>

      <p className="text-center text-xs text-muted-foreground pt-1">
        Already registered?{" "}
        <Link to="/auth/login" className="text-orange-600 hover:text-orange-500 font-semibold hover:underline">
          Sign In
        </Link>
      </p>
    </div>
  );
};

export default SignupForm;
