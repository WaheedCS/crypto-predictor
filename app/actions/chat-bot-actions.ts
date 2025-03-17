"use server";

// import axios from "axios";
import OpenAI from "openai";

export async function askChatBot(input: string) {
  const apiEndpoint = process.env.CHAT_BOT_ROUTE;
  if (!apiEndpoint) {
    throw Error("API UNAVAILABLE");
  }
  const response = await fetch(apiEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: input.trim(),
    }),
  });

  if (!response.ok) {
    throw new Error(`Error: ${response.status}`);
  }

  const data = await response.json();
  return data;
}

export async function askChatGptChatBot(input: string) {
  const apiEndpoint = process.env.OPENAI_API_KEY;
  if (!apiEndpoint) {
    throw Error("API UNAVAILABLE");
  }
  const openai = new OpenAI({ apiKey: apiEndpoint });

  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: "developer",
        content: `Write a sales pitch for the cryptocurrency with these details, also fetch any additional details from the web to show to the user. The pitch should be between 150 to 200 words. use the 'volatility', 'historicalData' and 'growth' to determine if the coin is worth investing for the user. if not, then explain why the coin is not worth investing. ${input}`,
      },
    ],
    model: "gpt-4o",
    // store: true,
  });

  return (
    completion?.choices?.at(0)?.message?.content ||
    "Unable to Generate a Summary for this coin."
  );
}

// export async function askPerplexityChatBot(input: string) {
//   const response = await axios.post(
//     "https://api.perplexity.ai/chat/completions",
//     {
//       model: "llama-3.1-sonar-small-128k-online",
//       messages: [
//         {
//           role: "user",
//           content: `I have a list of cryptocurrency symbols: . For each symbol, predict its price and percentage price change after six months from today. Return the response strictly in JSON format with the following structure:
//                     """
//                     [{
//                       "symbol": SYMBOL ( type string ),
//                       "predicted_price": VALUE ( type number ),
//                       "predicted_percentage_change": VALUE ( type number )
//                     }]
//                     """
//                     Ensure no additional text or explanation is included.
//                     `,
//         },
//       ],
//     },
//     {
//       headers: {
//         "Content-Type": "application/json",
//         Authorization:
//           "Bearer " + "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",
//       },
//     },
//   );
// }
