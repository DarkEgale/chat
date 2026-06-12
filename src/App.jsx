import { io } from "socket.io-client";
import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";

const socket = io("https://chat-backend-nq8f.onrender.com/");

export default function App() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const bottomRef = useRef(null);

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected:", socket.id);
      socket.emit("join-room", "room1");
    });

    socket.on("send-message", (data) => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + Math.random(),
          text: data.text,
          sender: "other",
          createdAt: new Date(),
        },
      ]);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected");
    });

    return () => {
      socket.off("connect");
      socket.off("send-message");
      socket.off("disconnect");
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  const handleMessage = (e) => {
    e.preventDefault();

    if (!message.trim()) return;

    const newMessage = {
      id: Date.now(),
      text: message,
      sender: "me",
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);

    socket.emit("message", "room1", {
      text: message,
    });

    setMessage("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl h-[85vh] rounded-3xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl">
        {/* Header */}
        <div className="h-20 px-6 flex items-center justify-between border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                R
              </div>

              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900" />
            </div>

            <div>
              <h2 className="text-white font-semibold text-lg">Room Chat</h2>
              <p className="text-sm text-slate-400">Connected to room1</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="h-[calc(100%-140px)] overflow-y-auto px-6 py-5">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <h3 className="text-white text-xl font-semibold mb-2">
                  Start chatting
                </h3>
                <p className="text-slate-400">Send your first message</p>
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex mb-4 ${
                  msg.sender === "me" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[75%] px-4 py-3 rounded-3xl shadow-lg ${
                    msg.sender === "me"
                      ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-br-md"
                      : "bg-white/10 backdrop-blur-md border border-white/10 text-white rounded-bl-md"
                  }`}
                >
                  <p className="break-words">{msg.text}</p>

                  <p
                    className={`text-[10px] mt-1 ${
                      msg.sender === "me" ? "text-indigo-100" : "text-slate-400"
                    }`}
                  >
                    {msg.createdAt.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <form
          onSubmit={handleMessage}
          className="h-[60px] border-t border-white/10 bg-white/5 px-4 flex items-center gap-3"
        >
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="
              flex-1
              h-11
              px-4
              rounded-2xl
              bg-white/10
              border
              border-white/10
              text-white
              placeholder:text-slate-500
              outline-none
              focus:border-indigo-500
              focus:ring-2
              focus:ring-indigo-500/30
              transition-all
            "
          />

          <button
            type="submit"
            className="
              w-11
              h-11
              rounded-2xl
              bg-gradient-to-r
              from-indigo-500
              to-purple-600
              text-white
              flex
              items-center
              justify-center
              hover:scale-105
              active:scale-95
              transition-all
              shadow-lg
            "
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
