"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { useEffect, useState } from "react";
import {
  callPrediction,
  fetchPreviousPredictionsList,
} from "./actions/prediction-actions";
import { CartesianGrid, Line, LineChart, XAxis, YAxis, Legend } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { PriceData } from "@/lib/types";

// const CURRENCIES = ["BTC-USD", "BNB-USD", "DOGE-USD", "SOL-USD"];

export default function PredictionChart() {
  const [currencies, setCurrencies] = useState(["BTC-USD"]);
  const [selectedCurrency, setSelectedCurrency] = useState(currencies?.at(0));

  const [priceData, setPriceData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function get() {
      const result = await fetchPreviousPredictionsList();
      setCurrencies(result);
    }
    get();
  }, []);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        if (!selectedCurrency) throw Error("Please select a currency");
        const result = await callPrediction(selectedCurrency);
        console.log("result ", result);

        if ((result as any).error) {
          throw Error((result as any).error);
        }
        if (result) {
          setPriceData(result);
        } else {
          setError(result || "Failed to fetch price data");
        }
      } catch (err) {
        setError("An unexpected error occurred. " + err?.toString());
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [selectedCurrency]);

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
                {currencies?.map((currency, index) => (
                  <SelectItem key={index} value={currency}>
                    {currency}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <ResultSection error={error} loading={loading} priceData={priceData} />
      </Card>
    </>
  );
}

function ResultSection({
  loading,
  error,
  priceData,
}: {
  loading: boolean;
  error: string | null;
  priceData: any;
}) {
  if (loading) {
    return (
      <CardContent className="flex items-center justify-center h-[400px]">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-sm text-muted-foreground">Loading price data...</p>
        </div>
      </CardContent>
    );
  }

  if (error) {
    return (
      <CardContent className="flex items-center justify-center h-[400px]">
        <div className="flex flex-col items-center gap-2 text-center">
          <p className="text-destructive font-semibold">Error loading data</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </CardContent>
    );
  }

  if (!priceData) {
    return null;
  }

  return <PriceChart data={priceData} />;
}

function PriceChart({ data }: { data: PriceData }) {
  // Process the data for the chart
  const chartData = processChartData(data);

  return (
    <>
      <CardHeader>
        <CardTitle>Price Chart</CardTitle>
        <CardDescription>Historical and predicted price values</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            historical: {
              label: "Historical",
              color: "hsl(var(--chart-1))",
            },
            prediction: {
              label: "Prediction",
              color: "hsl(var(--chart-2))",
            },
          }}
          className="h-[400px] w-full"
        >
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickFormatter={(value) => {
                const date = new Date(value);
                return `${date.getMonth() + 1}/${date.getDate()}`;
              }}
            />
            <YAxis />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, name) => (
                    <span className="font-medium">
                      {Number(value).toFixed(2)}
                    </span>
                  )}
                />
              }
            />
            <Line
              type="natural"
              dataKey="historical"
              stroke="var(--chart-3)"
              strokeWidth={1}
              dot={{ r: 0 }}
              activeDot={{ r: 6 }}
              connectNulls
            />
            <Line
              type="natural"
              dataKey="prediction"
              stroke="var(--chart-4)"
              strokeWidth={1}
              strokeDasharray="5 5"
              dot={{ r: 0 }}
              activeDot={{ r: 6 }}
              connectNulls
            />
            <Legend verticalAlign="top" height={36} />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </>
  );
}

// Helper function to process the data for the chart
function processChartData(data: PriceData) {
  const allDates = [
    ...Object.keys(data.historical),
    ...Object.keys(data.prediction),
  ].sort();

  return allDates.map((date) => ({
    date,
    historical: data.historical[date] || null,
    prediction: data.prediction[date] || null,
  }));
}
