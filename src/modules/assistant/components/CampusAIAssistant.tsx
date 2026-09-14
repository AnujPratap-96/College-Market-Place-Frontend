import React, { useState, useEffect, useRef } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  X,
  Send,
  Package,
  BookOpen,
  Wallet,
  ShieldCheck,
  ChevronRight,
  Filter,
} from "lucide-react";
import { askAssistant } from "../assistant.api";
import type {
  AssistantProduct,
  AssistantOrder,
  AssistantWallet,
} from "../assistant.api";

interface ChatItem {
  id: string;
  role: "user" | "assistant";
  content: string;
  products?: AssistantProduct[];
  orders?: AssistantOrder[];
  wallet?: AssistantWallet;
  timestamp: string;
}

const CATEGORY_OPTIONS = [
  { value: "all", label: "All Categories" },
  { value: "books", label: "Books & Study Material" },
  { value: "stationery", label: "Stationery & Tools" },
  { value: "electronics", label: "Electronics & Gadgets" },
  { value: "cycles", label: "Bicycles & Mobility" },
  { value: "clothing", label: "Clothing & Uniforms" },
  { value: "essentials", label: "Campus Essentials" },
  { value: "furniture", label: "Furniture" },
  { value: "food", label: "Food & Meals" },
  { value: "services", label: "Services & Tutoring" },
  { value: "other", label: "Other" },
];

export const CampusAIAssistant: React.FC = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [inputText, setInputText] = useState<string>("");
  const [isSending, setIsSending] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [messages, setMessages] = useState<ChatItem[]>([
    {
      id: "initial",
      role: "assistant",
      content:
        "Hey there! I am **CampusBuddy**, your campus AI assistant. How can I help you today? You can ask me to find items to buy or rent, check your purchases or sales orders, track handover OTPs, check your wallet balance, or filter by category above!",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending, isOpen]);

  const handleSendMessage = async (textToSend?: string, categoryOverride?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isSending) return;

    const userMessage: ChatItem = {
      id: `usr_${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsSending(true);

    const activeCat = categoryOverride !== undefined ? categoryOverride : selectedCategory;

    try {
      const response = await askAssistant(
        [...messages, userMessage].map((m) => ({
          role: m.role,
          content: m.content,
        })),
        activeCat !== "all" ? activeCat : undefined
      );

      const botMessage: ChatItem = {
        id: `bot_${Date.now()}`,
        role: "assistant",
        content: response.message,
        products: response.products,
        orders: response.orders,
        wallet: response.wallet,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          role: "assistant",
          content:
            "Sorry, I encountered an issue connecting to the campus assistant service. Please check your network connection.",
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    const catObj = CATEGORY_OPTIONS.find((c) => c.value === cat);
    if (cat !== "all") {
      handleSendMessage(`Show available items in ${catObj?.label || cat}`, cat);
    } else {
      handleSendMessage("Show all available campus listings", "all");
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleSendMessage();
  };

  const formatText = (text: string) => {
    const formatted = text
      .replace(/### (.*?)\n/g, '<h4 class="font-bold text-sm my-1 text-foreground">$1</h4>')
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/`([^`]+)`/g, '<code class="bg-muted px-1.5 py-0.5 rounded text-xs font-mono font-bold">$1</code>')
      .replace(/^- (.*?)(?:\n|$)/gm, '<li class="ml-3">$1</li>')
      .replace(/\n\n/g, "<br/><br/>")
      .replace(/\n/g, "<br/>");

    return { __html: formatted };
  };

  return (
    <>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
        aria-label="Open Campus AI Assistant"
      >
        <Sparkles size={20} className="animate-pulse" />
        <span className="font-semibold text-sm hidden sm:inline">Ask CampusBuddy</span>
      </button>

      {isOpen && (
        <div className="fixed bottom-20 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[420px] h-[580px] max-h-[calc(100vh-6rem)] bg-card text-card-foreground border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="bg-gradient-to-r from-orange-600 to-amber-600 text-white p-4 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center font-bold text-base">
                🎓
              </div>
              <div>
                <div className="font-bold text-sm flex items-center gap-1.5">
                  CampusBuddy
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
                </div>
                <div className="text-xs text-white/80">College Marketplace AI</div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
              aria-label="Close Assistant"
            >
              <X size={18} />
            </button>
          </div>

          <div className="bg-muted/60 border-b border-border px-3.5 py-2 flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold shrink-0">
              <Filter size={13} className="text-orange-600" />
              <span>Category:</span>
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="text-xs bg-background border border-border rounded-lg px-2.5 py-1 text-foreground font-medium focus:outline-none focus:ring-1 focus:ring-orange-500 cursor-pointer max-w-[210px] truncate"
            >
              {CATEGORY_OPTIONS.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/20">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${
                  m.role === "user" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-none"
                      : "bg-background border border-border shadow-sm rounded-bl-none text-foreground"
                  }`}
                >
                  <div dangerouslySetInnerHTML={formatText(m.content)} />

                  {m.products && m.products.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        Matched Listings
                      </div>
                      {m.products.map((p) => (
                        <div
                          key={p.id}
                          className="bg-muted/40 hover:bg-muted border border-border/80 rounded-xl p-2.5 transition-colors flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            {p.imageUrl ? (
                              <img
                                src={p.imageUrl}
                                alt={p.title}
                                className="w-11 h-11 rounded-lg object-cover border border-border/60 shrink-0 bg-background"
                                onError={(e) => {
                                  (e.currentTarget as HTMLElement).style.display = "none";
                                }}
                              />
                            ) : (
                              <div className="w-11 h-11 rounded-lg bg-muted flex items-center justify-center text-muted-foreground border border-border/60 shrink-0">
                                <Package size={16} />
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <div className="font-semibold text-xs truncate">
                                {p.title}
                              </div>
                              <div className="text-xs font-bold text-orange-600 mt-0.5 flex items-center gap-1.5 flex-wrap">
                                <span>₹{p.price} • {p.type}</span>
                                <span className="bg-background text-muted-foreground border border-border text-[10px] font-medium px-1.5 py-0.5 rounded capitalize">
                                  {p.category}
                                </span>
                                {p.status === "RENTED" && (
                                  <span className="bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-[10px] font-semibold px-1.5 py-0.5 rounded">
                                    Rent Later
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              navigate(`/dashboard/products/${p.id}`);
                              setIsOpen(false);
                            }}
                            className="shrink-0 text-xs font-semibold bg-background border border-border px-2.5 py-1 rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors flex items-center gap-1"
                          >
                            View <ChevronRight size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {m.orders && m.orders.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        Recent Orders
                      </div>
                      {m.orders.map((o) => (
                        <div
                          key={o.id}
                          className="bg-muted/40 border border-border rounded-xl p-2.5 text-xs space-y-2"
                        >
                          <div className="flex items-center justify-between font-bold">
                            <span className="flex items-center gap-1.5">
                              #{o.orderNumber}
                              <span
                                className={`text-[10px] px-1.5 py-0.5 rounded font-semibold border ${
                                  o.role === "Seller"
                                    ? "bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800"
                                    : "bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                                }`}
                              >
                                {o.role === "Seller" ? "Your Sale" : "Purchase"}
                              </span>
                            </span>
                            <span className="text-orange-600">₹{o.totalAmount}</span>
                          </div>

                          <div className="flex items-center gap-2.5 py-0.5">
                            {o.productImage ? (
                              <img
                                src={o.productImage}
                                alt={o.productTitle}
                                className="w-11 h-11 rounded-lg object-cover border border-border/60 shrink-0 bg-background"
                                onError={(e) => {
                                  (e.currentTarget as HTMLElement).style.display = "none";
                                }}
                              />
                            ) : (
                              <div className="w-11 h-11 rounded-lg bg-muted flex items-center justify-center text-muted-foreground border border-border/60 shrink-0">
                                <Package size={16} />
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <div className="text-foreground truncate font-semibold">
                                {o.productTitle}
                              </div>
                              {o.counterparty && (
                                <div className="text-[11px] text-muted-foreground mt-0.5">
                                  {o.role === "Seller" ? "Buyer: " : "Seller: "}
                                  <span className="font-semibold text-foreground">{o.counterparty}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-1 border-t border-border/40">
                            <span className="bg-background border px-2 py-0.5 rounded text-[10px] font-bold">
                              {o.status}
                            </span>
                            {o.pickupOtp && o.status === "ESCROW_HELD" && (
                              <span className="font-mono font-black text-xs text-orange-600 bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800 px-2 py-0.5 rounded">
                                OTP: {o.pickupOtp}
                              </span>
                            )}
                            {!o.pickupOtp && o.status === "ESCROW_HELD" && o.role === "Seller" && (
                              <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-2 py-0.5 rounded">
                                Ask Buyer OTP
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {m.wallet && (
                    <div className="mt-3 bg-muted/40 border border-border rounded-xl p-3 flex items-center justify-between">
                      <div>
                        <div className="text-xs text-muted-foreground font-semibold">
                          Available Balance
                        </div>
                        <div className="text-base font-extrabold text-emerald-600">
                          ₹{m.wallet.balance.toFixed(2)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground font-semibold">
                          In Escrow
                        </div>
                        <div className="text-sm font-bold text-orange-600">
                          ₹{m.wallet.escrowBalance.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-muted-foreground px-1 mt-1">
                  {m.timestamp}
                </span>
              </div>
            ))}

            {isSending && (
              <div className="flex items-center gap-1.5 p-3 bg-background border border-border rounded-2xl rounded-bl-none w-fit">
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-bounce"></span>
                <span
                  className="w-2 h-2 rounded-full bg-orange-500 animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></span>
                <span
                  className="w-2 h-2 rounded-full bg-orange-500 animate-bounce"
                  style={{ animationDelay: "0.4s" }}
                ></span>
              </div>
            )}

            <div className="flex flex-wrap gap-1.5 pt-2">
              <button
                onClick={() => handleCategoryChange("books")}
                className="inline-flex items-center gap-1 bg-background hover:bg-muted border border-border px-2.5 py-1 rounded-full text-xs font-semibold transition-colors"
              >
                <BookOpen size={12} /> Books
              </button>
              <button
                onClick={() => handleCategoryChange("cycles")}
                className="inline-flex items-center gap-1 bg-background hover:bg-muted border border-border px-2.5 py-1 rounded-full text-xs font-semibold transition-colors"
              >
                🚲 Cycles
              </button>
              <button
                onClick={() => handleCategoryChange("electronics")}
                className="inline-flex items-center gap-1 bg-background hover:bg-muted border border-border px-2.5 py-1 rounded-full text-xs font-semibold transition-colors"
              >
                💻 Electronics
              </button>
              <button
                onClick={() => handleSendMessage("Show my purchases & orders")}
                className="inline-flex items-center gap-1 bg-background hover:bg-muted border border-border px-2.5 py-1 rounded-full text-xs font-semibold transition-colors"
              >
                <Package size={12} /> Purchases & OTP
              </button>
              <button
                onClick={() => handleSendMessage("Show my sell orders & sales")}
                className="inline-flex items-center gap-1 bg-background hover:bg-muted border border-border px-2.5 py-1 rounded-full text-xs font-semibold transition-colors"
              >
                🏷️ My Sales
              </button>
              <button
                onClick={() => handleSendMessage("What is my wallet balance?")}
                className="inline-flex items-center gap-1 bg-background hover:bg-muted border border-border px-2.5 py-1 rounded-full text-xs font-semibold transition-colors"
              >
                <Wallet size={12} /> Wallet
              </button>
              <button
                onClick={() => handleSendMessage("How does escrow and pickup work?")}
                className="inline-flex items-center gap-1 bg-background hover:bg-muted border border-border px-2.5 py-1 rounded-full text-xs font-semibold transition-colors"
              >
                <ShieldCheck size={12} /> Escrow Safety
              </button>
            </div>

            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={onSubmit} className="p-3 bg-card border-t border-border flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask about books, bikes, orders, wallet..."
              className="flex-1 bg-muted/40 border border-input rounded-full px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              disabled={isSending}
            />
            <button
              type="submit"
              disabled={isSending || !inputText.trim()}
              className="w-9 h-9 rounded-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 disabled:opacity-40 text-white flex items-center justify-center transition-all"
              aria-label="Send"
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
