"use client";

import { BarChart2 } from "lucide-react";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { assignPercentages } from "@/app/actions/chart-actions";
import { ChatBot } from "@/components/ChatBot";
import ResultCard from "@/components/ResultsCard";
import { colors } from "@/lib/colors";
import { ResultType } from "@/lib/types";

export function ResultSection({ result }: { result: ResultType }) {
  console.log("result section ", result);

  const percentageData = assignPercentages(
    result.currencies,
    result.risk,
    result.volume,
    result.diversification,
    result.depositAmount,
  );

  if (!result) {
    return null;
  }

  const sortedData = percentageData?.sort(
    (a, b) => Number(b.percentage) - Number(a.percentage),
  );

  console.log("soreted ", sortedData);
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
                        className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-opacity-70"
                      >
                        Symbol
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-opacity-70"
                      >
                        Amount
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-opacity-70"
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
                        <td className="px-3 py-4 whitespace-nowrap text-sm font-medium">
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
                        <td className="px-3 py-4 whitespace-nowrap text-sm">
                          $ {row?.price?.toLocaleString()}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm">
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
      <ResultCard result={sortedData} />
      <ChatBot result={result} />
    </>
  );
}
