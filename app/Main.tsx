"use client";
import React, { useState, useActionState } from "react";
import { BarChart2, Grid, Loader2, AlertCircle } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  Sector,
} from "recharts";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";

import { RiskAnalysis } from "@/app/actions/actions";
import InvestmentPieChart from "./InvestmentPieChart";
import ResultCard from "./ResultsCard";
import PredictionChart from "./PredictionChart";
import { ResultType } from "@/lib/types";
import { assignPercentages } from "./actions/chart-actions";
import { colors } from "@/components/colors";
import { ChatBot } from "@/components/ChatBot";

export default function MainComponent() {
  const [error, setError] = useState<string | null>(null);

  const [result, formAction, isPending] = useActionState(
    (_: unknown, formData: FormData) => handleFormSubmit(formData),
    null
  );

  const [rangeValue, setRangeValue] = useState(5);
  const [minMaxRange, setMinMaxRange] = useState([50000, 150000]);
  const [amount, setAmount] = useState(0);
  const [riskLevel, setRiskLevel] = useState("medium");
  const [exitFrequency, setExitFrequency] = useState("regular");

  // Sample data for the pie chart
  const pieData = [
    { name: "Analytics", value: 425, color: "#6366F1" },
    { name: "Marketing", value: 318, color: "#8B5CF6" },
    { name: "Development", value: 256, color: "#EC4899" },
    { name: "Research", value: 178, color: "#F59E0B" },
  ];

  // Sample data for the table
  const tableData = [
    {
      id: 1,
      category: "Analytics",
      value: 425,
      percentage: "36.1%",
      trend: "up",
    },
    {
      id: 2,
      category: "Marketing",
      value: 318,
      percentage: "27.0%",
      trend: "down",
    },
    {
      id: 3,
      category: "Development",
      value: 256,
      percentage: "21.7%",
      trend: "up",
    },
    {
      id: 4,
      category: "Research",
      value: 178,
      percentage: "15.2%",
      trend: "stable",
    },
  ];

  async function handleFormSubmit(formData: FormData) {
    console.log({
      riskLevel,
      exitFrequency,
      rangeValue,
      minMaxRange,
      amount,
    });

    setError(null);
    try {
      const risk = riskLevel;
      // const amount = amount;
      const exit = exitFrequency;
      const diversification = rangeValue;
      const minPrice = minMaxRange[0];
      const maxPrice = minMaxRange[1];

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
    <div className="lg:col-span-2 space-y-6">
      {/* Input Card */}
      <div className={`rounded-xl ${"bg-white"} shadow-xl overflow-hidden`}>
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-6 flex items-center">
            <Grid size={18} className="mr-2 text-indigo-500" />
            Data Configuration
          </h2>
          <form action={formAction}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium mb-3 text-opacity-80">
                  Risk Level
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
                <label className="block text-sm font-medium mb-3 text-opacity-80">
                  Exit Frequency
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
                    className="block text-sm font-medium text-opacity-80"
                  >
                    Diversification
                  </label>
                  <span
                    className={`text-sm font-semibold px-2 py-1 rounded-full ${"bg-indigo-100 text-indigo-700"}`}
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
                  <label className="block text-sm font-medium text-opacity-80">
                    Daily Trading Volume
                  </label>
                  <span
                    className={`text-sm font-semibold px-2 py-1 rounded-full ${"bg-indigo-100 text-indigo-700"}`}
                  >
                    {`$${minMaxRange[0].toLocaleString()} - $${minMaxRange[1].toLocaleString()}`}
                  </span>
                </div>

                {/* Using shadcn/ui Slider for range */}
                <div className="px-2 py-4">
                  <Slider
                    max={1_000_000}
                    min={10_000}
                    step={5_000}
                    defaultValue={[50_000, 150_000]}
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
                  className="block text-sm font-medium mb-1 text-opacity-80"
                >
                  Investment Amount
                </label>
                <div className="flex rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500">
                  <div
                    className={`px-4 py-3 text-sm font-medium ${"bg-gray-200 text-gray-700"}`}
                  >
                    USD
                  </div>
                  <input
                    id="number"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
                    className={`w-full px-4 py-3 ${"bg-gray-50"} focus:outline-none`}
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
          <ResultCard result={result} />
          <ChatBot result={result} />
          <PredictionChart />
        </>
      )}

      {/* <ResultSection
        result={{
          currencies: [
            {
              Risk_Value: 0.5796327146103268,
              id: 2765,
              name: "XYO",
              symbol: "XYO",
              slug: "xyo",
              price: 0.01066037907879339,
              volume_24h: 13825676.04867687,
              volatility: 10.594612937088788,
              growth: -17.127231544658635,
              avgVolume: 5137014.820192304,
              historicalData: {
                today: 0.011491809360860855,
                before30Days: 0.018134263661215188,
                before60Days: 0.019075039133510444,
                before90Days: 0.02797812871330347,
                before120Days: 0.005778937672239598,
                before150Days: 0.00599262957459034,
                before180Days: 0.004510874743074527,
              },
            },
            {
              Risk_Value: 0.5796327146103268,
              id: 4269,
              name: "GateToken",
              symbol: "GT",
              slug: "gatetoken",
              price: 19.45504686404595,
              volume_24h: 35017765.28821354,
              volatility: 3.1180161451935886,
              growth: 164.61550990713917,
              avgVolume: 10647460.829505498,
              historicalData: {
                today: 19.85574425412193,
                before30Days: 21.5849545779923,
                before60Days: 18.398661172915894,
                before90Days: 12.528880498945254,
                before120Days: 9.628556785790911,
                before150Days: 9.130381040468674,
                before180Days: 8.2566632277736,
              },
            },
            {
              Risk_Value: 0.5796327146103268,
              id: 9067,
              name: "Olympus v2",
              symbol: "OHM",
              slug: "olympus",
              price: 22.09590863147203,
              volume_24h: 339961.09280893,
              volatility: 2.267222110176627,
              growth: 81.8632328141167,
              avgVolume: 397144.02126373636,
              historicalData: {
                today: 22.183765744525253,
                before30Days: 25.063055268984133,
                before60Days: 21.743409529685334,
                before90Days: 21.00723936494406,
                before120Days: 16.763663494416406,
                before150Days: 15.67013427372964,
                before180Days: 15.080123195545317,
              },
            },
            {
              Risk_Value: 0.5796327146103268,
              id: 16093,
              name: "Bitkub Coin",
              symbol: "KUB",
              slug: "bitkub-coin",
              price: 1.6506738047816214,
              volume_24h: 414349.62372122,
              volatility: 3.333026554628001,
              growth: -43.369724068582975,
              avgVolume: 1029582.2664010981,
              historicalData: {
                today: 1.6839050163525557,
                before30Days: 1.9658051044101583,
                before60Days: 1.9678001268487775,
                before90Days: 2.3940327029002932,
                before120Days: 2.2843411191297913,
                before150Days: 2.1953632110644166,
                before180Days: 1.7874802278674076,
              },
            },
            {
              Risk_Value: 0.5796327146103268,
              id: 27765,
              name: "Zeebu",
              symbol: "ZBU",
              slug: "zeebu",
              price: 3.692267913226455,
              volume_24h: 1957050.40075294,
              volatility: 1.84804775637808,
              growth: 2.958617223417451,
              avgVolume: 22796119.42343407,
              historicalData: {
                today: 3.738329692089191,
                before30Days: 3.890968150689819,
                before60Days: 4.265043833988489,
                before90Days: 4.493340968317102,
                before120Days: 5.047084895037133,
                before150Days: 4.1148504531511225,
                before180Days: 4.7026825041219995,
              },
            },
          ],
          risk: 48,
          volume: 505000,
          diversification: 5,
          depositAmount: 8889,
        }}
      /> */}
    </div>
  );
}

function ResultSection({ result }: { result: ResultType }) {
  const percentageData = assignPercentages(
    result.currencies,
    result.risk,
    result.volume,
    result.diversification,
    result.depositAmount
  );

  if (!result) {
    return null;
  }

  const sortedData = percentageData?.sort(
    (a, b) => Number(b.percentage) - Number(a.percentage)
  );
  return (
    <>
      <div className={`rounded-xl ${"bg-white"} shadow-xl overflow-hidden`}>
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-1 flex items-center">
            <BarChart2 size={18} className="mr-2 text-indigo-500" />
            Investment Analysis
          </h2>
          <p className="text-sm text-opacity-70 mb-6">
            Analyze investment shares among the filtered coins
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pie Chart */}
            <div className="h-64 relative">
              <div
                className={`absolute inset-0 flex items-center justify-center ${"bg-gray-50/50"} rounded-lg z-0`}
              >
                <div
                  className={`w-32 h-32 rounded-full ${"bg-gray-100"} opacity-50`}
                ></div>
              </div>
              <div className="relative z-10 h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      //   activeIndex={activeIndex}
                      //   activeShape={renderActiveShape}
                      //   data={pieData}
                      //   cx="50%"
                      //   cy="50%"
                      data={sortedData?.map((i) => ({
                        percentage: parseFloat(i.percentage),
                        name: i.name,
                        symbol: i.symbol,
                      }))}
                      innerRadius={35}
                      outerRadius={55}
                      dataKey="percentage"
                      //   onMouseEnter={onPieEnter}
                      //   label={({ symbol, percentage }) =>
                      //     `${symbol}: ${percentage}%`
                      //   }
                    >
                      {/* {pieData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={colors[index % 20]}
                          stroke={"white"}
                          strokeWidth={2}
                        />
                      ))} */}
                      {sortedData?.map((_, index: number) => (
                        <Cell key={`cell-${index}`} fill={colors[index % 20]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: "8px",
                        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                        border: "none",
                        background: "white",
                      }}
                      itemStyle={{ color: "#111827" }}
                    />
                    <Legend
                      layout="vertical"
                      verticalAlign="middle"
                      align="right"
                      iconType="circle"
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-lg">
              <div className={`${"bg-gray-50"} px-4 py-3 font-medium text-sm`}>
                Detailed Breakdown
              </div>
              <div className="overflow-x-auto">
                <table
                  className={`min-w-full divide-y divide-opacity-10 ${"divide-gray-200"}`}
                >
                  <thead className={"bg-gray-50/80"}>
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-opacity-70"
                      >
                        Symbol
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-opacity-70"
                      >
                        Amount
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-opacity-70"
                      >
                        Investment Share
                      </th>
                      {/* <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-opacity-70"
                      >
                        Trend
                      </th> */}
                    </tr>
                  </thead>
                  <tbody
                    className={`divide-y divide-opacity-10 ${"divide-gray-200"}`}
                  >
                    {sortedData?.map((row, index) => (
                      <tr
                        key={index}
                        className={`hover:bg-opacity-50 ${"hover:bg-gray-50"}`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center">
                            <div
                              className={`w-12 h-1.5 rounded-full overflow-hidden ${"bg-gray-200"} mr-2`}
                            >
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: row?.percentage,
                                  backgroundColor: colors[index % 20],
                                }}
                              ></div>
                            </div>
                            {row?.symbol}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          $ {row?.price?.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {row?.percentage?.toString()} %
                        </td>
                        {/* <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {getTrendIcon(row.trend)}
                        </td> */}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
