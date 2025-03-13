export interface filterCriteria {
  risk: string;
  amount: number;
  exit: string;
  diversification: number;
  minPrice: number;
  maxPrice: number;
}

export interface QuoteType {
  USD: {
    price: number;
    volume_24h: number;
    volume_change_24h: number;
    percent_change_1h: number;
    percent_change_24h: number;
    percent_change_7d: number;
    percent_change_30d: number;
    percent_change_60d: number;
    percent_change_90d: number;
    market_cap: number;
    market_cap_dominance: number;
    fully_diluted_market_cap: number;
    tvl?: number;
    last_updated: string;
  };
}

export interface CurrencyDetails {
  id: number;
  name: string;
  symbol: string;
  slug: string;
  num_market_pairs: number;
  date_added: string;
  tags: string[];
  max_supply?: number;
  circulating_supply?: number;
  total_supply: number;
  infinite_supply: boolean;
  platform?: {
    id: number;
    name: string;
    symbol: string;
    slug: string;
    token_address: string;
  };
  cmc_rank: number;
  self_reported_circulating_supply: number;
  self_reported_market_cap: number;
  tvl_ratio?: number;
  last_updated: string;
  quote: QuoteType;
}

export interface SymbolRiskItem {
  Risk_Level: string;
  Risk_Value: number;
  Symbol: string;
}

export type riskAnalyzerAICallResponse = {
  found_symbols: SymbolRiskItem[];
  not_found_symbols: Partial<SymbolRiskItem>[];
};

export type exitFrequencyCallResponse = {
  id: string;
  name: string;
  symbol: string;
  classification: {
    type: string;
    values: {
      volatility: number;
      growth: number;
      avgVolume: number;
    };
  };
  historicalData: HistoricalDataType;
}[];

export type RefinedCurrencies = {
  id: number;
  name: string;
  symbol: string;
  slug: string;
  price: number;
  volume_24h: number;
};

export type CurrenciesType = {
  volatility: number;
  growth: number;
  avgVolume: number;
  historicalData: HistoricalDataType;
  id?: number;
  name?: string;
  price?: number;
  slug?: string;
  symbol?: string;
  volume_24h?: number;
  Risk_Value?: number | undefined;
};

export type ResultType = {
  currencies: CurrenciesType[];
  risk: number;
  volume: number;
  diversification: number;
  depositAmount: number;
};

export type assignPercentagesResponse = {
  Risk_Value?: number;
  avgVolume: number;
  growth: number;
  id?: string | number;
  name?: string;
  percentage: string;
  price: number;
  similarityScore: number;
  slug?: string;
  symbol?: string;
  volatility: number;
  volume_24h?: number;
  historicalData: HistoricalDataType;
}[];

export type percentageChangeCallResponse = {
  symbol: string;
  predicted_price: number;
  predicted_percentage_change: number;
}[];

export type HistoricalDataType = {
  today: number;
  before1hours: number;
  before24hours: number;
  before7Days: number;
  before30Days: number;
  before60Days: number;
  before90Days: number;
  before120Days?: number;
  before150Days?: number;
  before180Days?: number;
};

export interface PriceData {
  symbol: string;
  predictedAt: string;
  historical: Record<string, number>;
  prediction: Record<string, number>;
}
