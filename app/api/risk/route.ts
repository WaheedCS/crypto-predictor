import axios from "axios";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
//   const searchParams = request.nextUrl.searchParams;
//   const symbols = searchParams.get("symbols");
const body = await request.json();
const symbols = body.symbols
  if (!symbols) {
    return new Response(JSON.stringify({ error: "No symbols provided" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    let attempts = 0;
    let data: string | undefined;
    let jsonMatches: RegExpMatchArray | null = null;

    while (attempts < 3) {
      const response = await axios.post(
        "https://api.perplexity.ai/chat/completions",
        {
          model: "llama-3.1-sonar-small-128k-online",
          messages: [
            {
              role: "user",
              content: `I have a list of cryptocurrency symbols: ${symbols}. For each symbol, predict its price and percentage price change after six months from today. Also calculate the currenct risk value between 0 and 1. Return the response strictly in JSON format with the following structure:
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
          ],
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization:
              "Bearer " +
              "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",
          },
        }
      );

      data = response.data.choices[0].message.content;
      try {
        const jsonMatches = (data as string).match(/\[\s*\{[\s\S]*?\}\s*\]/g);
        if (!jsonMatches || jsonMatches.length === 0) {
          attempts++;
          continue;
        }
        const parsedData = JSON.parse(jsonMatches[0]);
        return Response.json({ data: parsedData });
        
      } catch (err) {
        attempts++;
        continue;
      }

    }

    return new Response(
      JSON.stringify({ error: "Unable to parse JSON after multiple attempts" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("API Error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}