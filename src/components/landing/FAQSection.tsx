// src/components/landing/FAQSection.tsx
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { motion } from "framer-motion";

const faqs = [
  {
    question: "Is it free to use?",
    answer: "Yes, CollegeMart is completely free for all students to buy and sell.",
  },
  {
    question: "What items can I sell?",
    answer:
      "You can sell books, gadgets, notes, electronics, accessories, and more — as long as it's legal.",
  },
  {
    question: "How is user verification done?",
    answer:
      "We verify users via their official college email and a secure OTP process.",
  },
  {
    question: "Can I edit or remove a listing?",
    answer:
      "Yes, you can update or delete your listings anytime from your dashboard.",
  },
  {
    question: "Who can view my listings?",
    answer:
      "Only students from your verified college can view and interact with your listings.",
  },
  {
    question: "Is there a messaging feature?",
    answer:
      "Yes, you can securely message buyers or sellers directly through the platform.",
  },
];

const FAQSection = () => {
  return (
    <section className="py-24 px-6 bg-background border-t border-border">
      <div className="max-w-4xl mx-auto text-center space-y-12">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-4xl font-bold tracking-tight"
        >
          Frequently Asked <span className="text-orange-400">Questions</span>
        </motion.h2>

        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Accordion
                type="single"
                collapsible
                className="rounded-xl bg-white/10 backdrop-blur-md border border-white/20 shadow-md px-6 py-4 text-left transition-all duration-300 hover:shadow-lg"
              >
                <AccordionItem value={`item-${index}`}>
                  <AccordionTrigger className="text-lg font-medium">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-foreground/80">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
