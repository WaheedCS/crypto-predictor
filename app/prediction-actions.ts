"use server";
import { put, list } from "@vercel/blob";
import axios from "axios";

const PREDICTION_URL = "http://127.0.0.1:8000";

export async function callPrediction(symbol: string) {
  console.log("fetching prediction from blob");
  const { blobs } = await list();
  const previousPrediction = blobs.find((b) => b.pathname.includes(symbol));
  if (previousPrediction) {
    console.log("found previous prediction for this symbol");
    return previousPrediction;
  }

  const prediction = await fetchPrediction(symbol);
  return prediction;
}

export async function fetchPrediction(symbol: string) {
  console.log("calling prediction api");
  const { data } = await axios.get(PREDICTION_URL + "/forecast/" + symbol);
  const result = await put(symbol, JSON.stringify(data), {
    access: "public",
    contentType: "text/plain",
  });
  return result;
}
