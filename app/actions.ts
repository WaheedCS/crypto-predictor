"use server";

import {
  CurrencyDetails,
  exitFrequencyCallResponse,
  filterCriteria,
  RefinedCurrencies,
  riskAnalyzerAICallResponse,
} from "@/lib/types";
import axios from "axios";

export async function RiskAnalysis(data: filterCriteria) {
  console.log("started risk analysis for data ", data);

  // -------- Get All Currencies --------
  let currencies = await getAllCurrenciesCall(data.minPrice, data.maxPrice);
  if (!currencies) {
    throw Error(
      "No Currencies found for these parameters. Please adjust your requirements and try again."
    );
  }
  const refinedCurrencies = currencies.map((currency) => ({
    id: currency.id,
    name: currency.name,
    symbol: currency.symbol,
    slug: currency.slug,
    price: currency.quote.USD.price,
    volume_24h: currency.quote.USD.volume_24h,
  }));

  // -------- Filter by Risk Analyzer AI --------
  const riskAnalyzer = await riskAnalyzerAICall(refinedCurrencies);
  if (!riskAnalyzer) {
    throw Error("No risk analysis provided for selected coins.");
  }
  const riskAnalyzerCoins = riskAnalyzer.found_symbols.filter(
    (risk) => data.risk === risk.Risk_Level
  );
  if (riskAnalyzerCoins?.length === 0) {
    throw Error(
      "No coins found for your selected risk level. Please re-adjust your risk level and try again."
    );
  }
  const riskData = riskAnalyzerCoins.map((risk) => ({
    Risk_Value: risk.Risk_Value,
    ...refinedCurrencies.find((currency) => currency.symbol === risk.Symbol),
  }));

  // --------- Run Exit Frequency --------
  let exitFrequencyResult = await exitFrequencyCall(riskData);
  if (!exitFrequencyResult) {
    throw Error(
      "No results found for your selected exit frequency. Please re-adjust your exit frequency and try again."
    );
  }
  const exitFrequencyCoinsResult = exitFrequencyResult.filter(
    (currency) => currency.classification.type === 'Unclassified' //data.exit
  );
  if (exitFrequencyCoinsResult.length === 0) {
    throw Error(
      "No coins found for your selected exit frequency. Please re-adjust your exit frequency and try again."
    );
  }
  const result = exitFrequencyCoinsResult.map((frequency) => ({
    ...riskData.find((c) => c.id?.toString() == frequency.id),
    volatility: frequency.classification.values.volatility,
    growth: frequency.classification.values.growth,
    avgVolume: frequency.classification.values.avgVolume,
    historicalData: frequency.historicalData,
  }));

  // -------- Set User Values And Shuffle --------
  const volume = (data.minPrice + data.maxPrice) / 2;
  const risk = data.risk === "low" ? 8 : data.risk === "medium" ? 21 : 48;
  return {
    currencies: result,
    risk,
    volume,
    diversification: data.diversification,
    depositAmount: data.amount,
  };
}

async function getAllCurrenciesCall(min: number, max: number) {
  console.log("fetching currencies for range ", min, "-", max);
  let currencies = [];
  let start = 1;
  let loops = 0;

  if (!min || !max) {
    throw Error("Please provide min and max values");
  }

  // Fetch Currency Data
  const fetchCurrencies = async (start: number, min: number, max: number) => {
    const response = await axios.get(
      `https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?volume_24h_min=${min}&volume_24h_max=${max}&limit=5000&start=${start}`,
      {
        headers: {
          "X-CMC_PRO_API_KEY": process.env.COIN_MARKET_CAP_API_KEY!,
        },
      }
    );
    return response.data;
  };

  // Fetch Data
  let response = await fetchCurrencies(1, min, max);
  if (response.status > 299) {
    throw Error("Error fetching data");
  }

  // Set Currencies
  currencies = response.data;

  // Fetch Additional Data if Total Count is greater than 5000
  while (response.status.total_count > 5000) {
    loops++;
    start += 5000;
    response = await fetchCurrencies(start, min, max);
    if (response.status > 299) {
      throw Error("Error fetching data");
    }
    currencies = currencies.concat(response.data);
    if (loops > 30) {
      break;
    }
  }

  return currencies as CurrencyDetails[];
}

async function riskAnalyzerAICall(
  symbols: RefinedCurrencies[]
): Promise<riskAnalyzerAICallResponse | null> {
  console.log(
    "started risk analyzer for symbols ",
    symbols?.map((s) => s.name)
  );
  if (!symbols) {
    throw Error("Please provide symbols");
  }

  // // Fetch Currency Data
  // const response = await axios.post(
  //   `https://tp-po-cloudrun-606130396373.asia-south1.run.app/assess_risk`,
  //   {
  //     symbols,
  //   }
  // );

  // if (!response.data) {
  //   throw Error(response.data);
  // }

  // return { ...response.data };

  ///////////////////  TEMP CHANGE SINCE AI LINK NOT WORKING

  const randomValue = Math.random();

  const found_symbols = symbols?.slice(0, 20).map((i) => ({
    Risk_Level:
    Math.random() > 0.7 ? "high" : Math.random() > 0.3 ? "medium" : "low",
    Risk_Value: randomValue,
    Symbol: i.symbol,
  }));

  const not_found_symbols = symbols?.slice(5).map((i) => ({
    Risk_Level:
      randomValue > 0.7 ? "high" : randomValue > 0.3 ? "medium" : "low",
    Risk_Value: randomValue,
    Symbol: i.symbol,
  }));

  return { found_symbols, not_found_symbols };
}

const exitFrequencyCall = async (
  currencies: any[]
): Promise<exitFrequencyCallResponse | null> => {
  console.log("started exit frequency call for currencies ", currencies?.map((i)=>i.name));

  try {
    let historicalData: Record<string, any> = {};
    const batchSize = 27; // Maximum number of IDs per API call
    const totalBatches = Math.ceil(currencies.length / batchSize);

    // Generate batches of currency IDs
    const batchedIds = Array.from({ length: totalBatches }, (_, i) => {
      const from = i * batchSize;
      const to = from + batchSize;
      return currencies
        .slice(from, to)
        .map((currency) => currency.id)
        .join(",");
    });

    // Make API calls concurrently
    const responses = await Promise.all(
      batchedIds.map(
        (id) =>
          fetchCurrencyHistoricalData(id).catch((err) => {
            console.error(`Error fetching data for IDs: ${id}`, err);
            return null; // Handle failed requests gracefully
          })
        // axios
        //   .get(
        //     `/api/currencyRiskAnalysis/coinMarketCapCurrencyHistorical?id=${id}`
        //   )
        //   .catch((err) => {
        //     console.error(`Error fetching data for IDs: ${id}`, err);
        //     return null; // Handle failed requests gracefully
        //   })
      )
    );

    // Merge data from all responses
    responses.forEach((response) => {
      if (response && response.data) {
        const data = response.data;
        if (typeof data === "object") {
          // Check if data is an array-like object (multiple IDs) or a single item
          if (Array.isArray(Object.keys(data))) {
            historicalData = { ...historicalData, ...data };
          } else {
            historicalData = { ...historicalData, [data.id]: data };
          }
        }
      }
    });

    // Process the historicalData
    const results = Object.entries(historicalData).map(([id, data]) => {
      const classification = classifyCurrency(id, data);
      return {
        id,
        name: data.name,
        symbol: data.symbol,
        classification,
        historicalData: {
          today:
            historicalData[id].quotes[historicalData[id].quotes.length - 1]
              .quote.USD.close,
          before30Days:
            historicalData[id].quotes[historicalData[id].quotes.length - 30]
              .quote?.USD.close,
          before60Days:
            historicalData[id].quotes[historicalData[id].quotes.length - 60]
              .quote?.USD.close,
          before90Days:
            historicalData[id].quotes[historicalData[id].quotes.length - 90]
              .quote?.USD.close,
          before120Days:
            historicalData[id].quotes[historicalData[id].quotes.length - 120]
              .quote?.USD.close,
          before150Days:
            historicalData[id].quotes[historicalData[id].quotes.length - 150]
              .quote?.USD.close,
          before180Days:
            historicalData[id].quotes[historicalData[id].quotes.length - 180]
              .quote?.USD.close,
        },
      };
    });

    return results;
    // return exitFrequencyCallDummy;
  } catch (err) {
    console.log("error : ", err);
    return null;
  }
};

function classifyCurrency(id: string, historicalData: any) {
  const prices = historicalData.quotes.map(
    (day: any) => day.quote.USD.close
  ) as number[];
  const volumes = historicalData.quotes.map(
    (day: any) => day.quote.USD.volume
  ) as number[];

  // Calculate metrics
  const volatility = calculateVolatility(prices);
  const growth = calculateGrowth(prices);
  const avgVolume =
    volumes.reduce((sum, vol) => sum + vol, 0) / (volumes.length || 1); // Avoid divide-by-zero

  // Classification thresholds
  if (volatility > 5 && growth > 30 && avgVolume > 1e6) {
    return {
      type: "Early",
      values: { volatility, growth, avgVolume },
    };
  } else if (
    volatility >= 2 &&
    volatility <= 5 &&
    growth >= 10 &&
    growth <= 30 &&
    avgVolume > 5e5
  ) {
    return {
      type: "Regular",
      values: { volatility, growth, avgVolume },
    };
  } else if (volatility < 2 && growth < 10 && avgVolume < 5e5) {
    return {
      type: "Late",
      values: { volatility, growth, avgVolume },
    };
  } else {
    return {
      type: "Unclassified",
      values: { volatility, growth, avgVolume },
    };
  }
}

function calculateVolatility(prices: number[]) {
  const dailyChanges = prices
    .map((price, i) => {
      if (i === 0) return 0; // Skip the first element
      return (price - prices[i - 1]) / prices[i - 1];
    })
    .slice(1);

  const mean =
    dailyChanges.reduce((sum, change) => sum + change, 0) / dailyChanges.length;
  const variance =
    dailyChanges.reduce((sum, change) => sum + Math.pow(change - mean, 2), 0) /
    dailyChanges.length;

  return Math.sqrt(variance) * 100;
}

function calculateGrowth(prices: number[]) {
  return ((prices[prices.length - 1] - prices[0]) / prices[0]) * 100;
}

async function fetchCurrencyHistoricalData(id: string) {
  const timePeriod = "daily";
  const interval = "1d";
  const timeStart = new Date(
    new Date().setFullYear(new Date().getFullYear() - 1)
  )
    .toISOString()
    .split("T")[0];

  const timeEnd = new Date().toISOString().split("T")[0];

  // try {
  const apiUrl = new URL(
    "https://pro-api.coinmarketcap.com/v2/cryptocurrency/ohlcv/historical"
  );
  apiUrl.searchParams.set("id", id);
  apiUrl.searchParams.set("time_period", timePeriod);
  apiUrl.searchParams.set("interval", interval);

  if (timeStart) {
    apiUrl.searchParams.set("time_start", new Date(timeStart).toISOString());
  }
  if (timeEnd) {
    apiUrl.searchParams.set("time_end", new Date(timeEnd).toISOString());
  }

  const response = await fetch(apiUrl.toString(), {
    method: "GET",
    headers: {
      "X-CMC_PRO_API_KEY": process.env.COIN_MARKET_CAP_API_KEY!,
    },
  });
  // if (!response.ok) {
  //   return new Response(JSON.stringify({ error: response }), {
  //     status: 400,
  //     headers: { "Content-Type": "application/json" },
  //   });
  // }

  const data = await response.json();
  return data;
  // } catch (error) {
  //   console.error("API Error:", error);
  //   return new Response(JSON.stringify({ error: error }), {
  //     status: 500,
  //     headers: { "Content-Type": "application/json" },
  //   });
  // }
}
