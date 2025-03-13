"use client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { AlertCircle, Grid, Loader2 } from "lucide-react";
import { FormEvent, useActionState, useState } from "react";

import { RiskAnalysis } from "@/app/actions/actions";
import { TooltipComponent } from "@/components/ui/tooltip";
import { ResultSection } from "./ResultSection";
import { ResultType } from "@/lib/types";

interface InputFormType {
  riskLevel: string;
  exitFrequency: string;
  rangeValue: number;
  minMaxRange: number[];
  amount: number;
}

export default function MainComponent() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResultType | null>(null);

  async function handleFormSubmit(e: InputFormType) {
    console.log(e);

    console.log(
      e.riskLevel,
      e.exitFrequency,
      e.rangeValue,
      e.minMaxRange,
      e.amount,
    );

    setError(null);
    setLoading(true);
    try {
      const risk = e.riskLevel;
      const amount = e.amount;
      const exit = e.exitFrequency;
      const diversification = e.rangeValue;
      const minPrice = e.minMaxRange.at(0);
      const maxPrice = e.minMaxRange.at(1);

      const result = await RiskAnalysis({
        amount: Number(amount),
        diversification: Number(diversification),
        exit: exit as string,
        maxPrice: Number(maxPrice),
        minPrice: Number(minPrice),
        risk: risk as string,
      });
      console.log("result ", result);

      setResult(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="lg:col-span-2 space-y-6">
      {/* Input Card */}
      <InputForm isPending={loading} formAction={handleFormSubmit} />

      {/* Visualization Section */}
      {error && (
        <Alert variant="destructive" className="w-full max-w-md mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* No Results Message */}
      {result && result?.currencies?.length === 0 && (
        <Card className="w-full max-w-md mx-auto">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              No products found matching your criteria.
            </p>
          </CardContent>
        </Card>
      )}

      {result && result?.currencies?.length > 0 && (
        <>
          {/* <div className="flex flex-row gap-8">
            <InvestmentPieChart investmentData={result} />
          </div> */}
          <ResultSection result={result} />
        </>
      )}
    </div>
  );
}

function InputForm({
  formAction,
  isPending,
}: {
  formAction: (payload: InputFormType) => void;
  isPending: boolean;
}) {
  const [rangeValue, setRangeValue] = useState(5);
  const [minMaxRange, setMinMaxRange] = useState([50000, 150000]);
  const [amount, setAmount] = useState(0);
  const [riskLevel, setRiskLevel] = useState("medium");
  const [exitFrequency, setExitFrequency] = useState("regular");
  return (
    <div className={`rounded-xl bg-white shadow-xl overflow-hidden`}>
      <div className="p-6">
        <h2 className="text-lg font-semibold mb-6 flex items-center">
          <Grid size={18} className="mr-2 text-indigo-500" />
          Data Configuration
        </h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            formAction({
              amount,
              exitFrequency,
              minMaxRange,
              rangeValue,
              riskLevel,
            });
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="text-sm font-medium mb-3 text-opacity-80 flex items-center gap-2">
                Risk Level{" "}
                <TooltipComponent hoverText="Risk Level of Crypto Coins to Invest" />
              </label>
              <div className="flex gap-3">
                {["low", "medium", "high"].map((level) => (
                  <div
                    key={level}
                    className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                      riskLevel === level
                        ? "bg-indigo-400 text-white border-l-4 border-indigo-600"
                        : "bg-gray-50 hover:bg-gray-100"
                    }`}
                    onClick={() => setRiskLevel(level)}
                  >
                    <div
                      className={`w-4 h-4 rounded-full mr-3 border-2 flex items-center justify-center ${
                        riskLevel === level
                          ? "border-indigo-500"
                          : "border-gray-400"
                      }`}
                    >
                      {riskLevel === level && (
                        <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium cursor-pointer">
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-3 text-opacity-80 flex items-center gap-2">
                Exit Frequency{" "}
                <TooltipComponent hoverText="How often you want to take profit from your investment" />
              </label>
              <div className="flex gap-3">
                {["early", "regular", "late"].map((freq) => (
                  <div
                    key={freq}
                    className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                      exitFrequency === freq
                        ? "bg-indigo-400 text-white border-l-4 border-indigo-600"
                        : "bg-gray-50 hover:bg-gray-100"
                    }`}
                    onClick={() => setExitFrequency(freq)}
                  >
                    <div
                      className={`w-4 h-4 rounded-full mr-3 border-2 flex items-center justify-center ${
                        exitFrequency === freq
                          ? "border-indigo-500"
                          : "border-gray-400"
                      }`}
                    >
                      {exitFrequency === freq && (
                        <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium cursor-pointer">
                        {freq.charAt(0).toUpperCase() + freq.slice(1)}
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Range Inputs with shadcn/ui Slider */}
          <div className="space-y-6 mb-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label
                  htmlFor="range"
                  className="text-sm font-medium text-opacity-80 flex items-center gap-2"
                >
                  Diversification{" "}
                  <TooltipComponent hoverText="How many crypto coins to invest in" />
                </label>
                <span
                  className={`text-sm font-semibold px-2 py-1 rounded-full bg-indigo-100 text-indigo-700`}
                >
                  {rangeValue}
                </span>
              </div>
              <div className="px-2 py-4">
                <Slider
                  value={[rangeValue]}
                  min={1}
                  max={10}
                  step={1}
                  onValueChange={(value) => setRangeValue(value[0])}
                />
                <div className="flex justify-between text-xs mt-1 text-opacity-70">
                  <span>1</span>
                  <span>10</span>
                </div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-opacity-80 flex items-center gap-2">
                  Daily Trading Volume{" "}
                  <TooltipComponent hoverText="Select range for crypto coins with trading volume" />
                </label>
                <span
                  className={`text-sm font-semibold px-2 py-1 rounded-full bg-indigo-100 text-indigo-700`}
                >
                  {`$${minMaxRange[0].toLocaleString()} - $${minMaxRange[1].toLocaleString()}`}
                </span>
              </div>

              {/* Using shadcn/ui Slider for range */}
              <div className="px-2 py-4">
                <Slider
                  max={1000000}
                  min={10000}
                  step={5000}
                  defaultValue={[50000, 150000]}
                  minStepsBetweenThumbs={2}
                  onValueChange={(value) => {
                    setMinMaxRange([value[0], value[1]]);
                  }}
                />
                <div className="flex justify-between text-xs mt-1 text-opacity-70">
                  <span>$10K</span>
                  <span>$1M</span>
                </div>
              </div>
            </div>
          </div>

          {/* Number Input and Submit */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="number"
                className="text-sm font-medium mb-1 text-opacity-80 flex items-center gap-2"
              >
                Investment Amount{" "}
                <TooltipComponent hoverText="Enter Amount to Invest<br/><b>(Just for Visualization, Amount will not be deducted)</b>" />
              </label>
              <div className="flex rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500">
                <div
                  className={`px-4 py-3 text-sm font-medium bg-gray-200 text-gray-700`}
                >
                  USD
                </div>
                <input
                  id="number"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
                  className={`w-full px-4 py-3 bg-gray-50 focus:outline-none`}
                />
              </div>
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                {isPending ? (
                  <div className="flex gap-4 w-full items-center justify-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Fetching...
                  </div>
                ) : (
                  "Submit"
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
