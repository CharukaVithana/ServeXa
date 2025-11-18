import React, { useState } from "react";
import { ArrowLeft, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";

const ChatSupport: React.FC = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([
    { sender: "support", text: "Hi there! 👋 How can I assist you today?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages((prev) => [...prev, { sender: "user", text: userMessage }]);
    setInput("");
    setLoading(true);

    try {
      // Call your backend AI endpoint (or directly OpenAI API)
      const response = await fetch("http://127.0.0.1:5000/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          sender: "support",
          text: data.reply || "Sorry, I didn't understand that.",
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "support",
          text: "⚠️ There was a problem connecting to the support server.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex bg-gray-50 text-slate-800 h-screen overflow-hidden">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full z-20">
        <Sidebar />
      </div>

      {/* Main Chat Section */}
      <div className="flex-1 ml-64 flex flex-col h-screen">
        {/* Header */}
        <div className="bg-white border-b p-4 flex items-center gap-3 shadow-sm">
          <button onClick={() => navigate("/cus-dashboard")}>
            <ArrowLeft
              size={22}
              className="text-gray-700 hover:text-gray-900"
            />
          </button>
          <h2 className="font-semibold text-lg text-gray-800">
            Chat with Support
          </h2>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`px-4 py-2 rounded-lg max-w-xs ${
                  msg.sender === "user"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-800"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="px-4 py-2 bg-gray-200 text-gray-600 rounded-lg max-w-xs animate-pulse">
                Typing...
              </div>
            </div>
          )}
        </div>

        {/* Input Box */}
        <div className="p-4 bg-white border-t flex items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type your message..."
            className="flex-1 border rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            onClick={handleSend}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full disabled:opacity-50"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatSupport;
