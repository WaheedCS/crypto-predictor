// 'use server';
"use cache";
import { NewsResponse } from "@/lib/crypto-panic";

// export class CryptoPanic {
//   static async getNews() {
export async function getNews(){
    const API_KEY = "9690b0aac01d5c56bc9344c533be730868c934b0";
    if (!API_KEY) {
      throw Error("API_KEY for crypto panic missing ");
    }
    const response = await fetch(
      `https://cryptopanic.com/api/free/v1/posts/?auth_token=${API_KEY}&public=true`,
      { cache: "force-cache" }
    );
    if (response.status === 200) {
      console.log("fetched news");
      const data = await response.json();
      return data as NewsResponse;
    } else {
      console.log("error fetching news ", response);
      //   throw Error("Unable to Fetch a response for the selected address");
    }
  }
// }
