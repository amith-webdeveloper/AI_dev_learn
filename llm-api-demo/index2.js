import { z } from "zod";

// ======================================================
// 1. ACTUAL TOOL
// ======================================================

function getWeather(city) {
  return {
    city,
    temperature: 28,
    condition: "Sunny",
  };
}


// ======================================================
// 2. TOOL ARGUMENT SCHEMA
// ======================================================

const WeatherSchema = z.object({
  city: z.string(),
});


// ======================================================
// 3. TOOL DEFINITION
// ======================================================

const tools = [
  {
    type: "function",

    function: {
      name: "getWeather",

      description: "Get the current weather for a city.",

      parameters: {
        type: "object",

        properties: {
          city: {
            type: "string",
            description: "The name of the city",
          },
        },

        required: ["city"],
      },
    },
  },
];


// ======================================================
// 4. USER MESSAGE
// ======================================================

const userMessage =
  "What is the weather in Bangalore?";


// ======================================================
// 5. FIRST REQUEST → ASK QWEN
// ======================================================

const response = await fetch(
  "http://localhost:11434/v1/chat/completions",
  {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      model: "qwen2.5:3b-instruct",

      messages: [
        {
          role: "user",
          content: userMessage,
        },
      ],

      tools,

      stream: false,
    }),
  }
);


const data = await response.json();

console.log("data:", data);

// Qwen's first response
const message = data.choices[0].message;

console.log("\nQwen first response:");
console.log(message);


// ======================================================
// 6. CHECK WHETHER QWEN SELECTED A TOOL
// ======================================================

if (message.tool_calls?.length > 0) {

  const toolCall = message.tool_calls[0];

  console.log("toolcall function : ",toolCall.function);

  // ====================================================
  // 7. GET TOOL NAME
  // ====================================================
  const toolName =
  toolCall.function.name;
  
  console.log("\nTool selected:");
  console.log(toolName);


  // ====================================================
  // 8. GET TOOL ARGUMENTS
  // ====================================================

  const toolArguments =
    JSON.parse(
      toolCall.function.arguments
    );

  console.log("\nTool arguments:");
  console.log(toolArguments);


  // ====================================================
  // 9. VALIDATE TOOL ARGUMENTS
  // ====================================================

  const validated =
    WeatherSchema.safeParse(
      toolArguments
    );

  if (!validated.success) {
    console.error(
      "Invalid tool arguments:"
    );

    console.error(
      validated.error
    );

    process.exit(1);
  }


  // ====================================================
  // 10. EXECUTE THE TOOL
  // ====================================================

  let toolResult;

  if (toolName === "getWeather") {

    toolResult =
      getWeather(
        validated.data.city
      );

  } else {

    throw new Error(
      `Unknown tool: ${toolName}`
    );
  }


  console.log("\nTool result:");
  console.log(toolResult);


  // ====================================================
  // 11. SECOND REQUEST → SEND RESULT TO QWEN
  // ====================================================

  const secondResponse = await fetch(
    "http://localhost:11434/v1/chat/completions",
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({

        model: "qwen2.5:3b-instruct",

        messages: [

          // --------------------------------------------
          // Original user message
          // --------------------------------------------

          {
            role: "user",
            content: userMessage,
          },


          // --------------------------------------------
          // Qwen's previous message
          //
          // This is important because it tells Qwen:
          // "You previously requested this tool."
          // --------------------------------------------

          {
            role: "assistant",

            tool_calls:
              message.tool_calls,
          },


          // --------------------------------------------
          // Tool result
          //
          // This tells Qwen what the function returned.
          // --------------------------------------------

          {
            role: "tool",

            tool_call_id:
              toolCall.id,

            content:
              JSON.stringify(toolResult),
          },
        ],

        stream: false,
      }),
    }
  );


  // ====================================================
  // 12. READ QWEN'S FINAL RESPONSE
  // ====================================================

  const secondData =
    await secondResponse.json();

  const finalMessage =
    secondData.choices[0].message;


  console.log("\nFinal answer:");

  console.log(
    finalMessage.content
  );

}