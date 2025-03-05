"use client";
import { ResultType } from "@/lib/types";
import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { assignPercentages } from "./chart-actions";

const colors = [
  "#FF5733", // Vibrant Red
  "#33FF57", // Fresh Green
  "#3357FF", // Bright Blue
  "#FF33A1", // Pink
  "#FFBD33", // Orange
  "#A1FF33", // Lime
  "#33FFF5", // Cyan
  "#8A33FF", // Purple
  "#33FF8A", // Mint
  "#FF3368", // Coral
  "#3368FF", // Sky Blue
  "#FF8A33", // Sunset Orange
  "#FF5733", // Rose Red
  "#57FF33", // Spring Green
  "#5733FF", // Indigo
  "#33A1FF", // Ocean Blue
  "#F533FF", // Magenta
  "#33FFBD", // Turquoise
  "#BD33FF", // Lavender
  "#3357FF", // Royal Blue
];

export default function InvestmentPieChart({
  investmentData,
}: {
  investmentData: ResultType;
}) {
  //   const percentageData = investmentData?.map((i) =>
  //      assignPercentages(
  //       i.currencies,
  //       i.risk,
  //       i.volume,
  //       i.diversification,
  //       i.depositAmount
  //     )
  //   );

  const percentageData = assignPercentages(
    investmentData.currencies,
    investmentData.risk,
    investmentData.volume,
    investmentData.diversification,
    investmentData.depositAmount
  );

  return (
    <div className="w-full overflow-x-hidden flex flex-col gap-10 justify-center items-center py-5 max-md:px-4">
      <h2 className="text-transparent bg-clip-text bg-text-black-gradient font-bold text-6xl max-md:text-3xl text-center p-4">
        Suggested Portfolio
      </h2>
      <div className="w-full mx-auto flex max-lg:flex-col max-lg:gap-10 lg:gap-5 px-4 md:px-8 max-w-[1030px]">
        <div className="max-lg:w-full lg:w-1/2 mx-auto flex justify-end">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart className="outline-none border-none">
              <Pie
                data={percentageData?.map((i) => ({
                  percentage: parseFloat(i.percentage),
                }))}
                innerRadius={70}
                outerRadius={100}
                fill="#8884d8"
                paddingAngle={1}
                dataKey="percentage"
                // label={({ symbol, percentage }) => `${symbol}: ${percentage}`}
              >
                {percentageData.map((entry, index: number) => (
                  <Cell key={`cell-${index}`} fill={colors[index]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: "white", borderRadius: "8px" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="max-lg:w-full lg:w-1/2 mx-auto flex justify-center">
          <table className="border-collapse border border-gray-300 w-full max-w-md">
            <thead>
              <tr className="text-left">
                <th className="border border-gray-300 p-2">Currency</th>
                <th className="border border-gray-300 p-2">Similarity</th>
                <th className="border border-gray-300 p-2">Share</th>
              </tr>
            </thead>
            <tbody>
              {percentageData
                .sort((a, b) => Number(b.percentage) - Number(a.percentage))
                .map((item) => (
                  <tr key={item.id}>
                    <td className="border border-gray-300 p-2">
                      {item.symbol}
                    </td>
                    <td className="border border-gray-300 p-2">
                      {item.percentage}%
                    </td>
                    <td className="border border-gray-300 p-2">
                      ${Math.round(item.price * 100) / 100}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
