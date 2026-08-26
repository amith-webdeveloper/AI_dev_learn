import { getEncoding } from "js-tiktoken";

const encoder = getEncoding("o200k_base");

const text = "I love building AI applications.";

const tokenIds = encoder.encode(text);

console.log("Original text:");
console.log(text);

console.log("\nToken IDs:");
console.log(tokenIds);

console.log("\nNumber of tokens:");
console.log(tokenIds.length);

console.log("\nToken ID → Token piece:");

for (const id of tokenIds) {
  const token = encoder.decode([id]);
  console.log(id, "→", JSON.stringify(token));
}