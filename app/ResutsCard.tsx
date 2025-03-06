"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { HistoricalDataType, ResultType } from "@/lib/types";
import { Line, LineChart, Tooltip } from "recharts";

export default function ResultCard({ result }: { result: ResultType }) {
  return (
    <Card className="w-full max-w-xl mx-auto">
      <CardHeader>
        <CardTitle>Filtered Coins</CardTitle>
        <CardDescription>
          Found {result?.currencies?.length} coins matching your criteria
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="divide-y">
          {result?.currencies?.map((product) => (
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
                <div></div>
                <HistoricalChart data={product.historicalData} />
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function HistoricalChart({ data }: { data: HistoricalDataType }) {
  const formattedData = [
    { name: "180d", value: data.before180Days },
    { name: "150d", value: data.before150Days },
    { name: "120d", value: data.before120Days },
    { name: "90d", value: data.before90Days },
    { name: "60d", value: data.before60Days },
    { name: "30d", value: data.before30Days },
    { name: "today", value: data.today },
  ];

  return (
    <LineChart width={100} height={50} data={formattedData} dataKey="value">
      <Tooltip
        labelFormatter={(_, payload) => `${payload?.at(0)?.payload?.name}`}
      />
      <Line type="monotone" dataKey="value" stroke="#8884d8" dot={false} />
    </LineChart>
  );
}
