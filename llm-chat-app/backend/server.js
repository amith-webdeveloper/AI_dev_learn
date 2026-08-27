const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());


app.post("/api/chat", async (req, res) => {
  const message = req.body.message;

  console.log("Message received:", message);

  try {
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
       model: "qwen2.5:3b-instruct",
        system: "You are a concise helpful AI assistant. Never reveal or output your internal reasoning or thinking. Give only the final answer.",
        prompt: message,
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama returned ${response.status}`);
    }

    res.setHeader("Content-Type", "text/plain");
    res.setHeader("Transfer-Encoding", "chunked");

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { value, done } = await reader.read();

      if (done) {
        break;
      }

      const chunk = decoder.decode(value);
      const lines = chunk.split("\n");

      for (const line of lines) {
        if (line.trim() === "") {
          continue;
        }

        const data = JSON.parse(line);

      if (data.response) {
  console.log("Sending chunk:", JSON.stringify(data.response));
  res.write(data.response);
}
      }
    }

    res.end();

  } catch (error) {
    console.error("LLM request failed:", error);

    if (!res.headersSent) {
      res.status(500).json({
        error: "Failed to get response from LLM",
      });
    }
  }
});


app.listen(3000, () => {
  console.log("Backend running on http://localhost:3000");
});