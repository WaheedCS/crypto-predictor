"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  assignPercentagesResponse,
  HistoricalDataType,
  ResultType,
} from "@/lib/types";
import {
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";

export default function ResultCard({
  result,
}: {
  result: assignPercentagesResponse;
}) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Filtered Coins</CardTitle>
        <CardDescription>
          Found {result?.length} coins matching your criteria
        </CardDescription>
      </CardHeader>
      <CardContent>
        <table
          className={`min-w-full divide-y divide-opacity-10 ${"divide-gray-200"} `}
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
                Price & Volume
              </th>
              <th
                scope="col"
                className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-opacity-70 max-md:hidden"
              >
                Price History
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
            className={`divide-y divide-opacity-10 ${"divide-gray-200"} overflow-scroll`}
          >
            {result?.map((product, index) => (
              <tr
                key={index}
                className={`hover:bg-opacity-50 ${"hover:bg-gray-50"}`}
              >
                <td className="px-3 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center">
                    <div className={`rounded-full`}>
                      <h3 className="font-medium">
                        {product.name} ({product.symbol})
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {product.slug}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm">
                  <div className="text-balance">
                    <p className="font-medium">${(product as any).quote.USD.price?.toString()}</p>
                    <p className="text-sm text-muted-foreground">
                      Average Volume: {product.avgVolume}
                    </p>
                  </div>
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm max-md:hidden">
                  <HistoricalChart data={product.historicalData} />
                </td>
                {/* <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        {getTrendIcon(row.trend)}
                                      </td> */}
              </tr>
            ))}
            {/* <tr key={product.id} className="py-3">
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-medium">
                      {product.name} ({product.symbol})
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {product.slug}
                    </p>
                  </div>
                  <div className="flex flex-row gap-4 max-md:flex-col">
                    <div className="text-right">
                      <p className="font-medium">${product.price}</p>
                      <p className="text-sm text-muted-foreground">
                        Average Volume: {product.avgVolume}
                      </p>
                    </div>
                    <div className="w-full max-w-lg">
                      <HistoricalChart data={product.historicalData} />
                    </div>
                  </div>
                </div>
              </tr> */}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}

function HistoricalChart({ data }: { data: HistoricalDataType }) {
  const formattedData = [
    // { name: "180d", value: data.before180Days || 0 },
    // { name: "150d", value: data.before150Days || 0 },
    // { name: "120d", value: data.before120Days || 0 },
    { name: "90d", value: data.before90Days },
    { name: "60d", value: data.before60Days },
    { name: "30d", value: data.before30Days },
    { name: "7d", value: data.before7Days },
    { name: "24h", value: data.before24hours },
    { name: "1h", value: data.before1hours },
    { name: "now", value: data.today },
  ];

  return (
    <>
    {/* <ResponsiveContainer width='100%' height='100%'> */}
      <LineChart width={200} height={100} data={formattedData} dataKey="value">
        <Tooltip
          labelFormatter={(_, payload) => `${payload?.at(0)?.payload?.name}`}
          position={{ x: 100, y: 100 }}
          />
        <Line type="monotone" dataKey="value" stroke="#8884d8" dot={false} />
        {/* <XAxis dataKey="name" scale="log" domain={['auto', 'auto']} />
      <YAxis dataKey="value" /> */}
      </LineChart>
    {/* </ResponsiveContainer> */}
      </>
  );
}
