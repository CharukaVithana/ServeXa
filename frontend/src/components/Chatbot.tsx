import React, { useState, useEffect, useRef } from "react";
import type { KeyboardEvent } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import chatbotIcon from "../assets/ChatbotIcon.png";
import { useAuth } from "../hooks/useAuth";
import ReactMarkdown from "react-markdown";
import { useNavigate } from "react-router-dom";

interface Message {
  sender: "user" | "bot";
  text: string;
}

const CHATBOT_API_URL =
  import.meta.env.VITE_CHATBOT_SERVICE_URL || "http://localhost:8086";

const Chatbot: React.FC = () => {
  const { user } = useAuth(); // get logged-in user
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "bot",
      text: "👋 Hi there! I’m Servexa AI — your personal assistant. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Debug: Check localStorage when component mounts
  useEffect(() => {
    console.log("=== Chatbot Debug Info ===");
    console.log("User from context:", user);
    console.log("localStorage authToken:", localStorage.getItem("authToken"));
    console.log("localStorage token:", localStorage.getItem("token"));
    console.log("All localStorage keys:", Object.keys(localStorage));
    console.log("=========================");
  }, [user]);

  const handleSendMessage = async (message?: string) => {
    const userMessage = message?.trim() || input.trim();
    if (!userMessage) return;

    // user.id from auth context
    const customerId = user?.id;

    // Only warn if user asks for personal info and is not logged in
    if (!customerId && /my|me|my name|my car|my email/i.test(userMessage)) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "⚠️ Please log in to access your personal information.",
        },
      ]);
      return;
    }

    setMessages((prev) => [...prev, { sender: "user", text: userMessage }]);
    setInput("");
    setLoading(true);

    try {
      // Get auth token from localStorage - check both possible keys
      const token =
        localStorage.getItem("authToken") || localStorage.getItem("token");
      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
        console.log("Sending request with auth token");
      } else {
        console.log("No auth token found in localStorage");
      }

      const res = await fetch(`${CHATBOT_API_URL}/api/chat`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          question: userMessage,
          customer_id: customerId,
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: data.answer || "Sorry, I couldn’t understand that.",
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "⚠️ Connection error. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSendMessage();
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-red-600 to-rose-600 hover:opacity-90 text-white p-4 rounded-full shadow-2xl transition-all hover:scale-110"
        >
          <MessageCircle size={26} />
        </button>
      )}

      {isOpen && (
        <div className="w-[370px] h-[580px] bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200">
          <div className="bg-gradient-to-r from-red-600 to-rose-500 text-white flex items-center justify-between px-4 py-3 shadow-md">
            <div className="flex items-center space-x-3">
              <img
                src={chatbotIcon}
                alt="Chatbot Icon"
                className="w-12 h-12 rounded-full border-2 border-white"
              />
              <div>
                <h2 className="font-semibold text-lg">Servexa AI Assistant</h2>
                <p className="text-xs text-gray-100">Always here to help 🚗</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:text-gray-300 transition-transform transform hover:scale-110"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto bg-gradient-to-br from-gray-50 to-gray-100 space-y-3">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex transition-all duration-300 ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`px-4 py-2.5 rounded-2xl max-w-[80%] text-sm shadow-sm ${
                    msg.sender === "user"
                      ? "bg-gradient-to-r from-red-500 to-rose-500 text-white"
                      : "bg-white text-gray-800 border border-gray-200"
                  }`}
                >
                  {msg.sender === "user" ? (
                    msg.text
                  ) : (
                    <ReactMarkdown
                      components={{
                        a: ({ href, children }) => (
                          <a
                            href={href}
                            onClick={(e) => {
                              e.preventDefault();
                              if (href) {
                                navigate(href);
                                setIsOpen(false);
                              }
                            }}
                            className="text-blue-600 hover:text-blue-800 underline cursor-pointer"
                          >
                            {children}
                          </a>
                        ),
                        p: ({ children }) => <p className="mb-2">{children}</p>,
                        strong: ({ children }) => (
                          <strong className="font-semibold">{children}</strong>
                        ),
                      }}
                    >
                      {msg.text}
                    </ReactMarkdown>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-center space-x-1 text-gray-500 text-sm italic pl-2">
                <div className="flex space-x-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-300"></span>
                </div>
                <span>Assistant is typing...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="flex items-center border-t bg-white/90 px-3 py-2 shadow-inner">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-rose-400 transition"
              disabled={loading}
            />
            <button
              onClick={() => handleSendMessage()}
              className="ml-2 bg-gradient-to-r from-red-500 to-rose-500 text-white p-2 rounded-full hover:scale-110 transition disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading || !input.trim()}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
