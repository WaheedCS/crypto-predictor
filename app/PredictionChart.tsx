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
import { useEffect, useRef, useState } from "react";
import {
  callPrediction,
  fetchPreviousPredictionsList,
} from "./actions/prediction-actions";
import {
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { PriceData } from "@/lib/types";
import HtmlChartViewer from "@/components/HtmlChartViewer";

// const CURRENCIES = ["BTC-USD", "BNB-USD", "DOGE-USD", "SOL-USD"];

export default function PredictionChart() {
  const [currencies, setCurrencies] =
    useState<{ name: string; url: string; path: string }[]>();
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

  // useEffect(() => {
  //   async function fetchData() {
  //     setLoading(true);
  //     setError(null);

  //     try {
  //       if (!selectedCurrency) throw Error("Please select a currency");
  //       const result = await callPrediction(selectedCurrency);
  //       console.log("result ", result);

  //       if ((result as any).error) {
  //         throw Error((result as any).error);
  //       }
  //       if (result) {
  //         setPriceData(result);
  //       } else {
  //         setError(result || "Failed to fetch price data");
  //       }
  //     } catch (err) {
  //       setError("An unexpected error occurred. " + err?.toString());
  //       console.error(err);
  //     } finally {
  //       setLoading(false);
  //     }
  //   }

  //   fetchData();
  // }, [selectedCurrency]);

  return (
    <>
      <Card>
        <div className="mx-auto max-w-md flex gap-4 items-center">
          <Label>Selected Currency Forecast</Label>
          <Select
            value={selectedCurrency?.name}
            onValueChange={(value) =>
              setSelectedCurrency(currencies?.find((c) => c.name === value))
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select a Currency" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Currencies</SelectLabel>
                {currencies?.map((currency, index) => (
                  <SelectItem key={index} value={currency?.name}>
                    {currency?.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        {/* <ResultSection
          key={selectedCurrency}
          error={error}
          loading={loading}
          priceData={priceData}
        /> */}
        {/* {selectedCurrency?.url && <iframe src={selectedCurrency?.path} />} */}
        {selectedCurrency?.path && (
          <HtmlChartViewer url={selectedCurrency?.path} />
        )}
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
          className="h-full w-full"
        >
          <ResponsiveContainer width="100%" height="100%">
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
              <Legend verticalAlign="bottom" height={36} />
            </LineChart>
          </ResponsiveContainer>
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

// const HtmlIframeLoader = ({ url }: {url: string}) => {
//   const iframeRef = useRef(null);

//   useEffect(() => {
//     const loadHtmlIntoIframe = async () => {
//       try {
//         // Fetch the HTML file from the provided URL
//         const response = await fetch(url);

//         // Ensure the request was successful
//         if (!response.ok) {
//           throw new Error(`Failed to fetch the file: ${response.statusText}`);
//         }

//         // Read the HTML content as text
//         const htmlContent = await response.text();

//         // Set the HTML content into the iframe
//         if (iframeRef.current) {
//           const iframeDocument =
//             iframeRef.current.contentDocument ||
//             iframeRef.current.contentWindow.document;
//           iframeDocument.open();
//           iframeDocument.write(htmlContent);
//           iframeDocument.close();
//         }
//       } catch (error) {
//         console.error("Error loading HTML file into iframe:", error);
//       }
//     };

//     if (url) {
//       loadHtmlIntoIframe();
//     }
//   }, [url]); // Re-run the effect if the URL changes

//   return (
//     <iframe
//       ref={iframeRef}
//       width="600"
//       height="400"
//       title="HTML Iframe"
//       style={{ border: "1px solid #ccc" }}
//     ></iframe>
//   );
// };
