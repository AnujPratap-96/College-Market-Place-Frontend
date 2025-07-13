import { useForm } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import Axios from "@/utils/Axios"
import { Link, useNavigate } from "react-router-dom"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { motion } from "framer-motion"
import { useState } from "react"
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai"

type SignupFormData = {
  name: string
  password: string
  college: string
  branch: string
  year: string
  phone: string
}

const SignupForm = () => {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<SignupFormData>()

  const onSubmit = async (data: SignupFormData) => {
    
    try{
     const response = await Axios.post("/api/user/complete-signup" , {data});
     if(response.status === 200){
      navigate("/auth/thank-you");
     }
    }
    catch(error){
      console.log(error)
    }
   
  }

  return (
    <section className=" flex items-center justify-center  px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-xl p-8"
      >
        <div className="text-center mb-10">
          <h2 className="text-4xl font-bold leading-tight">
            Create your <span className="text-orange-400">Account</span>
          </h2>
          <p className="text-base text-muted-foreground mt-2">
            Sign up to start buying and selling on your campus.
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6"
        >
          {/* Full Name */}
          <div className="flex flex-col gap-1">
            <Label htmlFor="name" className="text-base font-medium">Full Name</Label>
            <Input
              id="name"
              className="text-base"
              type="text"
              placeholder="John Doe"
              {...register("name", { required: "Name is required" })}
            />
            {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1 relative">
            <Label htmlFor="password" className="text-base font-medium">Password</Label>
            <Input
              id="password"
              className="text-base pr-10"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              {...register("password", {
                required: "Password is required",
                minLength: { value: 6, message: "Minimum 6 characters" },
              })}
            />
            <div
              className="absolute right-3 top-[38px] cursor-pointer text-muted-foreground"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />}
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm">{errors.password.message}</p>
            )}
          </div>

          {/* College */}
          <div className="flex flex-col gap-1">
            <Label htmlFor="college" className="text-base font-medium">College</Label>
            <Input
              id="college"
              className="text-base"
              type="text"
              placeholder="ABC University"
              {...register("college", { required: "College is required" })}
            />
            {errors.college && (
              <p className="text-red-500 text-sm">{errors.college.message}</p>
            )}
          </div>

          {/* Branch */}
          <div className="flex flex-col gap-1">
            <Label htmlFor="branch" className="text-base font-medium">Branch</Label>
            <Input
              id="branch"
              className="text-base"
              type="text"
              placeholder="Computer Science"
              {...register("branch", { required: "Branch is required" })}
            />
            {errors.branch && (
              <p className="text-red-500 text-sm">{errors.branch.message}</p>
            )}
          </div>

          {/* Year */}
          <div className="flex flex-col gap-1 ">
            <Label htmlFor="year" className="text-base font-medium">Year</Label>
            <Select onValueChange={(val) => setValue("year", val)}>
              <SelectTrigger className="text-base">
                <SelectValue placeholder="Select Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1st Year">1st Year</SelectItem>
                <SelectItem value="2nd Year">2nd Year</SelectItem>
                <SelectItem value="3rd Year">3rd Year</SelectItem>
                <SelectItem value="4th Year">4th Year</SelectItem>
              </SelectContent>
            </Select>
            {errors.year && <p className="text-red-500 text-sm">Year is required</p>}
          </div>

          {/* Phone */}
          <div className="flex flex-col gap-1">
            <Label htmlFor="phone" className="text-base font-medium">Phone</Label>
            <Input
              id="phone"
              className="text-base"
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
            {errors.phone && (
              <p className="text-red-500 text-sm">{errors.phone.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="col-span-full pt-4">
            <Button
              size="lg"
              type="submit"
              className="w-full text-lg font-semibold bg-orange-500 hover:bg-orange-600 text-white py-3"
            >
              Sign Up
            </Button>
          </div>
        </form>

        <p className="text-center text-base text-muted-foreground mt-8">
          Already have an account?{" "}
          <Link to="/auth/login" className="text-orange-400 font-semibold hover:underline">
            Login
          </Link>
        </p>
      </motion.div>
    </section>
  )
}

export default SignupForm
