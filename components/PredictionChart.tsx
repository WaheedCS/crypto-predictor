"use client";
import {
  fetchCoinForecasting,
  fetchHtmlContent,
  fetchPreviousPredictionsList,
} from "@/app/actions/prediction-actions";
import HtmlChartViewer from "@/components/HtmlChartViewer";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PriceData } from "@/lib/types";
import { Label } from "@radix-ui/react-label";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

const CURRENCIES = ["BTCUSDT", "ETHUSDT", "BNBUSDT", "DOGEUSDT", "LINKUSDT"];

export default function PredictionChart() {
  const [selectedCurrency, setSelectedCurrency] = useState<string | undefined>(
    undefined
  );

  return (
    <>
      <Card>
        <div className="mx-auto max-w-md flex gap-4 items-center">
          <Label>Selected Currency Forecast</Label>
          <Select
            value={undefined}
            onValueChange={(value) => setSelectedCurrency(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select a Currency" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Currencies</SelectLabel>
                {CURRENCIES?.map((currency, index) => (
                  <SelectItem key={index} value={currency}>
                    {currency?.replace("USDT", "")}
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
        {/* {selectedCurrency?.path && (
          <HtmlChartViewer url={selectedCurrency?.path} />
        )} */}
        {selectedCurrency && (
          <CurrencyForecastSection currency={selectedCurrency} />
        )}
      </Card>
    </>
  );
}

function CurrencyForecastSection({ currency }: { currency: string }) {
  const [URL, setURL] = useState<string | null>(null);
  const [ERROR, setERROR] = useState<string | null>(null);
  async function fetchCoinForecast() {
    try {
      setERROR(null);
      const data = await fetchCoinForecasting(currency);
      if (!data.url) {
        throw Error("No URL found");
      }
      setURL(data.url);
    } catch (e) {
      setERROR(String(e));
    }
  }

  useEffect(() => {
    fetchCoinForecast();
  }, [currency]);

  return <>{URL && <FetchAndDisplayHTML url={URL} />}</>;
}

const FetchAndDisplayHTML = ({ url }: { url: string }) => {
  const [htmlContent, setHtmlContent] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHtml = async () => {
      try {
        setLoading(true);
        setError(null);
        const html = await fetchHtmlContent(url);
        setHtmlContent(html);
      } catch (err) {
        setError(String(err));
      } finally {
        setLoading(false);
      }
    };

    fetchHtml();
  }, [url]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 bg-gray-100 border rounded-md w-full h-full">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <span className="ml-2 text-gray-600">Loading Forecast...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-white bg-red-500 border rounded-md w-full h-auto">
        <h3 className="mb-2 text-lg font-semibold">Error Loading Content</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <iframe
      title="HTML Content"
      srcDoc={htmlContent}
      style={{ width: "100%", height: "500px", border: "none" }}
      className="min-h-[850px]"
    />
  );
};

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
