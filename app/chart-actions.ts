"use client";

import {
  assignPercentagesResponse,
  CurrenciesType,
  percentageChangeCallResponse,
} from "@/lib/types";
import axios from "axios";

export function assignPercentages(
  data: CurrenciesType[],
  risk: number,
  volume: number,
  diversity: number,
  depositAmount: number
): assignPercentagesResponse {
  function closenessScore(value: number, target: number) {
    return Math.abs(value - target);
  }

  const selectedObjects = [];
  const dataCopy = [...data];
  while (selectedObjects.length < diversity && dataCopy.length > 0) {
    const randomIndex = Math.floor(Math.random() * dataCopy.length);
    selectedObjects.push(dataCopy.splice(randomIndex, 1)[0]);
  }

  const scores = selectedObjects.map((item) => {
    const riskScore = closenessScore(item.Risk_Value as number, risk);
    const volumeScore = closenessScore(Number(item.volume_24h), volume);
    const similarityScore = 1 / (riskScore + volumeScore);
    return { ...item, similarityScore };
  });

  const totalScoreSum = scores.reduce(
    (sum, item) => sum + item.similarityScore,
    0
  );
  const percentages = scores.map((item) => ({
    ...item,
    percentage: ((item.similarityScore / totalScoreSum) * 100).toFixed(2),
    price:
      (depositAmount *
        parseFloat(((item.similarityScore / totalScoreSum) * 100).toFixed(2))) /
      100,
  }));
  return percentages;
  // return assignPercentagesDummy;
}

// export async function percentageChangeCall(
//   currencies: assignPercentagesResponse
// ): Promise<percentageChangeCallResponse | null> {
//   const symbols = currencies.map((currency) => currency.symbol).join(",");
//   try {
//     let attempts = 0;
//     let data: string | undefined;
//     // let jsonMatches: RegExpMatchArray | null = null;

//     while (attempts < 3) {
//       const response = await axios.post(
//         "https://api.perplexity.ai/chat/completions",
//         {
//           model: "llama-3.1-sonar-small-128k-online",
//           messages: [
//             {
//               role: "user",
//               content: `I have a list of cryptocurrency symbols: ${symbols}. For each symbol, predict its price and percentage price change after six months from today. Return the response strictly in JSON format with the following structure:
//                   """
//                   [{
//                     "symbol": SYMBOL ( type string ),
//                     "predicted_price": VALUE ( type number ),
//                     "predicted_percentage_change": VALUE ( type number )
//                   }]
//                   """
//                   Ensure no additional text or explanation is included.
//                   `,
//             },
//           ],
//         },
//         {
//           headers: {
//             "Content-Type": "application/json",
//             Authorization:
//               "Bearer " +
//               "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",
//           },
//         }
//       );

//       data = response.data.choices[0].message.content;
//       try {
//         const jsonMatches = (data as string).match(/\[\s*\{[\s\S]*?\}\s*\]/g);
//         if (!jsonMatches || jsonMatches.length === 0) {
//           attempts++;
//           continue;
//         }
//         const parsedData = JSON.parse(jsonMatches[0]);
//         return parsedData;
//       } catch (err) {
//         attempts++;
//         continue;
//       }
//     }
//   } catch (err) {
//     console.log("error : ", err);
//     return null;
//   }
// }
