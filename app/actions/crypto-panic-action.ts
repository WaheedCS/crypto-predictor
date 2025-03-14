"use server";
import { NewsResponse } from "@/lib/crypto-panic";

export async function getNews() {
  "use cache";
  const API_KEY = "9690b0aac01d5c56bc9344c533be730868c934b0";
  if (!API_KEY) {
    throw Error("API_KEY missing ");
  }
  const response = await fetch(
    `https://cryptopanic.com/api/free/v1/posts/?auth_token=${API_KEY}&public=true`,
    { cache: "force-cache" },
  );
  if (response.status === 200) {
    console.log("Fetched News");
    const data = await response.json();
    return data as NewsResponse;
  } else {
    console.log("error fetching news ", response);
    throw Error("Unable to Fetch News");
  }
}
