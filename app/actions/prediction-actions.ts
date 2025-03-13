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
    path: i.url
  }));
  console.log("blob found ", previousPredictions);
  return previousPredictions;
}
