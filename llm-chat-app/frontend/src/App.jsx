import { useState } from "react";
import "./App.css";

function App() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  async function handleSend() {
    if (message.trim() === "") {
      return;
    }

    const userMessage = message;

    // Show user's message immediately
    setMessages((currentMessages) => [
      ...currentMessages,
      {
        role: "user",
        content: userMessage,
      },
    ]);

    // Clear input
    setMessage("");

    try {
      const response = await fetch("http://localhost:3000/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
        }),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let aiMessage = "";

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          role: "assistant",
          content: "",
        },
      ]);

      while (true) {
        const { value, done } = await reader.read();

        if (done) {
          break;
        }

        const chunk = decoder.decode(value);

        aiMessage += chunk;

        setMessages((currentMessages) => {
          const updatedMessages = [...currentMessages];

          updatedMessages[updatedMessages.length - 1] = {
            role: "assistant",
            content: aiMessage,
          };

          return updatedMessages;
        });
      }
    } catch (error) {
      console.error("Request failed:", error);
    }
  }

  return (
    <div className="app">
      <h1>How can I help, Amith?</h1>

      <div className="messages">
        {messages.map((msg, index) => (
          <div
            className={
              msg.role === "user" ? "user-message" : "ai-message"
            }
            key={index}
          >
            {msg.content}
          </div>
        ))}
      </div>

      <div className="input-box">
        <input
          type="text"
          placeholder="Ask anything"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        <button onClick={handleSend}>➜</button>
      </div>
    </div>
  );
}

export default App;