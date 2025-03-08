import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import "./index.css";

const socket = io("https://chatbot-backend-h8d0.onrender.com/", {
  path: "/socket.io/",
  transports: ["websocket"],
});

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const handleMessage = (data) => {
      setIsTyping(false);
      setMessages((prev) => [...prev, { text: data.message, sender: data.sender }]);
    };

    const handleTyping = () => {
      setIsTyping(true);
    };

    socket.on("receive_message", handleMessage);
    socket.on("bot_typing", handleTyping);

    return () => {
      socket.off("receive_message", handleMessage);
      socket.off("bot_typing", handleTyping);
    };
  }, []);

  const sendMessage = () => {
    if (input.trim()) {
      const newMessage = { text: input, sender: "user" };
      setMessages((prev) => [...prev, newMessage]);
      socket.emit("send_message", { message: input });
      setIsTyping(true);
      setInput("");
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <div className="w-full max-w-md p-4 bg-white rounded-lg shadow-lg">
        <div className="flex flex-col items-center mb-4 bg-gray-200">
          <img src="/chatbot.gif" alt="Chatbot" className="h-20 w-20 mb-2" />
          <h1 className="text-xl font-semibold text-gray-700">Chatbot Assistant</h1>
        </div>
        <div className="h-96 overflow-y-auto border-b p-2 space-y-2">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg max-w-xs ${
                msg.sender === "user"
                  ? "bg-blue-500 text-white self-end ml-auto"
                  : "bg-gray-300 text-black self-start"
              }`}
            >
              {msg.text}
            </div>
          ))}
          {isTyping && (
            <div className="p-3 bg-gray-300 text-black self-start rounded-lg max-w-xs">
              Bot is typing <span className="dot">.</span>
              <span className="dot">.</span>
              <span className="dot">.</span>
            </div>
          )}
        </div>
        <div className="flex mt-2">
          <input
            type="text"
            className="flex-1 p-3 border rounded-l-lg focus:outline-none"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            onKeyDown={handleKeyPress}
          />
          <button
            className="p-3 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600"
            onClick={sendMessage}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;


