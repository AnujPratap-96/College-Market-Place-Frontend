import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

const FAQS = [
  {
    question: "How does the 6-Digit OTP Escrow Handshake work?",
    answer:
      "When a buyer clicks 'Buy Now' or wins an auction, their payment is locked safely in the CollegeMart campus escrow. The seller cannot touch these funds yet. Both parties arrange a convenient meetup on campus (e.g. at the library, student cafeteria, or hostel lobby). After the buyer inspects and tests the item, they share a 6-digit OTP from their screen with the seller. Once the seller inputs this OTP, the escrow funds are immediately transferred to the seller's wallet.",
  },
  {
    question: "Can someone from outside my college view or buy my items?",
    answer:
      "No. CollegeMart is built exclusively for verified university communities. Only students with a verified college email (@college.edu, @iitb.ac.in, @bits.ac.in, etc.) can access your campus circle. This ensures 100% of trades happen between real peers on campus grounds.",
  },
  {
    question: "How do Senior Move-Out Live Auctions work?",
    answer:
      "Graduating seniors or students leaving their hostels can put large items (like mini-fridges, coolers, monitors, cycles, or book bundles) on a 24-hour live auction. Students place bids directly from their wallet. If you are outbid by another student, your held bid amount is immediately refunded back to your available balance in real time. The winning bidder gets a pickup OTP to collect the item.",
  },
  {
    question: "What happens if an item is not as described during the meetup?",
    answer:
      "Since funds are held in escrow, you never lose your money. If the item is defective, damaged, or not as promised, you simply do not give the seller the 6-digit OTP. You can tap 'Cancel Order' or 'Raise Dispute', and your full payment is returned to your wallet.",
  },
  {
    question: "How do I withdraw money to my UPI or bank account?",
    answer:
      "Whenever you sell an item, deliver a campus gig, or finish an auction, your earnings are deposited directly into your CollegeMart wallet. From the wallet dashboard, you can request an instant withdrawal to your verified UPI ID or bank account anytime with 0 hassle.",
  },
  {
    question: "Are there any hidden platform fees for buyers?",
    answer:
      "No. Buying textbooks, gear, and booking peer tutoring on CollegeMart comes with zero hidden fees for students. We believe peer-to-peer campus essentials should remain accessible and affordable for everyone.",
  },
];

const FAQSection = () => {
  return (
    <section id="faq" className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto border-t border-border/80">
      <div className="text-center space-y-4 mb-14">
        <Badge variant="outline" className="px-3 py-1 text-xs font-semibold text-orange-600 border-orange-400/40 bg-orange-500/10">
          CLEAR ANSWERS
        </Badge>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground">
          Frequently Asked Questions
        </h2>
        <p className="text-muted-foreground text-base sm:text-lg">
          Everything you need to know about campus trading, escrow security, and senior auctions.
        </p>
      </div>

      <div className="space-y-4">
        {FAQS.map((faq, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.08 }}
          >
            <Accordion
              type="single"
              collapsible
              className="rounded-2xl bg-card border border-border/80 shadow-xs px-6 py-2 transition-all hover:border-orange-500/30"
            >
              <AccordionItem value={`item-${index}`} className="border-b-0">
                <AccordionTrigger className="text-base sm:text-lg font-bold text-foreground text-left py-4 hover:no-underline hover:text-orange-500 transition-colors">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm sm:text-base text-muted-foreground leading-relaxed pb-4 pt-1">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default FAQSection;
