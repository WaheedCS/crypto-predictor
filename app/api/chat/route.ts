// import { NextRequest } from "next/server";
import axios from "axios";
import OpenAI from "openai";

export async function POST(request: Request) {
  const body = await request.json();
  console.log("recieved ", body);
  try {
    const { data, status, statusText } = await axios.post(
      "https://api.perplexity.ai/chat/completions",
      {
        // model: "llama-3.1-sonar-small-128k-online",
        model: "sonar",
        messages: [
          {
            role: "system",
            content: `I have a list of cryptocurrency symbols: ${body}. For each symbol, predict its price and percentage price change after six months from today. Also calculate the currenct risk value between 0 and 1. Return the response strictly in JSON format with the following structure:
                    """
                    [{
                      "symbol": SYMBOL ( type string ),
                      "predicted_price": VALUE ( type number ),
                      "predicted_percentage_change": VALUE ( type number )
                      "risk_value": VALUE ( type number )
                    }]
                    """
                    Ensure no additional text or explanation is included.
                    `,
          },
          {
            role: "user",
            content: "give me the predicted values for these cryptocurrency coins",
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization:
            "Bearer " + "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",
        },
      }
    );
    console.log("reponse ", status, statusText, " data : ", data);
    return Response.json({ data: data || "none" });
  } catch (e) {
    console.error(JSON.stringify(e));
    return Response.json({ error: JSON.stringify(e) });
  }

  //
  //
  // const apiEndpoint = process.env.OPENAI_API_KEY;
  // if (!apiEndpoint) {
  //   throw Error("API UNAVAILABLE");
  // }
  // const openai = new OpenAI({ apiKey: apiEndpoint });

  // const response = await openai.chat.completions.create({
  //   model: "gpt-4o",
  //   messages: [
  //     {
  //       role: "user",
  //       content: `I have a list of cryptocurrency symbols: ${body}. For each symbol, predict its price and percentage price change after six months from today. Also calculate the current risk value between 0 and 1. Return the response strictly in JSON format with the following structure:
  //                    """
  //                    [{
  //                      "symbol": SYMBOL ( type string ),
  //                      "predicted_price": VALUE ( type number ),
  //                      "predicted_percentage_change": VALUE ( type number ),
  //                      "risk_value": VALUE ( type number )
  //                    }]
  //                    """
  //                    Ensure no additional text or explanation is included.`,
  //     },
  //   ],
  // });

  // console.log("perplexity response ", response)
  // // const { choices } = response.data;
  // const data = JSON.stringify(response.choices?.at(0)?.message);
  // return Response.json({ data: data || "none" });
}
