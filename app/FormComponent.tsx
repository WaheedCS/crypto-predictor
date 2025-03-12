"use client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { TooltipComponent } from "@/components/ui/tooltip";
import { AlertCircle, Loader2 } from "lucide-react";
import { Suspense, useActionState, useState } from "react";
import { RiskAnalysis } from "./actions/actions";
import InvestmentPieChart from "./InvestmentPieChart";
import ResultCard from "./ResultsCard";
import PredictionChart from "./PredictionChart";
import { NewsCard } from "./NewsCard";
import { callPrediction } from "./actions/prediction-actions";

export default function FormComponent() {
  const [error, setError] = useState<string | null>(null);

  const [result, formAction, isPending] = useActionState(
    (_: unknown, formData: FormData) => handleFormSubmit(formData),
    null
  );

  async function handleFormSubmit(formData: FormData) {
    setError(null);
    try {
      const risk = formData.get("risk");
      const amount = formData.get("amount");
      const exit = formData.get("exit");
      const diversification = formData.get("diversification");
      const minPrice = formData.get("min-price");
      const maxPrice = formData.get("max-price");

      console.log({
        risk,
        amount,
        exit,
        diversification,
        minPrice,
        maxPrice,
      });
      const result = await RiskAnalysis({
        amount: Number(amount),
        diversification: Number(diversification),
        exit: exit as string,
        maxPrice: Number(maxPrice),
        minPrice: Number(minPrice),
        risk: risk as string,
      });
      console.log(result);

      return result;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    }
  }

  return (
    <div>
      <div className="flex flex-col gap-8">
        {/* <div className="flex gap-8 items-center"> */}
        <form action={formAction} className="flex gap-8 items-center">
          <Card className="w-full my-10">
            <CardHeader className="hidden">
              <CardTitle>Portfolio Optimizer</CardTitle>
              <CardDescription className="text-pretty">
                Portfolio Optimizer is an AI-powered tool that helps you
                optimize your investment portfolio. It uses machine learning
                algorithms to analyze your investment goals, risk tolerance, and
                market conditions to provide you with a diversified and
                optimized portfolio.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 mb-4 grid xl:grid-cols-3 lg:grid-cols-2 grid-cols-1  gap-8">
              <div className="space-y-3 flex flex-col gap-4 h-full justify-evenly">
                <div className="space-y-3">
                  <Label htmlFor="risk-options">
                    Risk Level{" "}
                    <TooltipComponent hoverText="Risk Level of Crypto Coins to Invest" />
                  </Label>
                  <RadioGroup
                    defaultValue="low"
                    name="risk"
                    id="risk-options"
                    className="flex flex-row space-x-1"
                  >
                    <div className="flex items-center space-x-2 text-nowrap">
                      <RadioGroupItem value="low" id="low" />
                      <Label htmlFor="low">Low Risk</Label>
                    </div>
                    <div className="flex items-center space-x-2 text-nowrap">
                      <RadioGroupItem value="medium" id="medium" />
                      <Label htmlFor="medium">Medium Risk</Label>
                    </div>
                    <div className="flex items-center space-x-2 text-nowrap">
                      <RadioGroupItem value="high" id="high" />
                      <Label htmlFor="high">High Risk</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="exit-options">
                    Exit Frequency{" "}
                    <TooltipComponent hoverText="How often you want to take profit from your investment" />
                  </Label>
                  <RadioGroup
                    defaultValue="Early"
                    name="exit"
                    id="exit-options"
                    className="flex flex-row space-x-1"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Early" id="early" />
                      <Label htmlFor="early">Early</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Regular" id="regular" />
                      <Label htmlFor="regular">Regular</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Late" id="late" />
                      <Label htmlFor="late">Late</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              <div className="space-y-3 flex flex-col gap-4 h-full justify-evenly">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Label htmlFor="diversification">
                      Diversification{" "}
                      <TooltipComponent hoverText="How many crypto coins to invest in" />
                    </Label>
                    <span
                      className="text-sm text-muted-foreground"
                      id="diversification-value"
                    >
                      5
                    </span>
                  </div>
                  <Slider
                    id="diversification"
                    name="diversification"
                    defaultValue={[5]}
                    max={10}
                    min={1}
                    step={1}
                    onValueChange={(value) => {
                      const valueDisplay = document.getElementById(
                        "diversification-value"
                      );
                      if (valueDisplay)
                        valueDisplay.textContent = value[0].toString();
                    }}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>1</span>
                    <span>10</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Label htmlFor="trading-volume">
                      Daily Trading Volume{" "}
                      <TooltipComponent hoverText="Select range for crypto coins with trading volume" />
                    </Label>
                    <span
                      className="text-sm text-muted-foreground"
                      id="trading-volume-value"
                    >
                      $50,000 - $150,000
                    </span>
                  </div>
                  {/* Hidden inputs to store the values for form submission */}
                  <input
                    type="hidden"
                    name="min-price"
                    id="min-price"
                    value="10000"
                  />
                  <input
                    type="hidden"
                    name="max-price"
                    id="max-price"
                    value="1000000"
                  />
                  <Slider
                    id="trading-volume"
                    name="trading-volume"
                    defaultValue={[50_000, 150_000]}
                    max={1_000_000}
                    min={10_000}
                    step={5_000}
                    minStepsBetweenThumbs={2}
                    onValueChange={(values) => {
                      const valueDisplay = document.getElementById(
                        "trading-volume-value"
                      );
                      const minPriceInput = document.getElementById(
                        "min-price"
                      ) as HTMLInputElement;
                      const maxPriceInput = document.getElementById(
                        "max-price"
                      ) as HTMLInputElement;
                      if (valueDisplay)
                        valueDisplay.textContent = `$${values[0].toLocaleString()} - $${values[1].toLocaleString()}`;
                      if (minPriceInput)
                        minPriceInput.value = values[0].toString();
                      if (maxPriceInput)
                        maxPriceInput.value = values[1].toString();
                    }}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>$10K</span>
                    <span>$1M</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 flex flex-col gap-4 h-full justify-evenly">
                <div className="space-y-3">
                  <Label htmlFor="name">
                    Deposit Amount{" "}
                    <TooltipComponent hoverText="Enter Amount to Invest<br/><b>(Just for Visualization, Amount will not be deducted)</b>" />
                  </Label>
                  <Input
                    id="amount"
                    name="amount"
                    type="number"
                    placeholder="Enter Amount to Invest"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full space-y-3 md:hidden"
                  disabled={isPending}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Fetching...
                    </>
                  ) : (
                    "Submit"
                  )}
                </Button>
              </div>
            </CardContent>

            <CardFooter className="hidden">
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Fetching...
                  </>
                ) : (
                  "Submit"
                )}
              </Button>
            </CardFooter>
          </Card>

          {/* <div className="w-8 h-full bg-muted "> */}
          <Button
            type="submit"
            className="h-64 min-w-48 max-md:hidden"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Fetching...
              </>
            ) : (
              "Submit"
            )}
          </Button>
        </form>
        {/* </div> */}
        {/* </div> */}
      </div>
      {/* Error Alert */}
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

      {/* Results Card */}
      {result && result?.currencies?.length > 0 && (
        <>
          <div className="flex flex-row gap-8">
            <InvestmentPieChart investmentData={result} />
            {/* <Suspense>
              <NewsCard />
            </Suspense> */}
          </div>
          <ResultCard result={result} />
          <PredictionChart />
        </>
      )}
    </div>
  );
}
