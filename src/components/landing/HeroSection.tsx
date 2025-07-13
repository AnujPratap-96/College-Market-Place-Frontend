// src/components/landing/HeroSection.tsx
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { motion } from "framer-motion";


const images = [
  "https://media.istockphoto.com/id/1087508538/photo/open-book-with-hand-drawn-landscape.jpg?s=612x612&w=0&k=20&c=GUP9eVonIgnhSeB_vcxL2LI694ML7dl6jrJXMlYHiyE=",
  "https://www.shutterstock.com/image-photo/scattered-things-on-floor-concept-600nw-1526438450.jpg",
  "https://media.officedepot.com/image/upload/f_auto,c_limit,w_1920,q_auto/v1686331215/CREATIVE/CREATIVE_2023/SITE/WWW/AEM%20articles/Shot2_June_Bags_012-032_combo_FINAL",
  "https://st3.depositphotos.com/3825437/15099/i/450/depositphotos_150993756-stock-photo-college-students-on-a-lesson.jpg",
  "https://images.stockcake.com/public/c/5/1/c5127991-5237-4e9a-bdf3-5cc6b44ca172_medium/tech-gadgets-display-stockcake.jpg"
];

const HeroSection = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay()]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollTo = useCallback((index: number) => {
    if (emblaApi) emblaApi.scrollTo(index);
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    onSelect();
  }, [emblaApi, onSelect]);

  return (
    <section className="relative h-[90vh] w-full overflow-hidden rounded-3xl mx-auto mt-6 mb-12 shadow-lg">
      {/* Carousel */}
      <div className="absolute inset-0 z-0" ref={emblaRef}>
        <div className="flex h-full">
          {images.map((img, index) => (
            <img
              key={index}
              src={img}
              alt={`Slide ${index + 1}`}
              className="flex-[0_0_100%] object-cover w-full h-full"
            />
          ))}
        </div>
      </div>

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/60 z-10" />

      {/* Text Content */}
      <div className="relative z-20 h-full flex items-center justify-center px-6 container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center space-y-6 max-w-3xl bg-white/10 backdrop-blur-md p-8 rounded-xl shadow-lg cursor-default"
        >

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="text-5xl font-bold leading-tight tracking-tight text-white"
          >
            Welcome to <span className="text-orange-400">CollegeMart</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-lg text-white/80"
          >
            Buy & sell books, gadgets, and essentials with students from your campus.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 mt-6 justify-center"
          >
            <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white">
              <Link to="/auth/signup">Get Started</Link>
            </Button>
            <Button size="lg" variant="secondary" className="border-white/30 hover:bg-white/10">
              <Link to="/auth/login">Login</Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>


      {/* Dot Navigation (inside same file) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            className={`h-3 w-3 rounded-full transition-all duration-300 ${selectedIndex === index ? "bg-orange-400 w-4" : "bg-white/50"
              }`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSection;
