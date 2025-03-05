"use client";
import { CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TooltipComponent } from "@/components/ui/tooltip";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useState, useActionState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { RiskAnalysis } from "./actions";
import { ResultType } from "@/lib/types";
import InvestmentPieChart from "./InvestmentPieChart";

export default function FormComponent() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<ResultType | null>(null);

  async function handleFormSubmit(formData: FormData) {
    setIsLoading(true);
    setError(null);
    try {
      console.log(formData);
      const risk = formData.get("risk");
      const amount = formData.get("amount");
      const exit = formData.get("exit");
      const diversification = formData.get("diversification");
      const minPrice = formData.get("min-price");
      const maxPrice = formData.get("max-price");

      // Process the form data (e.g., save to database)
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

      setResults(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <Card className="w-full max-w-md mx-auto my-10">
        <CardHeader>
          <CardTitle>Portfolio Optimizer</CardTitle>
          <CardDescription className="text-pretty">
            Portfolio Optimizer is an AI-powered tool that helps you optimize
            your investment portfolio. It uses machine learning algorithms to
            analyze your investment goals, risk tolerance, and market conditions
            to provide you with a diversified and optimized portfolio.
          </CardDescription>
        </CardHeader>
        <form action={handleFormSubmit}>
          <CardContent className="space-y-6 mb-4">
            <div className="space-y-3">
              <Label htmlFor="name">
                Deposit Amount{" "}
                <TooltipComponent hoverText="Enter Amount to Invest <b>(Just for Visualization, Amount will not be deducted)</b>" />
              </Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                placeholder="Enter Amount to Invest"
                required
              />
            </div>

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
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="low" id="low" />
                  <Label htmlFor="low">Low Risk</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="medium" id="medium" />
                  <Label htmlFor="medium">Medium Risk</Label>
                </div>
                <div className="flex items-center space-x-2">
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
              <input type="hidden" name="min-price" id="min-price" value="10000" />
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
                  if (minPriceInput) minPriceInput.value = values[0].toString();
                  if (maxPriceInput) maxPriceInput.value = values[1].toString();
                }}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>$10K</span>
                <span>$1M</span>
              </div>
            </div>
          </CardContent>

          {isLoading && (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Fetching...
            </>
          )}

          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Fetching...
                </>
              ) : (
                "Submit"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="w-full max-w-md mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* No Results Message */}
      {results && results.currencies?.length === 0 && (
        <Card className="w-full max-w-md mx-auto">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              No products found matching your criteria.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Results Card */}
      {results && results.currencies?.length > 0 && (
        <>
          <Card className="w-full max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Filtered Coins</CardTitle>
              <CardDescription>
                Found {results.currencies?.length} coins matching your criteria
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="divide-y">
                {results.currencies?.map((product) => (
                  <li key={product.id} className="py-3">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-medium">
                          {product.name} ({product.symbol})
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {product.slug}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${product.price}</p>
                        <p className="text-sm text-muted-foreground">
                          Average Volume: {product.avgVolume}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <InvestmentPieChart investmentData={results} />
          <div id="error-holder"></div>
          <div>
            <iframe
              onError={() => {
                const holder = document.getElementById("error-holder");
                if (holder) {
                  holder.innerHTML = "<b>Unable to load Prediction Chart</b>";
                }
              }}
              src="http://localhost:8000/static/forecast_BNBUSDT.html"
              className="w-full h-screen"
            ></iframe>
          </div>
        </>
      )}
    </div>
  );
}
