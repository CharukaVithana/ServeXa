import React, { useState } from "react";
import { ArrowLeft, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";

const ChatSupport: React.FC = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>(
    [
      { sender: "support", text: "Hi there! How can we help you today?" },
    ]
  );
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([...messages, { sender: "user", text: input }]);
    setInput("");

    // Simulated reply
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { sender: "support", text: "Thanks! We'll check and get back to you shortly." },
      ]);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Sidebar />
      {/* Header */}
      <div className="bg-white border-b p-4 flex items-center gap-3 shadow-sm">
        <button onClick={() => navigate("/cus-dashboard")}>
          <ArrowLeft size={22} className="text-gray-700 hover:text-gray-900" />
        </button>
        <h2 className="font-semibold text-lg text-gray-800">Chat with Support</h2>
      </div>

      {/* Chat Box */}
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
      </div>

      {/* Input Box */}
      <div className="p-4 bg-white border-t flex items-center gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 border rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          onClick={handleSend}
          className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};

export default ChatSupport;
