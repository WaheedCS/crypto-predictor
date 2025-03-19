"use server";
import { put, list } from "@vercel/blob";
import axios from "axios";
import { PriceData } from "@/lib/types";

const PREDICTION_URL = "http://127.0.0.1:8000";

export async function callPrediction(symbol: string) {
  console.log("fetching prediction from blob");
  const { blobs } = await list();
  const previousPrediction = blobs.find((b) => b.pathname.includes(symbol));
  if (previousPrediction) {
    console.log("found previous prediction for this symbol");
    const response = await fetch(previousPrediction.downloadUrl);
    const content = await response.text();
    return JSON.parse(content);
  }

  const prediction = await fetchPrediction(symbol);
  return prediction;
}

export async function fetchPrediction(symbol: string) {
  console.log("calling prediction api");
  const { data } = await axios.get(PREDICTION_URL + "/forecast/" + symbol);
  if (data.error) {
    throw Error("Unable to generate prediction");
  }
  await put(symbol + ".txt", JSON.stringify(data), {
    access: "public",
    contentType: "text/plain",
  });
  return data as PriceData;
}

export async function fetchPreviousPredictionsList() {
  const { blobs } = await list();
  const previousPredictions = blobs?.map((i) => ({
    name: i.pathname?.replace(".html", "")?.replace("forecast_", "") || "",
    url: i.downloadUrl,
    path: i.url,
  }));
  console.log(
    "blobs found: ",
    previousPredictions?.map((i) => i.name)
  );
  return previousPredictions;
}

export async function fetchCoinForecasting(currency: string) {
  try {
    const AI_ENDPOINT = process.env.NEXT_PUBLIC_PORTFOLIO_OPTIMIZER_AI_ROUTE;
    if (!AI_ENDPOINT) {
      throw Error("NO AI ROUTE FOUND");
    }
    const { data } = await axios(
      AI_ENDPOINT +
        "/CoinsForecasting?currencies=" +
        currency +
        "&display=false"
    );
    return data;
  } catch (e) {
    console.error("Error fetching coin forecast ", e);
    return null;
  }
}

export async function fetchHtmlContent(url: string) {
  const AI_ENDPOINT = process.env.NEXT_PUBLIC_PORTFOLIO_OPTIMIZER_AI_ROUTE;
  const response = await fetch(AI_ENDPOINT+url);
  // const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }
  const html = await response.text();
  return html;
}
