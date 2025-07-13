import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"

const ThankYou = () => {
  const navigate = useNavigate()

  const handleRedirect = () => {
    navigate("/auth/login")
  }

  return (
    <section className="min-h-screen flex items-center justify-center bg-background px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-xl p-10 text-center"
      >
        <h1 className="text-4xl font-bold text-foreground mb-4">
          🎉 Thank You!
        </h1>
        <p className="text-muted-foreground text-lg mb-8">
          Your account has been successfully created.
        </p>
        <Button
          onClick={handleRedirect}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white text-lg font-semibold py-3"
        >
          Go to Login
        </Button>
      </motion.div>
    </section>
  )
}

export default ThankYou
