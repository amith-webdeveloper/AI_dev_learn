import { validate, z } from 'zod';

function getWeather(city) {
    return {
        city,
        temperature: 28,
        condition: "sunny",
    }
}

const weatherSchema = z.object({
    city: z.string()
});

const tools = [
    {
        type: "function",
        function: {
            name: "getWeather",
            description: "get the current weather for a city",
            parameters: {
                type: "object",
                properties: {
                    city: {
                        type: "string",
                        description: "name of the city",
                    }
                },
                required: ["city"]
            }
        }
    }

];


const UserMessage = "what is the current weather in bengaluru?";

const response = await fetch("http://localhost:11434/v1/chat/completions", {
    method: "POST",
    headers: {
        "content-type": "application/json",
    },
    body: JSON.stringify({
        model: "qwen2.5:3b-instruct",
        messages: [
            {
                role: "user",
                content: UserMessage,
            }
        ],
        tools,
        stream: false,

    })
})

const data = await response.json();
// console.log(data);

const message = data.choices[0].message;
// console.log("message: ", message);

if (message.tool_calls?.length > 0) {
    const toolCall = message.tool_calls[0];
    // console.log(toolCall)

    const toolName = toolCall.function.name;
    const toolArguments = toolCall.function.arguments;
    // console.log(toolArguments)

    const ParsedArguments = JSON.parse(toolArguments);
    // console.log(ParsedArguments)

    const Validated = weatherSchema.safeParse(ParsedArguments);
    // console.log(Validated)

    if (!Validated.success) {
        console.error("invalid city name!");
        console.error(validate.error);
        process.exit(1);
    }

    const city = Validated.data.city;
    // console.log(city)

    let toolResult;
    if (toolName === "getWeather") {
        toolResult = getWeather(city);
    } else {
        throw new Error(
            `unknown tool : ${toolName}`
        )
    }
    // console.log(toolResult)



    const secondResponse = await fetch("http://localhost:11434/v1/chat/completions", {
        method: "POST",
        headers: {
            "content-type": "application/json",
        },
        body: JSON.stringify({
            model: "qwen2.5:3b-instruct",
            messages: [
                {
                    role: "user",
                    content: UserMessage,
                },
                {
                    role: "assistant",
                    tool_calls: message.tool_calls
                },
                {
                    role: "tool",
                    tool_call_id: toolCall.id,
                    content: JSON.stringify(toolResult)

                }
            ],
            stream: false
        })
    })
    const secondData = await secondResponse.json();
    //   console.log(secondData);
    const finalmessage = secondData.choices[0].message.content
    console.log(finalmessage)
}