"use client";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@radix-ui/react-label";
import { useState } from "react";

const CURRENCIES = ["BTCUSDT", "ETHUSDT", "BNBUSDT", "DOGEUSDT", "LINKUSDT"];

export default function PredictionChart() {
  const [selectedCurrency, setSelectedCurrency] = useState(CURRENCIES?.at(0));
  const AI_ROUTE = process.env.NEXT_PUBLIC_PORTFOLIO_OPTIMIZER_AI_ROUTE;
  const currencyPredictionUrl = `${AI_ROUTE}/static/forecast_${selectedCurrency}.html`;
  return (
    <>
      <Card>
        <div className="mx-auto max-w-md flex gap-4 items-center">
          <Label>Selected Currency</Label>
          <Select
            value={selectedCurrency}
            onValueChange={(value) => setSelectedCurrency(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select a fruit" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Currencies</SelectLabel>
                {CURRENCIES?.map((currency, index) => (
                  <SelectItem key={index} value={currency}>
                    {currency}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="text-center">{currencyPredictionUrl}</div>
        {AI_ROUTE ? (
          <div>
            <iframe
              onError={() => {
                const holder = document.getElementById("error-holder");
                if (holder) {
                  holder.innerHTML = "<b>Unable to load Prediction Chart</b>";
                }
              }}
              src={currencyPredictionUrl}
              className="w-full h-screen"
            ></iframe>
          </div>
        ) : (
          <div className="text-center text-red-600 font-extrabold text-base">
            No Url provided for Portfolio Optimizer AI
          </div>
        )}
      </Card>
    </>
  );
}
