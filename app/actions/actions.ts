"use server";

import { COIN_SEARCH_RESPONSE } from "@/lib/COIN_SEARCH_RESPONSE";
import {
  CurrencyDetails,
  exitFrequencyCallResponse,
  filterCriteria,
  HistoricalDataType,
  QuoteType,
  RefinedCurrencies,
  ResultType,
  riskAnalyzerAICallResponse,
  SymbolRiskItem,
} from "@/lib/types";
import axios from "axios";

export async function RiskAnalysis(data: filterCriteria) {
  try {
    console.log("started risk analysis for data ", data);

    // -------- Get All Currencies --------
    let currencies = await getAllCurrenciesCall(data.minPrice, data.maxPrice);
    // COIN_SEARCH_RESPONSE.data as CurrencyDetails[];
    if (!currencies) {
      throw Error(
        "No Currencies found for these parameters. Please adjust your requirements and try again.",
      );
    }

    const riskAnalyzer = await riskAnalyzerAICall(currencies);
    if (!riskAnalyzer) {
      throw Error("No risk analysis provided for selected coins.");
    }
    const riskAnalyzerCoins = riskAnalyzer.found_symbols.filter(
      (risk) => data.risk === risk.Risk_Level,
    );
    if (riskAnalyzerCoins?.length === 0) {
      throw Error(
        "No coins found for your selected risk level. Please re-adjust your risk level and try again.",
      );
    }
    const riskData = riskAnalyzerCoins.map((risk) => ({
      Risk_Value: risk.Risk_Value,
      ...currencies.find((currency) => currency.symbol === risk.Symbol),
    }));

    let exitFrequencyResult = riskData?.map((i) => {
      const { averageVolume, exitFrequency, growth, volatility } =
        calculateExitFrequency(i as CurrencyDetails);
      return {
        ...i,
        classification: exitFrequency,
        volatility,
        growth,
        averageVolume,
      };
    });
    if (!exitFrequencyResult) {
      throw Error(
        "No results found for your selected exit frequency. Please re-adjust your exit frequency and try again.",
      );
    }
    const exitFrequencyCoinsResult = exitFrequencyResult.filter(
      (currency) => currency.classification === data.exit,
    );
    if (exitFrequencyCoinsResult.length === 0) {
      throw Error(
        "No coins found for your selected exit frequency. Please re-adjust your exit frequency and try again.",
      );
    }
    const result = exitFrequencyCoinsResult.map((frequency) => ({
      ...riskData.find((c) => c.id?.toString() == frequency.id),

      volatility: frequency.volatility,
      growth: frequency.growth,
      avgVolume: frequency.averageVolume,
      historicalData: convertQuoteToHistoricalData(frequency.quote!),
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
    } as ResultType;
  } catch (serverError) {
    console.warn("No coins founds for selected parameters.");
    return {
      error:
        serverError?.toString() ||
        "Unable to fetch coins for selected parameters. Please re-adjust your values and try again.",
    };
  }
}

async function getAllCurrenciesCall(min: number, max: number) {
  console.log("fetching currencies for range ", min, "-", max);
  let currencies = [];
  let start = 1;
  let loops = 0;

  if (!min) {
    throw Error("Please provide min and max values");
  }

  console.log("max limit is ", max, " should get higher ", max === 0);

  // Fetch Currency Data
  const fetchCurrencies = async (start: number, min: number, max: number) => {
    const response = await axios.get(
      `https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?volume_24h_min=${min}${max ? `&volume_24h_max=${max}` : ""}&limit=5000&start=${start}`,
      {
        headers: {
          "X-CMC_PRO_API_KEY": process.env.COIN_MARKET_CAP_API_KEY!,
        },
      },
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
  symbols: CurrencyDetails[],
): Promise<riskAnalyzerAICallResponse | null> {
  console.log(
    "started risk analyzer for symbols ",
    symbols?.map((s) => s.name),
  );
  if (!symbols) {
    throw Error("Please provide symbols");
  }

  //// WEIGHTED RISK IMPLEMENTATION
  const found_symbols: SymbolRiskItem[] = [];
  const not_found_symbols: Partial<SymbolRiskItem>[] = [];
  const maxVolume = Math.max(...symbols.map((c) => c.quote.USD.volume_24h));
  symbols?.map((s) => {
    try {
      const result = calculateRisk(s, maxVolume);
      found_symbols.push({
        Symbol: s.symbol,
        Risk_Level: result.riskCategory,
        Risk_Value: result.riskScore,
      });
    } catch (e) {
      not_found_symbols.push({
        Symbol: s.symbol,
        Risk_Level: "high",
        Risk_Value: 0,
      });
    }
  });

  return { found_symbols, not_found_symbols };
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

function calculateRisk(
  coinData: CurrencyDetails,
  maxVolume: number,
): { riskScore: number; riskCategory: string } {
  const historicalData = convertQuoteToHistoricalData(coinData.quote);

  // 3.1.1 Volatility (Price Fluctuations)
  const logReturns: number[] = [
    Math.log(historicalData.today / historicalData.before1hours),
    Math.log(historicalData.today / historicalData.before24hours),
    Math.log(historicalData.today / historicalData.before7Days),
    Math.log(historicalData.today / historicalData.before30Days),
    Math.log(historicalData.today / historicalData.before90Days),
  ];

  const meanLogReturn =
    logReturns.reduce((a, b) => a + b, 0) / logReturns.length;
  const squaredDifferences = logReturns.map((value) =>
    Math.pow(value - meanLogReturn, 2),
  );
  const variance =
    squaredDifferences.reduce((a, b) => a + b, 0) / logReturns.length;
  const volatility = Math.sqrt(variance);

  // 3.1.2 Liquidity (Market Depth & Trading Volume)
  const averageVolume = coinData.quote.USD.volume_24h;
  // const maxVolume = Math.max(...allCoinData.map((c) => c.quote.USD.volume_24h));
  const liquidityScore = averageVolume / maxVolume;

  // 3.1.3 Trend Stability (Directional Movement)
  // Simplified MACD calculation (replace with proper MACD if needed)
  const macd =
    coinData.quote.USD.percent_change_7d -
    coinData.quote.USD.percent_change_30d;
  const trendInstability = Math.abs(macd);

  // 3.1.4 Historical Drawdown (Maximum Loss Over Time)
  const prices = Object.values(historicalData);
  let peakPrice = prices[0];
  let troughPrice = prices[0];
  let maxDrawdown = 0;

  for (const price of prices) {
    if (price > peakPrice) {
      peakPrice = price;
      troughPrice = price;
    } else if (price < troughPrice) {
      troughPrice = price;
      const drawdown = (peakPrice - troughPrice) / peakPrice;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    }
  }

  // 3.2.1 Compute Risk Score
  const alpha1 = 0.25;
  const alpha2 = 0.25;
  const alpha3 = 0.25;
  const alpha4 = 0.25;

  //   Investment Strategy:
  //      - Short-Term Trading:
  //          For short-term trading, you might prioritize liquidity and volatility, as you need to quickly enter and exit positions.
  //          Example: alpha1 = 0.35, alpha2 = 0.35, alpha3 = 0.15, alpha4 = 0.15.
  //      - Long-Term Investing:
  //          For long-term investing, you might prioritize historical drawdown and trend stability, as you're more concerned about long-term sustainability.
  //          Example: alpha1 = 0.15, alpha2 = 0.15, alpha3 = 0.35, alpha4 = 0.35.
  //      - High-Risk, High-Reward:
  //          If you're willing to take on more risk for potentially higher returns, you might prioritize volatility and liquidity.
  //          Example: alpha1 = 0.4, alpha2 = 0.4, alpha3 = 0.1, alpha4 = 0.1.
  //      - Risk-Averse:
  //          If you are very risk adverse you will prioritize Drawdown and trend stability.
  //          Example: alpha1 = 0.1, alpha2 = 0.1, alpha3 = 0.4, alpha4 = 0.4.

  const normalizedVolatility = volatility; // Assume 0-1 scale after calculation
  const normalizedLiquidity = 1 - liquidityScore; // Invert liquidity
  const normalizedTrendInstability = trendInstability / 100; // Assume 0-1 scale
  const normalizedDrawdown = maxDrawdown; // Assume 0-1 scale

  const riskScore =
    alpha1 * normalizedVolatility +
    alpha2 * normalizedLiquidity +
    alpha3 * normalizedTrendInstability +
    alpha4 * normalizedDrawdown;

  // 3.2.2 Classification
  let riskCategory: string;
  if (riskScore <= 0.3) {
    riskCategory = "low";
  } else if (riskScore <= 0.7) {
    riskCategory = "medium";
  } else {
    riskCategory = "high";
  }

  return { riskScore, riskCategory };
}

function calculateExitFrequency(coinData: CurrencyDetails): {
  exitFrequency: string;
  volatility: number;
  growth: number;
  averageVolume: number;
} {
  const percentChange7d = coinData.quote.USD.percent_change_7d;
  const percentChange30d = coinData.quote.USD.percent_change_30d;
  const percentChange90d = coinData.quote.USD.percent_change_90d;
  const volume24h = coinData.quote.USD.volume_24h;

  const volatility =
    (Math.abs(percentChange7d) +
      Math.abs(percentChange30d) +
      Math.abs(percentChange90d)) /
    3;
  const growth = (percentChange7d + percentChange30d + percentChange90d) / 3;
  const averageVolume = volume24h;

  let exitFrequency: string;

  if (isNaN(volatility) || isNaN(growth) || isNaN(averageVolume)) {
    exitFrequency = "Unclassified";
  } else if (volatility > 50 && growth < 0) {
    exitFrequency = "early";
  } else if (volatility > 20 && growth < 0) {
    exitFrequency = "regular";
  } else if (growth > 20 && volatility < 20) {
    exitFrequency = "late";
  } else {
    exitFrequency = "Unclassified";
  }

  return { exitFrequency, volatility, growth, averageVolume };
}

function convertQuoteToHistoricalData(quote: QuoteType): HistoricalDataType {
  const today = quote.USD.price;
  const before1hours = today / (1 + quote.USD.percent_change_1h / 100);
  const before24hours = today / (1 + quote.USD.percent_change_24h / 100);
  const before7Days = today / (1 + quote.USD.percent_change_7d / 100);
  const before30Days = today / (1 + quote.USD.percent_change_30d / 100);
  const before60Days = today / (1 + quote.USD.percent_change_60d / 100);
  const before90Days = today / (1 + quote.USD.percent_change_90d / 100);

  return {
    today,
    before1hours,
    before24hours,
    before7Days,
    before30Days,
    before60Days,
    before90Days,
  };
}
