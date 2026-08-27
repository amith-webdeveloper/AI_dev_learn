

try {
  const response = await fetch("http://localhost:11434/api/generate", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model: "qwen3:4b",
    prompt: "Explain what an LLM is in one simple sentence.",
    stream: true,
  }),
});

  if (!response.ok) {
    const errorData = await response.json();

  console.error("HTTP Status:", response.status);
  console.error("Error details:", errorData);

  throw new Error("LLM API request failed");
  }

 const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { value, done } = await reader.read();

  if (done) {
    break;
  }

 const chunk = decoder.decode(value);
const data = JSON.parse(chunk);

process.stdout.write(data.response);
}

} catch (error) {
  console.error("Request failed:", error);
}