

try {
  console.log("Sending request to LLM API...");
  const response = await fetch("http://localhost:11434/api/generate", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model: "qwen3:4b",
    prompt: "Reply only with this JSON: {\"name\":\"John\",\"age\":25,\"city\":\"Bangalore\"}",
    system: "You are a helpful AI Tutor.",
    // options:{
    //   temperature: 0.7,
    //   num_predict:100
    // },
    stream: false,
    think:false

  }),
});

console.log("Response recieved");
if (!response.ok) {
    const errorData = await response.json();

  console.error("HTTP Status:", response.status);
  console.error("Error details:", errorData);

  throw new Error("LLM API request failed");
  }

//  console.log("Creating reader...");

// const reader = response.body.getReader();
// const decoder = new TextDecoder();

// console.log("Reader created.");


// while (true) {
//   const { value, done } = await reader.read();

//   if (done) {
//     break;
//   }

//   const text = decoder.decode(value);
//   const data = JSON.parse(text);

// process.stdout.write(data.response)
// }
const data = await response.json();

console.log(data.response);
} catch (error) {
  console.error("Request failed:", error);
}