"use server";

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
