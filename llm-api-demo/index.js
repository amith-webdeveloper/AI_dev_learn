import { z } from "zod";

const PersonSchema = z.object({
  name: z.string(),
  age: z.int(),
  city: z.string(),
});

try {
  console.log("Sending request to LLM API...");

  const response = await fetch("http://localhost:11434/api/generate", {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      model: "qwen2.5:3b-instruct",

      prompt: `
Give me the name, age and city of a fictional person.

Return ONLY valid JSON with:
name (string)
age (number)
city (string)
`,

      system: "You are a helpful AI Tutor.",
      stream: false,
    }),
  });

  console.log("Response received");

  if (!response.ok) {
    const errorData = await response.json();

    console.error("HTTP Status:", response.status);
    console.error("Error details:", errorData);

    throw new Error("LLM API request failed");
  }

  const data = await response.json();

  console.log("LLM response:");
  console.log(data.response);

  // JSON string → JavaScript object
  const person = JSON.parse(data.response);
  console.log("json parse : ",person);

  // Validate with Zod
  const validatedPerson = PersonSchema.parse(person);

  console.log("Validated person:");
  console.log(validatedPerson);

  console.log("Name:", validatedPerson.name);
  console.log("Age:", validatedPerson.age);
  console.log("City:", validatedPerson.city);

} catch (error) {
  console.error("Request failed:", error);
}