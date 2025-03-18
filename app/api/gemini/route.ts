import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(request: Request) {
  const body = await request.json();
  const apiEndpoint = process.env.GEMINI_API_KEY;
  if (!apiEndpoint) {
    throw Error("API UNAVAILABLE");
  }
  const genAI = new GoogleGenerativeAI(apiEndpoint);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const symbols = body;
  const chunkSize = 50; // Adjust chunk size as needed
  const chunks = [];
  for (let i = 0; i < symbols.length; i += chunkSize) {
    chunks.push(symbols.slice(i, i + chunkSize));
  }

  const results: object[] = [];
  for (const chunk of chunks) {
    if(results.length >= 100){
      continue;
    }
    const prompt = `I have a list of cryptocurrency symbols: ${chunk}. For each symbol, predict its price and percentage price change after six months from today. Also calculate the current risk value between 0 and 1. Return the response strictly in JSON format with the following structure:
            """
            [{
              "symbol": SYMBOL ( type string ),
              "predicted_price": VALUE ( type number ),
              "predicted_percentage_change": VALUE ( type number ),
              "risk_value": VALUE ( type number )
            }]
            """
            Ensure no additional text or explanation is included.`;

    try {
      const result = await model.generateContent(prompt);
      const chunkResult = result.response.text();

      try {
        const parsedChunk = JSON.parse(chunkResult);
        if (Array.isArray(parsedChunk)) {
          results.push(...parsedChunk);
        } else {
          console.error("Parsed chunk is not an array:", parsedChunk);
        }
      } catch (parseError) {
        console.error("Error parsing chunk result:", parseError, chunkResult);
      }
    } catch (generateError) {
      console.error("Error generating content for chunk:", generateError);
    }
  }
  return Response.json({ data: results });
}
