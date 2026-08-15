import React, { useState, useEffect, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList,
} from "recharts";
import {
  Globe, TrendingUp, TrendingDown, AlertTriangle, Newspaper, Calendar as CalendarIcon,
  Landmark, Coins, Target, ArrowUpRight, ArrowDownRight, Search, LineChart as LineChartIcon,
  Fuel, Gem, Sprout, ChevronDown, Activity, Clock, Radio, RefreshCw, Boxes, Calculator, DollarSign, MapPin, Percent,
} from "lucide-react";

/* ============================== DESIGN TOKENS ============================== */
const COLORS = {
  bg: "#0A0D12",
  panel: "#12161D",
  panelAlt: "#171C24",
  panelHi: "#1C222C",
  border: "#232A35",
  borderHi: "#323B49",
  text: "#E7ECF3",
  muted: "#8B95A5",
  mutedDim: "#5B6472",
  brand: "#4CC9F0",
  brand2: "#7B61FF",
  up: "#31D0AA",
  down: "#FF5C7A",
  warn: "#F5B942",
};
const F_DISPLAY = '"Space Grotesk","Archivo Black","Helvetica Neue",Arial,sans-serif';
const F_DATA = '"IBM Plex Mono","JetBrains Mono",ui-monospace,SFMono-Regular,Menlo,Consolas,monospace';
const F_BODY = '"Inter","Helvetica Neue",Arial,sans-serif';

const selStyle = {
  width: "100%", marginTop: 5, padding: "8px 10px", borderRadius: 7,
  background: COLORS.panelAlt, border: `1px solid ${COLORS.border}`, color: COLORS.text,
  fontFamily: F_DATA, fontSize: 12.5, outline: "none",
};
const miniBtn = {
  padding: "7px 12px", borderRadius: 7, background: COLORS.panelHi, border: `1px solid ${COLORS.border}`,
  color: COLORS.muted, fontFamily: F_BODY, fontWeight: 600, fontSize: 11.5,
};

/* ============================== SEEDED PRNG / JITTER ============================== */
function hashStr(s) { let h = 0; for (let i = 0; i < s.length; i++) { h = (h << 5) - h + s.charCodeAt(i); h |= 0; } return h; }
function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function baseVal(key, min, max) { return min + mulberry32(hashStr(key))() * (max - min); }
function jitter(key, tick, amplitude) { const h = hashStr(key); return Math.sin((tick + h) * 0.6) * amplitude; }

/* ============================== STATIC DATA: COUNTRIES / CURRENCIES ============================== */
const COUNTRIES = [
  // Americas
  { code: "USD", name: "US Dollar", country: "United States", continent: "Americas", major: true, flag: "🇺🇸" },
  { code: "CAD", name: "Canadian Dollar", country: "Canada", continent: "Americas", major: true, flag: "🇨🇦" },
  { code: "BRL", name: "Brazilian Real", country: "Brazil", continent: "Americas", major: false, flag: "🇧🇷" },
  { code: "MXN", name: "Mexican Peso", country: "Mexico", continent: "Americas", major: false, flag: "🇲🇽" },
  { code: "ARS", name: "Argentine Peso", country: "Argentina", continent: "Americas", major: false, flag: "🇦🇷" },
  { code: "CLP", name: "Chilean Peso", country: "Chile", continent: "Americas", major: false, flag: "🇨🇱" },
  { code: "COP", name: "Colombian Peso", country: "Colombia", continent: "Americas", major: false, flag: "🇨🇴" },
  // Europe
  { code: "EUR", name: "Euro", country: "Eurozone", continent: "Europe", major: true, flag: "🇪🇺" },
  { code: "GBP", name: "British Pound", country: "United Kingdom", continent: "Europe", major: true, flag: "🇬🇧" },
  { code: "CHF", name: "Swiss Franc", country: "Switzerland", continent: "Europe", major: true, flag: "🇨🇭" },
  { code: "SEK", name: "Swedish Krona", country: "Sweden", continent: "Europe", major: false, flag: "🇸🇪" },
  { code: "NOK", name: "Norwegian Krone", country: "Norway", continent: "Europe", major: false, flag: "🇳🇴" },
  { code: "PLN", name: "Polish Zloty", country: "Poland", continent: "Europe", major: false, flag: "🇵🇱" },
  { code: "TRY", name: "Turkish Lira", country: "Turkey", continent: "Europe", major: false, flag: "🇹🇷" },
  { code: "RUB", name: "Russian Ruble", country: "Russia", continent: "Europe", major: false, flag: "🇷🇺" },
  { code: "HUF", name: "Hungarian Forint", country: "Hungary", continent: "Europe", major: false, flag: "🇭🇺" },
  // Asia
  { code: "JPY", name: "Japanese Yen", country: "Japan", continent: "Asia", major: true, flag: "🇯🇵" },
  { code: "CNY", name: "Chinese Yuan", country: "China", continent: "Asia", major: false, flag: "🇨🇳" },
  { code: "INR", name: "Indian Rupee", country: "India", continent: "Asia", major: false, flag: "🇮🇳" },
  { code: "IDR", name: "Indonesian Rupiah", country: "Indonesia", continent: "Asia", major: false, flag: "🇮🇩" },
  { code: "KRW", name: "South Korean Won", country: "South Korea", continent: "Asia", major: false, flag: "🇰🇷" },
  { code: "SGD", name: "Singapore Dollar", country: "Singapore", continent: "Asia", major: false, flag: "🇸🇬" },
  { code: "HKD", name: "Hong Kong Dollar", country: "Hong Kong", continent: "Asia", major: false, flag: "🇭🇰" },
  { code: "THB", name: "Thai Baht", country: "Thailand", continent: "Asia", major: false, flag: "🇹🇭" },
  { code: "PHP", name: "Philippine Peso", country: "Philippines", continent: "Asia", major: false, flag: "🇵🇭" },
  { code: "AED", name: "UAE Dirham", country: "United Arab Emirates", continent: "Asia", major: false, flag: "🇦🇪" },
  { code: "SAR", name: "Saudi Riyal", country: "Saudi Arabia", continent: "Asia", major: false, flag: "🇸🇦" },
  { code: "ILS", name: "Israeli Shekel", country: "Israel", continent: "Asia", major: false, flag: "🇮🇱" },
  // Africa
  { code: "ZAR", name: "South African Rand", country: "South Africa", continent: "Africa", major: false, flag: "🇿🇦" },
  { code: "NGN", name: "Nigerian Naira", country: "Nigeria", continent: "Africa", major: false, flag: "🇳🇬" },
  { code: "EGP", name: "Egyptian Pound", country: "Egypt", continent: "Africa", major: false, flag: "🇪🇬" },
  { code: "KES", name: "Kenyan Shilling", country: "Kenya", continent: "Africa", major: false, flag: "🇰🇪" },
  { code: "GHS", name: "Ghanaian Cedi", country: "Ghana", continent: "Africa", major: false, flag: "🇬🇭" },
  { code: "MAD", name: "Moroccan Dirham", country: "Morocco", continent: "Africa", major: false, flag: "🇲🇦" },
  // Oceania
  { code: "AUD", name: "Australian Dollar", country: "Australia", continent: "Oceania", major: true, flag: "🇦🇺" },
  { code: "NZD", name: "New Zealand Dollar", country: "New Zealand", continent: "Oceania", major: true, flag: "🇳🇿" },
  { code: "FJD", name: "Fijian Dollar", country: "Fiji", continent: "Oceania", major: false, flag: "🇫🇯" },
];
const CONTINENTS = ["All", "Americas", "Europe", "Asia", "Africa", "Oceania"];

/* ============================== INTERVENTIONS / POLICY FEED ============================== */
const INTERVENTIONS = [
  { id: "fed", bank: "Federal Reserve", country: "United States", code: "USD", type: "Rate Decision", impact: "Bullish", time: "08:32", desc: "Held the federal funds rate at 5.25–5.50%; statement language read hawkish on 'sticky' services inflation, lifting demand for dollar-denominated assets." },
  { id: "boj", bank: "Bank of Japan", country: "Japan", code: "JPY", type: "Verbal Intervention", impact: "Bullish", time: "07:10", desc: "MOF officials warned against 'excessive, speculative' yen moves, keeping markets on alert for direct intervention if USD/JPY extends higher." },
  { id: "ecb", bank: "European Central Bank", country: "Eurozone", code: "EUR", type: "Forward Guidance", impact: "Bearish", time: "09:45", desc: "Governing Council member signaled openness to a further cut later this year as core inflation continues to ease, weighing on euro demand." },
  { id: "sarb", bank: "South African Reserve Bank", country: "South Africa", code: "ZAR", type: "Rate Decision", impact: "Bullish", time: "13:00", desc: "Repo rate raised 25bps to defend the rand and anchor inflation expectations after a run of import-price pressure." },
  { id: "cbn", bank: "Central Bank of Nigeria", country: "Nigeria", code: "NGN", type: "FX Policy", impact: "Bearish", time: "10:15", desc: "Continued unification of official and parallel-market FX windows; naira supply increased sharply as backlog demand is processed." },
  { id: "pboc", bank: "People's Bank of China", country: "China", code: "CNY", type: "FX Intervention", impact: "Bullish", time: "01:25", desc: "Set a materially stronger daily yuan reference fixing and guided state banks to slow onshore yuan selling." },
  { id: "cbrt", bank: "Central Bank of Turkey", country: "Turkey", code: "TRY", type: "Rate Decision", impact: "Bullish", time: "14:00", desc: "Held the policy rate at a restrictive level, reaffirming its disinflation path and lira-defense stance." },
  { id: "snb", bank: "Swiss National Bank", country: "Switzerland", code: "CHF", type: "Verbal Intervention", impact: "Bearish", time: "08:00", desc: "Flagged readiness to act 'as necessary' in FX markets if franc strength threatens the inflation outlook, weighing on CHF demand." },
  { id: "boe", bank: "Bank of England", country: "United Kingdom", code: "GBP", type: "Policy Minutes", impact: "Mixed", time: "11:00", desc: "Minutes showed a split vote among MPC members; guidance stayed data-dependent, leaving GBP direction reliant on incoming inflation prints." },
  { id: "rba", bank: "Reserve Bank of Australia", country: "Australia", code: "AUD", type: "Rate Decision", impact: "Mixed", time: "05:30", desc: "Cash rate held; statement reiterated a 'not ruling anything in or out' stance ahead of next quarter's CPI." },
  { id: "banxico", bank: "Bank of Mexico", country: "Mexico", code: "MXN", type: "Rate Decision", impact: "Bearish", time: "20:00", desc: "Cut the overnight rate 25bps citing continued disinflation, trimming the peso's carry-trade appeal." },
  { id: "cbe", bank: "Central Bank of Egypt", country: "Egypt", code: "EGP", type: "FX Policy", impact: "Bearish", time: "12:20", desc: "Allowed further currency flexibility under its IMF-backed program, increasing pound supply onshore." },
];

/* ============================== FX PAIRS ============================== */
const MAJOR_PAIRS = [
  { pair: "EUR/USD", key: "EURUSD", link: "ecb", note: "ECB dovish tilt vs. hawkish Fed hold", priceMin: 1.05, priceMax: 1.11 },
  { pair: "USD/JPY", key: "USDJPY", link: "boj", note: "Yield gap wide; MOF verbal intervention watch", priceMin: 148, priceMax: 158 },
  { pair: "GBP/USD", key: "GBPUSD", link: "boe", note: "Split BoE vote keeps range intact", priceMin: 1.24, priceMax: 1.31 },
  { pair: "USD/CHF", key: "USDCHF", link: "snb", note: "SNB flags FX action against franc strength", priceMin: 0.85, priceMax: 0.91 },
  { pair: "AUD/USD", key: "AUDUSD", link: "rba", note: "RBA on hold; commodity demand supportive", priceMin: 0.63, priceMax: 0.68 },
  { pair: "USD/CAD", key: "USDCAD", link: "fed", note: "Crude prices and rate-hold dollar bid offsetting", priceMin: 1.34, priceMax: 1.40 },
  { pair: "NZD/USD", key: "NZDUSD", link: "rba", note: "Tracking AUD; dairy export demand in focus", priceMin: 0.58, priceMax: 0.63 },
];
const MINOR_PAIRS = [
  { pair: "EUR/GBP", key: "EURGBP", link: "ecb", note: "Diverging central bank rhetoric", priceMin: 0.83, priceMax: 0.87 },
  { pair: "AUD/JPY", key: "AUDJPY", link: "boj", note: "Risk-carry flows vs. yen intervention risk", priceMin: 94, priceMax: 103 },
  { pair: "USD/ZAR", key: "USDZAR", link: "sarb", note: "SARB hike defends rand demand", priceMin: 17.5, priceMax: 19.5 },
  { pair: "USD/MXN", key: "USDMXN", link: "banxico", note: "Banxico cut trims peso carry appeal", priceMin: 16.6, priceMax: 18.4 },
  { pair: "USD/TRY", key: "USDTRY", link: "cbrt", note: "Restrictive CBRT stance supports lira demand", priceMin: 33, priceMax: 40 },
  { pair: "USD/INR", key: "USDINR", link: null, note: "RBI smoothing two-way flows near record highs", priceMin: 83, priceMax: 85.5 },
  { pair: "USD/NGN", key: "USDNGN", link: "cbn", note: "FX unification lifts naira supply", priceMin: 1480, priceMax: 1620 },
];

/* ============================== CROSS-ASSET STATIC DATA ============================== */
const CRYPTO = [
  { sym: "BTC", name: "Bitcoin", key: "BTC", driver: "ETF inflows steady; funding rates neutral-to-positive." },
  { sym: "ETH", name: "Ethereum", key: "ETH", driver: "Staking withdrawals muted; L2 activity climbing." },
  { sym: "SOL", name: "Solana", key: "SOL", driver: "Network throughput highs supporting speculative demand." },
  { sym: "BNB", name: "BNB", key: "BNB", driver: "Exchange volumes firm across Asia session." },
  { sym: "XRP", name: "XRP", key: "XRP", driver: "Regulatory clarity headlines driving two-way flow." },
];
// Price ranges below are anchored to real market levels as of mid-August 2026 (sourced against
// Capital.com's commodities market data, Trading Economics, and major bullion/energy trackers),
// then simulated to move around that real anchor via the platform's usual live-jitter/refresh cycle.
const COMMODITIES = [
  { sym: "XAU", name: "Gold", key: "XAU", icon: "gem", priceMin: 4320, priceMax: 4460, driver: "Central-bank buying and safe-haven bid persist near record highs." },
  { sym: "XAG", name: "Silver", key: "XAG", icon: "gem", priceMin: 62, priceMax: 68, driver: "Industrial demand from solar sector supportive; gold/silver ratio near 68." },
  { sym: "WTI", name: "Crude Oil (WTI)", key: "WTI", icon: "fuel", priceMin: 79, priceMax: 85, driver: "OPEC+ supply discipline vs. Strait of Hormuz risk premium." },
  { sym: "BRENT", name: "Crude Oil (Brent)", key: "BRENT", icon: "fuel", priceMin: 84, priceMax: 91, driver: "Red Sea and Strait of Hormuz shipping disruptions keep risk premium bid." },
  { sym: "NATGAS", name: "Natural Gas", key: "NATGAS", icon: "fuel", priceMin: 2.55, priceMax: 2.95, driver: "Henry Hub benchmark; mild weather forecasts easing near-term demand." },
  { sym: "HG", name: "Copper", key: "HG", icon: "gem", priceMin: 6.35, priceMax: 6.75, driver: "Tight mine supply (Codelco cuts) vs. Chinese property drag." },
];
const AGRI = [
  { sym: "WHEAT", name: "Wheat", key: "WHEAT", driver: "Black Sea export flows back near seasonal norms." },
  { sym: "CORN", name: "Corn", key: "CORN", driver: "US crop conditions rated favorably this week." },
  { sym: "SOY", name: "Soybeans", key: "SOY", driver: "China import demand ticking higher into Q3." },
  { sym: "COFFEE", name: "Coffee (Arabica)", key: "COFFEE", driver: "Brazil frost-risk premium fading as season progresses." },
  { sym: "COTTON", name: "Cotton", key: "COTTON", driver: "Global mill demand steady; inventories comfortable." },
  { sym: "SUGAR", name: "Sugar", key: "SUGAR", driver: "India export-policy watch keeps supply outlook uncertain." },
];
const INDICES = [
  { sym: "SPX", name: "S&P 500", key: "SPX", region: "Americas" },
  { sym: "NDX", name: "Nasdaq 100", key: "NDX", region: "Americas" },
  { sym: "DJI", name: "Dow Jones", key: "DJI", region: "Americas" },
  { sym: "UKX", name: "FTSE 100", key: "UKX", region: "Europe" },
  { sym: "DAX", name: "DAX 40", key: "DAX", region: "Europe" },
  { sym: "NKY", name: "Nikkei 225", key: "NKY", region: "Asia" },
  { sym: "HSI", name: "Hang Seng", key: "HSI", region: "Asia" },
  { sym: "JALSH", name: "JSE Top 40", key: "JALSH", region: "Africa" },
];
const FUTURES = [
  { sym: "ES", name: "E-mini S&P 500", key: "ESF", driver: "Positioning skewed long into earnings season." },
  { sym: "CL", name: "WTI Crude Futures", key: "CLF", driver: "Managed-money net length rebuilding." },
  { sym: "GC", name: "Gold Futures", key: "GCF", driver: "Open interest climbing on macro-hedge demand." },
  { sym: "ZC", name: "Corn Futures", key: "ZCF", driver: "Commercial hedgers adding short positions into harvest." },
  { sym: "ZN", name: "10Y T-Note Futures", key: "ZNF", driver: "Rate-path repricing keeps two-way flow elevated." },
];

/* ============================== EXTRA INSTRUMENTS (CFD CATALOG) ============================== */
const SHARES_CFD = [
  { sym: "AAPL", name: "Apple Inc.", key: "AAPL", region: "Americas" },
  { sym: "MSFT", name: "Microsoft Corp.", key: "MSFT", region: "Americas" },
  { sym: "NVDA", name: "Nvidia Corp.", key: "NVDA", region: "Americas" },
  { sym: "TSLA", name: "Tesla Inc.", key: "TSLA", region: "Americas" },
  { sym: "AMZN", name: "Amazon.com Inc.", key: "AMZN", region: "Americas" },
  { sym: "HSBA", name: "HSBC Holdings", key: "HSBA", region: "Europe" },
  { sym: "SHEL", name: "Shell plc", key: "SHEL", region: "Europe" },
  { sym: "SAP", name: "SAP SE", key: "SAP", region: "Europe" },
  { sym: "7203", name: "Toyota Motor Corp.", key: "TOYOTA", region: "Asia" },
  { sym: "005930", name: "Samsung Electronics", key: "SAMSUNG", region: "Asia" },
  { sym: "BABA", name: "Alibaba Group", key: "BABA", region: "Asia" },
  { sym: "NPN", name: "Naspers Ltd.", key: "NPN", region: "Africa" },
];
const BONDS_CFD = [
  { sym: "US10Y", name: "US 10-Year T-Note", key: "US10Y", region: "Americas" },
  { sym: "US30Y", name: "US 30-Year T-Bond", key: "US30Y", region: "Americas" },
  { sym: "BUND", name: "German Bund (10Y)", key: "BUND", region: "Europe" },
  { sym: "GILT", name: "UK Gilt (10Y)", key: "GILT", region: "Europe" },
  { sym: "JGB", name: "Japan Govt. Bond (10Y)", key: "JGB", region: "Asia" },
];
const INDICES_EXTRA = [
  { sym: "CAC", name: "CAC 40", key: "CAC", region: "Europe" },
  { sym: "IBEX", name: "IBEX 35", key: "IBEX", region: "Europe" },
  { sym: "AS51", name: "ASX 200", key: "AS51", region: "Oceania" },
  { sym: "NIFTY", name: "Nifty 50", key: "NIFTY", region: "Asia" },
  { sym: "BVSP", name: "Bovespa", key: "BVSP", region: "Americas" },
];
const COMMODITIES_EXTRA = [
  { sym: "XPT", name: "Platinum", key: "XPT", icon: "gem", priceMin: 1680, priceMax: 1820, driver: "Auto-catalyst demand recovering with EV-hybrid mix shift." },
  { sym: "XPD", name: "Palladium", key: "XPD", icon: "gem", priceMin: 1240, priceMax: 1360, driver: "Tight mine supply from Russia/South Africa underpins price." },
  { sym: "HO", name: "Heating Oil", key: "HO", icon: "fuel", priceMin: 4.05, priceMax: 4.50, driver: "Distillate supply concerns amid refinery outages and export restrictions." },
];
const CRYPTO_EXTRA = [
  { sym: "ADA", name: "Cardano", key: "ADA", driver: "Governance vote activity lifting on-chain engagement." },
  { sym: "DOGE", name: "Dogecoin", key: "DOGE", driver: "Retail/social sentiment driving speculative volume." },
  { sym: "DOT", name: "Polkadot", key: "DOT", driver: "Parachain auction flows steady." },
];
const CFD_CATEGORY_SPECS = {
  "FX": { leverage: "Up to 30:1", session: "24 / 5" },
  "Indices": { leverage: "Up to 20:1", session: "Follows exchange hours" },
  "Commodities": { leverage: "Up to 10:1", session: "23 / 5" },
  "Agricultural": { leverage: "Up to 10:1", session: "Exchange session" },
  "Crypto": { leverage: "Up to 2:1", session: "24 / 7" },
  "Shares": { leverage: "Up to 5:1", session: "Follows exchange hours" },
  "Bonds": { leverage: "Up to 10:1", session: "24 / 5" },
};

/* ============================== ECONOMIC CALENDAR ============================== */
// utcOffset = hours offset from UTC for the event's local time (handles current DST where applicable)
// polarity: +1 = a higher actual than forecast is typically read as currency-bullish; -1 = inverse (e.g. unemployment); 0 = qualitative, no numeric compare
const CALENDAR = [
  { id: "ukcpi", continent: "Europe", country: "United Kingdom", flag: "🇬🇧", currency: "GBP", event: "CPI y/y", impact: "High",
    dateLocal: "13 Aug 2026", timeLocal: "09:30", utcOffset: 1,
    forecast: "2.6%", forecastVal: 2.6, previous: "2.8%", previousVal: 2.8, actual: "2.7%", actualVal: 2.7, polarity: 1 },
  { id: "usretail", continent: "Americas", country: "United States", flag: "🇺🇸", currency: "USD", event: "Core Retail Sales m/m", impact: "High",
    dateLocal: "13 Aug 2026", timeLocal: "12:30", utcOffset: -4,
    forecast: "0.3%", forecastVal: 0.3, previous: "0.1%", previousVal: 0.1, actual: "0.4%", actualVal: 0.4, polarity: 1 },
  { id: "usnfp", continent: "Americas", country: "United States", flag: "🇺🇸", currency: "USD", event: "Non-Farm Payrolls", impact: "High",
    dateLocal: "13 Aug 2026", timeLocal: "12:30", utcOffset: -4,
    forecast: "175K", forecastVal: 175, previous: "206K", previousVal: 206, actual: "187K", actualVal: 187, polarity: 1 },
  { id: "usunemp", continent: "Americas", country: "United States", flag: "🇺🇸", currency: "USD", event: "Unemployment Rate", impact: "High",
    dateLocal: "13 Aug 2026", timeLocal: "12:30", utcOffset: -4,
    forecast: "4.1%", forecastVal: 4.1, previous: "4.0%", previousVal: 4.0, actual: "4.2%", actualVal: 4.2, polarity: -1 },
  { id: "cbrt", continent: "Europe", country: "Turkey", flag: "🇹🇷", currency: "TRY", event: "CBRT Rate Decision", impact: "High",
    dateLocal: "13 Aug 2026", timeLocal: "14:00", utcOffset: 3,
    forecast: "Hold at 46%", forecastVal: null, previous: "46%", previousVal: null, actual: "Held at 46%", actualVal: null, polarity: 0,
    note: "Rate held at a restrictive level as guided — supportive of lira demand via carry appeal, but no numeric surprise to measure." },
  { id: "jptrade", continent: "Asia", country: "Japan", flag: "🇯🇵", currency: "JPY", event: "Trade Balance", impact: "Medium",
    dateLocal: "13 Aug 2026", timeLocal: "23:50", utcOffset: 9,
    forecast: "-¥450B", forecastVal: -450, previous: "-¥622B", previousVal: -622, actual: "-¥398B", actualVal: -398, polarity: 1 },
  { id: "zapmi", continent: "Africa", country: "South Africa", flag: "🇿🇦", currency: "ZAR", event: "Manufacturing PMI", impact: "Medium",
    dateLocal: "13 Aug 2026", timeLocal: "10:00", utcOffset: 2,
    forecast: "50.3", forecastVal: 50.3, previous: "50.1", previousVal: 50.1, actual: "49.8", actualVal: 49.8, polarity: 1 },
  { id: "ngcpi", continent: "Africa", country: "Nigeria", flag: "🇳🇬", currency: "NGN", event: "Inflation Rate y/y", impact: "Medium",
    dateLocal: "13 Aug 2026", timeLocal: "11:00", utcOffset: 1,
    forecast: "33.0%", forecastVal: 33.0, previous: "33.9%", previousVal: 33.9, actual: "33.4%", actualVal: 33.4, polarity: 1 },
  { id: "pboc", continent: "Asia", country: "China", flag: "🇨🇳", currency: "CNY", event: "PBoC Loan Prime Rate", impact: "High",
    dateLocal: "14 Aug 2026", timeLocal: "01:30", utcOffset: 8,
    forecast: "3.45%", forecastVal: 3.45, previous: "3.45%", previousVal: 3.45, actual: null, actualVal: null, polarity: 1 },
  { id: "eupmi", continent: "Europe", country: "Eurozone", flag: "🇪🇺", currency: "EUR", event: "Flash PMI (Composite)", impact: "Medium",
    dateLocal: "14 Aug 2026", timeLocal: "08:00", utcOffset: 2,
    forecast: "51.2", forecastVal: 51.2, previous: "50.9", previousVal: 50.9, actual: null, actualVal: null, polarity: 1 },
  { id: "cacpi", continent: "Americas", country: "Canada", flag: "🇨🇦", currency: "CAD", event: "Core CPI m/m", impact: "Medium",
    dateLocal: "14 Aug 2026", timeLocal: "12:30", utcOffset: -4,
    forecast: "0.2%", forecastVal: 0.2, previous: "0.3%", previousVal: 0.3, actual: null, actualVal: null, polarity: 1 },
  { id: "sarb", continent: "Africa", country: "South Africa", flag: "🇿🇦", currency: "ZAR", event: "SARB MPC Statement", impact: "Medium",
    dateLocal: "14 Aug 2026", timeLocal: "14:30", utcOffset: 2,
    forecast: "Hold at 8.25%", forecastVal: null, previous: "8.25%", previousVal: null, actual: null, actualVal: null, polarity: 0,
    note: "Markets expect a hold; tone on rand-defense and inflation risk will matter more than the rate itself." },
  { id: "rba", continent: "Oceania", country: "Australia", flag: "🇦🇺", currency: "AUD", event: "RBA Rate Decision", impact: "High",
    dateLocal: "14 Aug 2026", timeLocal: "05:30", utcOffset: 10,
    forecast: "Hold at 4.35%", forecastVal: null, previous: "4.35%", previousVal: null, actual: null, actualVal: null, polarity: 0,
    note: "A hold is priced in; any shift in forward guidance on future cuts is the bigger AUD driver." },
  { id: "snb", continent: "Europe", country: "Switzerland", flag: "🇨🇭", currency: "CHF", event: "SNB Policy Rate", impact: "High",
    dateLocal: "14 Aug 2026", timeLocal: "08:30", utcOffset: 2,
    forecast: "Hold at 1.00%", forecastVal: null, previous: "1.00%", previousVal: null, actual: null, actualVal: null, polarity: 0,
    note: "Focus is on any renewed reference to FX intervention against franc strength." },
  { id: "incpi", continent: "Asia", country: "India", flag: "🇮🇳", currency: "INR", event: "CPI y/y", impact: "Medium",
    dateLocal: "14 Aug 2026", timeLocal: "17:30", utcOffset: 5.5,
    forecast: "3.6%", forecastVal: 3.6, previous: "3.5%", previousVal: 3.5, actual: null, actualVal: null, polarity: 1 },
  { id: "nzgdp", continent: "Oceania", country: "New Zealand", flag: "🇳🇿", currency: "NZD", event: "GDP q/q", impact: "Medium",
    dateLocal: "14 Aug 2026", timeLocal: "22:45", utcOffset: 12,
    forecast: "0.3%", forecastVal: 0.3, previous: "0.2%", previousVal: 0.2, actual: null, actualVal: null, polarity: 1 },
];

// Convert a local HH:MM + UTC offset (hours) into Kenya time (EAT, UTC+3, no DST)
function toKenyaTime(timeStr, utcOffset) {
  const [h, m] = timeStr.split(":").map(Number);
  let mins = h * 60 + m - utcOffset * 60 + 3 * 60;
  let dayShift = 0;
  while (mins < 0) { mins += 1440; dayShift -= 1; }
  while (mins >= 1440) { mins -= 1440; dayShift += 1; }
  const hh = String(Math.floor(mins / 60)).padStart(2, "0");
  const mm = String(mins % 60).padStart(2, "0");
  return `${hh}:${mm}${dayShift > 0 ? " (+1d)" : dayShift < 0 ? " (\u22121d)" : ""}`;
}

const CURRENCY_EXAMPLE_PAIR = {
  USD: "EUR/USD", GBP: "GBP/USD", EUR: "EUR/USD", JPY: "USD/JPY", TRY: "USD/TRY", ZAR: "USD/ZAR",
  NGN: "USD/NGN", CAD: "USD/CAD", AUD: "AUD/USD", NZD: "NZD/USD", CHF: "USD/CHF", INR: "USD/INR", CNY: "USD/CNH",
};

// Pure, deterministic implication engine — compares actual vs. forecast/previous and returns a
// result tag plus a plain-language demand/supply scenario, modelled on standard forex-calendar read-outs.
function buildImplication(ev) {
  const pair = CURRENCY_EXAMPLE_PAIR[ev.currency] || `${ev.currency}/USD`;
  if (ev.actual === null || ev.actual === undefined) {
    return {
      result: "Pending", tone: "neutral",
      text: `Not yet released — positioning is built around a forecast of ${ev.forecast} versus a previous reading of ${ev.previous}. Given the ${ev.impact.toLowerCase()}-impact rating, expect a burst of two-way volatility in ${pair} and other ${ev.currency} pairs right at release.`,
    };
  }
  if (ev.polarity === 0 || ev.forecastVal === null) {
    return {
      result: "Released", tone: "neutral",
      text: ev.note || `Reported as ${ev.actual}. No direct numeric forecast comparison applies — read the statement tone for the real ${ev.currency} driver.`,
    };
  }
  const surprise = ev.actualVal - ev.forecastVal;
  const beat = ev.polarity > 0 ? surprise > 0 : surprise < 0;
  const miss = ev.polarity > 0 ? surprise < 0 : surprise > 0;
  const result = surprise === 0 ? "In Line" : beat ? "Beat" : miss ? "Miss" : "In Line";
  let text;
  if (result === "In Line") {
    text = `Actual matched forecast — little surprise, so ${ev.currency} demand and supply should stay broadly balanced with only a modest reaction in ${pair}.`;
  } else if (result === "Beat") {
    text = ev.impact === "High"
      ? `A high-impact beat typically drives a sharp increase in demand for ${ev.currency} as investors add long exposure and supply is pulled from the market; watch ${pair} for an outsized, fast move.`
      : ev.impact === "Medium"
      ? `A moderate beat should lift ${ev.currency} demand at the margin; expect a measured, shorter-lived move in ${pair} as investors selectively add exposure.`
      : `A minor beat with limited follow-through likely; ${ev.currency} demand may tick up briefly in ${pair} without a lasting shift in positioning.`;
  } else {
    text = ev.impact === "High"
      ? `A high-impact miss typically increases supply of ${ev.currency} as investors trim or reverse long positions; ${pair} is at risk of a sharp move against ${ev.currency}.`
      : ev.impact === "Medium"
      ? `A moderate miss should add some supply-side pressure on ${ev.currency}; expect a contained move in ${pair} as positioning adjusts.`
      : `A minor miss with limited follow-through likely; any supply-side pressure on ${ev.currency} should fade quickly.`;
  }
  return { result, tone: result === "In Line" ? "neutral" : result === "Beat" ? "up" : "down", text };
}

/* ============================== MARGIN / PIP CALCULATOR SPECS ============================== */
// Indicative, simplified contract specs for demo purposes — real specs vary by broker.
const INSTRUMENT_SPECS = {
  XAU: { pointSize: 0.01, contractSize: 100 },     // Gold: 100 oz / lot
  XAG: { pointSize: 0.001, contractSize: 5000 },   // Silver: 5,000 oz / lot
  XPT: { pointSize: 0.01, contractSize: 100 },
  XPD: { pointSize: 0.01, contractSize: 100 },
  WTI: { pointSize: 0.01, contractSize: 1000 },    // 1,000 barrels / lot
  BRENT: { pointSize: 0.01, contractSize: 1000 },
  NATGAS: { pointSize: 0.001, contractSize: 10000 },
  HO: { pointSize: 0.0001, contractSize: 42000 },
  HG: { pointSize: 0.0001, contractSize: 25000 },  // Copper: 25,000 lb / lot
};
const CATEGORY_DEFAULT_SPEC = {
  FX: { pointSize: 0.0001, contractSize: 100000 },  // overridden to 0.01 for JPY-quoted pairs
  Indices: { pointSize: 1, contractSize: 1 },        // $1 per index point per 1.00 lot
  Commodities: { pointSize: 0.01, contractSize: 100 },
  Agricultural: { pointSize: 0.01, contractSize: 5000 },
  Crypto: { pointSize: 1, contractSize: 1 },         // 1 coin per lot
  Shares: { pointSize: 1, contractSize: 1 },         // 1 share per lot
  Bonds: { pointSize: 0.01, contractSize: 1000 },    // $1,000 face value per lot
};
function getSpec(sym, category) {
  if (category === "FX") {
    const isJPY = sym.includes("JPY");
    return { pointSize: isJPY ? 0.01 : 0.0001, contractSize: 100000, unitLabel: isJPY ? "pip (0.01)" : "pip (0.0001)" };
  }
  const override = INSTRUMENT_SPECS[sym];
  const base = override || CATEGORY_DEFAULT_SPEC[category] || { pointSize: 0.01, contractSize: 1 };
  return { ...base, unitLabel: "point" };
}
function parseLeverage(levStr) {
  if (!levStr) return 10;
  const s = String(levStr);
  const nToOne = /([\d.]+)\s*:\s*1(?!\d)/.exec(s);       // matches "30:1", "Up to 30:1"
  if (nToOne) return parseFloat(nToOne[1]);
  const oneToN = /^1\s*:\s*([\d.]+)/.exec(s.trim());     // matches "1:500"
  if (oneToN) return parseFloat(oneToN[1]);
  return 10;
}
// $ value of one pip/point at a given lot size
function pointValueUSD(sym, category, price, lot) {
  const spec = getSpec(sym, category);
  const quoteAmount = spec.pointSize * spec.contractSize * lot;
  if (category === "FX") {
    if (sym.startsWith("USD/")) return quoteAmount / (price || 1);
    if (sym.endsWith("/USD")) return quoteAmount;
    return quoteAmount / (price || 1); // approximate for cross pairs
  }
  return quoteAmount;
}
// indicative required margin in USD
function marginUSD(sym, category, price, lot, leverage) {
  const spec = getSpec(sym, category);
  let notional;
  if (category === "FX") {
    notional = sym.startsWith("USD/") ? spec.contractSize * lot : spec.contractSize * lot * price;
  } else {
    notional = spec.contractSize * lot * price;
  }
  return notional / Math.max(1, leverage);
}
// profit/loss in USD between an entry and exit price
function plUSD(sym, category, entry, exit, lot, direction) {
  const spec = getSpec(sym, category);
  const diff = (exit - entry) * (direction === "Buy" ? 1 : -1);
  const quotePnl = diff * spec.contractSize * lot;
  if (category === "FX") {
    if (sym.startsWith("USD/")) return quotePnl / (exit || entry || 1);
    if (sym.endsWith("/USD")) return quotePnl;
    return quotePnl / (exit || entry || 1);
  }
  return quotePnl;
}
function fmtPrice(n) {
  if (n === undefined || n === null || isNaN(n)) return "—";
  if (Math.abs(n) >= 1000) return fmt(n, 0);
  if (Math.abs(n) >= 10) return fmt(n, 2);
  if (Math.abs(n) >= 1) return fmt(n, 4);
  return fmt(n, 5);
}
// Selectable leverage ratios for the calculator — 1:100 through 1:1000 in steps of 100,
// plus "Default" which uses each instrument's own indicative leverage cap.
const LEVERAGE_OPTIONS = ["Default", "1:100", "1:200", "1:300", "1:400", "1:500", "1:600", "1:700", "1:800", "1:900", "1:1000"];

/* ============================== SMALL PRESENTATION HELPERS ============================== */
function fmt(n, d = 2) { return n.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }); }

function PressureGauge({ netPct, height = 7 }) {
  const clamped = Math.max(-60, Math.min(60, netPct));
  const pos = clamped >= 0;
  const width = Math.abs(clamped) * 0.8;
  return (
    <div style={{ position: "relative", height, background: COLORS.panelAlt, borderRadius: 4, overflow: "hidden", border: `1px solid ${COLORS.border}` }}>
      <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 1, background: COLORS.borderHi }} />
      <div style={{ position: "absolute", top: 0, bottom: 0, left: pos ? "50%" : `${50 - width}%`, width: `${width}%`, background: pos ? COLORS.up : COLORS.down, transition: "left .4s ease, width .4s ease" }} />
    </div>
  );
}

function Badge({ children, tone = "neutral" }) {
  const map = {
    neutral: { bg: COLORS.panelHi, fg: COLORS.muted, bd: COLORS.border },
    up: { bg: "rgba(49,208,170,0.12)", fg: COLORS.up, bd: "rgba(49,208,170,0.35)" },
    down: { bg: "rgba(255,92,122,0.12)", fg: COLORS.down, bd: "rgba(255,92,122,0.35)" },
    warn: { bg: "rgba(245,185,66,0.12)", fg: COLORS.warn, bd: "rgba(245,185,66,0.35)" },
    brand: { bg: "rgba(76,201,240,0.12)", fg: COLORS.brand, bd: "rgba(76,201,240,0.35)" },
  };
  const s = map[tone] || map.neutral;
  return (
    <span style={{ fontFamily: F_BODY, fontSize: 11, fontWeight: 600, letterSpacing: 0.3, padding: "3px 8px", borderRadius: 999, background: s.bg, color: s.fg, border: `1px solid ${s.bd}`, whiteSpace: "nowrap" }}>
      {children}
    </span>
  );
}

function Panel({ children, style }) {
  return <div style={{ background: COLORS.panel, border: `1px solid ${COLORS.border}`, borderRadius: 10, ...style }}>{children}</div>;
}

function SectionTitle({ icon: Icon, title, sub }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
      {Icon && <Icon size={17} color={COLORS.brand} />}
      <div>
        <div style={{ fontFamily: F_DISPLAY, fontSize: 16, fontWeight: 700, color: COLORS.text, letterSpacing: 0.2 }}>{title}</div>
        {sub && <div style={{ fontFamily: F_BODY, fontSize: 12, color: COLORS.mutedDim, marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  );
}

/* ============================== MAIN COMPONENT ============================== */
export default function SSquaredFinancials() {
  const [tick, setTick] = useState(0);
  const [tab, setTab] = useState("overview");
  const [continent, setContinent] = useState("All");
  const [assetClass, setAssetClass] = useState("All");
  const [query, setQuery] = useState("");
  const [crossTab, setCrossTab] = useState("crypto");
  const [cfdCategory, setCfdCategory] = useState("All");
  const [refreshEpoch, setRefreshEpoch] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [secondsToRefresh, setSecondsToRefresh] = useState(600);
  const [refreshing, setRefreshing] = useState(false);
  const [calendarContinent, setCalendarContinent] = useState("All");
  const [calcSym, setCalcSym] = useState("EUR/USD");
  const [calcCategory, setCalcCategory] = useState("All");
  const [calcLot, setCalcLot] = useState(1);
  const [calcDirection, setCalcDirection] = useState("Buy");
  const [calcEntry, setCalcEntry] = useState("");
  const [calcExit, setCalcExit] = useState("");
  const [calcLeverageChoice, setCalcLeverageChoice] = useState("Default");

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 4000);
    return () => clearInterval(id);
  }, []);

  function doRefresh() {
    setRefreshing(true);
    setRefreshEpoch((e) => e + 1);
    setLastUpdated(new Date());
    setSecondsToRefresh(600);
    setTimeout(() => setRefreshing(false), 600);
  }

  // Auto full-refresh every 10 minutes, with a 1s countdown ticker
  useEffect(() => {
    const countdown = setInterval(() => {
      setSecondsToRefresh((s) => {
        if (s <= 1) { doRefresh(); return 600; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(countdown);
  }, []);

  /* ---- derived FX data (demand/supply, $bn) ---- */
  const fxData = useMemo(() => {
    return COUNTRIES.map((c) => {
      const dBase = baseVal(c.code + "D-e" + refreshEpoch, c.major ? 95 : 4, c.major ? 260 : 45);
      const sBase = baseVal(c.code + "S-e" + refreshEpoch, c.major ? 90 : 3.5, c.major ? 250 : 42);
      return { ...c, dBase, sBase };
    });
  }, [refreshEpoch]);
  const fxLive = fxData.map((c) => {
    const demand = Math.max(0.5, c.dBase + jitter(c.code + "D", tick, c.major ? 9 : 2.2));
    const supply = Math.max(0.5, c.sBase + jitter(c.code + "S", tick, c.major ? 8 : 2));
    const net = demand - supply;
    const netPct = (net / ((demand + supply) / 2)) * 100;
    const relatedIntervention = INTERVENTIONS.find((i) => i.code === c.code);
    return { ...c, demand, supply, net, netPct, relatedIntervention };
  });

  const filteredFx = fxLive.filter((c) => {
    if (continent !== "All" && c.continent !== continent) return false;
    if (assetClass === "Major" && !c.major) return false;
    if (assetClass === "Minor" && c.major) return false;
    if (query && !(`${c.country} ${c.code} ${c.name}`.toLowerCase().includes(query.toLowerCase()))) return false;
    return true;
  });

  /* ---- pairs (major/minor) ---- */
  function pairRow(p) {
    const demand = Math.max(1, baseVal(p.key + "PD-e" + refreshEpoch, 60, 220) + jitter(p.key + "PD", tick, 10));
    const supply = Math.max(1, baseVal(p.key + "PS-e" + refreshEpoch, 55, 210) + jitter(p.key + "PS", tick, 9));
    const net = demand - supply;
    const netPct = (net / ((demand + supply) / 2)) * 100;
    const intervention = INTERVENTIONS.find((i) => i.id === p.link);
    const priceBase = baseVal(p.key + "PR-e" + refreshEpoch, p.priceMin, p.priceMax);
    const price = priceBase + jitter(p.key + "PR", tick, (p.priceMax - p.priceMin) * 0.015);
    return { ...p, demand, supply, net, netPct, intervention, price };
  }
  const majorPairRows = MAJOR_PAIRS.map(pairRow);
  const minorPairRows = MINOR_PAIRS.map(pairRow);
  const pairChartData = [...majorPairRows, ...minorPairRows].map((p) => ({ name: p.pair, Net: Number(p.netPct.toFixed(1)) }));

  /* ---- cross asset live values: price/change PLUS daily demand vs. supply ($B) ---- */
  // If an item defines its own priceMin/priceMax (used for commodities, anchored to real market
  // levels), that overrides the function-level range — otherwise every item in the list shares it.
  function assetLive(list, priceMin, priceMax, changeAmp, dsMin = 0, dsMax = 0) {
    return list.map((a) => {
      const pMin = a.priceMin !== undefined ? a.priceMin : priceMin;
      const pMax = a.priceMax !== undefined ? a.priceMax : priceMax;
      const priceBase = baseVal(a.key + "P-e" + refreshEpoch, pMin, pMax);
      const price = priceBase + jitter(a.key + "P", tick, priceBase * 0.004);
      const change = jitter(a.key + "C", tick, changeAmp) + baseVal(a.key + "CB-e" + refreshEpoch, -1.2, 1.2);

      let demand, supply, net, netPct;
      if (dsMax > 0) {
        const dBase = baseVal(a.key + "D-e" + refreshEpoch, dsMin, dsMax);
        const sBase = baseVal(a.key + "S-e" + refreshEpoch, dsMin * 0.9, dsMax * 0.95);
        const amp = (dsMax - dsMin) * 0.07;
        demand = Math.max(0.2, dBase + jitter(a.key + "D", tick, amp));
        supply = Math.max(0.2, sBase + jitter(a.key + "S", tick, amp * 0.9));
        net = demand - supply;
        netPct = (net / ((demand + supply) / 2)) * 100;
      }
      return { ...a, price, change, demand, supply, net, netPct };
    });
  }
  // demand/supply ranges below are indicative simulated daily turnover in $B, sized per asset class
  const cryptoLive = assetLive(CRYPTO, 0.4, 68000, 1.8, 4, 42).map((a) => ({ ...a, price: a.sym === "BTC" ? a.price : a.sym === "ETH" ? a.price * 0.05 + 2000 : a.price }));
  const commoditiesLive = assetLive(COMMODITIES, 1.9, 2400, 0.9, 18, 150);
  const agriLive = assetLive(AGRI, 3, 620, 1.1, 3, 26);
  const indicesLive = assetLive(INDICES, 4200, 39000, 0.7, 45, 230);
  const futuresLive = assetLive(FUTURES, 24, 5600, 0.8, 20, 165);

  const crossMap = { crypto: cryptoLive, commodities: commoditiesLive, agri: agriLive, indices: indicesLive, futures: futuresLive };
  const crossIconMap = { crypto: Coins, commodities: Gem, agri: Sprout, indices: LineChartIcon, futures: Activity };

  /* ---- full CFD instrument catalog (every asset class, CFD wrapper) ---- */
  const sharesCfdLive = assetLive(SHARES_CFD, 18, 950, 1.3, 5, 95);
  const bondsCfdLive = assetLive(BONDS_CFD, 92, 145, 0.3, 30, 210);
  const indicesExtraLive = assetLive(INDICES_EXTRA, 3800, 84000, 0.7, 12, 75);
  const commoditiesExtraLive = assetLive(COMMODITIES_EXTRA, 0.6, 1050, 1.0, 2, 22);
  const cryptoExtraLive = assetLive(CRYPTO_EXTRA, 0.06, 7.5, 2.5, 0.5, 6);

  const cfdCatalog = [
    ...majorPairRows.map((p) => ({ sym: p.pair, name: `${p.pair} Spot FX`, category: "FX", change: p.netPct / 8, demand: p.demand, supply: p.supply, netPct: p.netPct, price: p.price })),
    ...minorPairRows.map((p) => ({ sym: p.pair, name: `${p.pair} Spot FX`, category: "FX", change: p.netPct / 8, demand: p.demand, supply: p.supply, netPct: p.netPct, price: p.price })),
    ...indicesLive.map((a) => ({ ...a, category: "Indices" })),
    ...indicesExtraLive.map((a) => ({ ...a, category: "Indices" })),
    ...commoditiesLive.map((a) => ({ ...a, category: "Commodities" })),
    ...commoditiesExtraLive.map((a) => ({ ...a, category: "Commodities" })),
    ...agriLive.map((a) => ({ ...a, category: "Agricultural" })),
    ...cryptoLive.map((a) => ({ ...a, category: "Crypto" })),
    ...cryptoExtraLive.map((a) => ({ ...a, category: "Crypto" })),
    ...sharesCfdLive.map((a) => ({ ...a, category: "Shares" })),
    ...bondsCfdLive.map((a) => ({ ...a, category: "Bonds" })),
  ].map((a) => ({
    ...a,
    netPct: a.netPct !== undefined ? a.netPct : a.change * 12,
    spec: CFD_CATEGORY_SPECS[a.category] || { leverage: "—", session: "—" },
  }));
  const cfdCategories = ["All", "FX", "Indices", "Commodities", "Agricultural", "Crypto", "Shares", "Bonds"];
  const filteredCfd = cfdCatalog.filter((c) => cfdCategory === "All" || c.category === cfdCategory);

  /* ---- margin / P&L / pip calculator ---- */
  const calcInstrumentList = calcCategory === "All" ? cfdCatalog : cfdCatalog.filter((c) => c.category === calcCategory);
  const calcInstrument = cfdCatalog.find((c) => c.sym === calcSym) || cfdCatalog[0];
  const calcLotNum = Math.max(0.01, Number(calcLot) || 0.01);
  const calcLeverage = calcLeverageChoice === "Default" ? parseLeverage(calcInstrument.spec.leverage) : parseLeverage(calcLeverageChoice);
  const calcSpec = getSpec(calcInstrument.sym, calcInstrument.category);
  const effEntry = calcEntry !== "" ? Number(calcEntry) : calcInstrument.price;
  const effExit = calcExit !== "" ? Number(calcExit) : effEntry;
  const calcMargin = marginUSD(calcInstrument.sym, calcInstrument.category, effEntry, calcLotNum, calcLeverage);
  const calcPointValue = pointValueUSD(calcInstrument.sym, calcInstrument.category, effEntry, calcLotNum);
  const calcPL = plUSD(calcInstrument.sym, calcInstrument.category, effEntry, effExit, calcLotNum, calcDirection);
  const calcPointsMoved = Math.abs(effExit - effEntry) / calcSpec.pointSize;
  const calcPipsPerDollar = calcPointValue !== 0 ? Math.abs(calcSpec.pointSize / calcPointValue) : 0;
  const calcUnitsLabel = calcInstrument.category === "FX"
    ? `1.00 lot = ${calcSpec.contractSize.toLocaleString()} ${calcInstrument.sym.split("/")[0]}`
    : `1.00 lot = ${calcSpec.contractSize.toLocaleString()} unit(s) of ${calcInstrument.sym}`;

  /* ---- trade ideas (derived) ---- */
  const ideaPool = [
    ...majorPairRows.map((p) => ({ type: "FX Major", instrument: p.pair, netPct: p.netPct, driver: p.intervention ? p.intervention.desc : p.note, bank: p.intervention ? p.intervention.bank : null })),
    ...minorPairRows.map((p) => ({ type: "FX Minor", instrument: p.pair, netPct: p.netPct, driver: p.intervention ? p.intervention.desc : p.note, bank: p.intervention ? p.intervention.bank : null })),
    ...cryptoLive.map((a) => ({ type: "Crypto", instrument: a.sym, netPct: a.netPct, driver: a.driver })),
    ...commoditiesLive.map((a) => ({ type: "Commodity", instrument: a.name, netPct: a.netPct, driver: a.driver })),
    ...indicesLive.map((a) => ({ type: "Index", instrument: a.name, netPct: a.netPct, driver: `Cross-asset flow rotation into ${a.region}.` })),
  ];
  const ideas = [...ideaPool]
    .sort((a, b) => Math.abs(b.netPct) - Math.abs(a.netPct))
    .slice(0, 6)
    .map((it) => {
      const direction = it.netPct >= 0 ? "Buy / Long" : "Sell / Short";
      const confidence = Math.min(93, Math.round(52 + Math.abs(it.netPct) * 1.6));
      const calendarHit = CALENDAR.find((c) => it.instrument.includes(c.currency));
      return { ...it, direction, confidence, calendarHit };
    });

  /* ---- ticker tape ---- */
  const tapeItems = [
    ...majorPairRows.map((p) => ({ label: p.pair, val: p.netPct })),
    ...cryptoLive.map((a) => ({ label: a.sym, val: a.change })),
    ...commoditiesLive.slice(0, 3).map((a) => ({ label: a.sym, val: a.change })),
    ...indicesLive.slice(0, 4).map((a) => ({ label: a.sym, val: a.change })),
  ];

  const TABS = [
    { id: "overview", label: "Overview", icon: Globe },
    { id: "fx", label: "FX Majors & Minors", icon: TrendingUp },
    { id: "interventions", label: "Interventions", icon: Landmark },
    { id: "cross", label: "Cross-Asset", icon: Activity },
    { id: "cfd", label: "CFD Instruments", icon: Boxes },
    { id: "calculator", label: "Margin & Pip Calculator", icon: Calculator },
    { id: "ideas", label: "Trade Ideas", icon: Target },
    { id: "calendar", label: "Calendar", icon: CalendarIcon },
  ];

  return (
    <div style={{ minHeight: "100vh", background: COLORS.bg, color: COLORS.text, fontFamily: F_BODY }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=IBM+Plex+Mono:wght@400;500;600&family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { height: 8px; width: 8px; }
        ::-webkit-scrollbar-thumb { background: ${COLORS.border}; border-radius: 8px; }
        @keyframes tape { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .tape-track { display: inline-flex; animation: tape 38s linear infinite; }
        button { cursor: pointer; }
      `}</style>

      {/* ===== HEADER ===== */}
      <div style={{ borderBottom: `1px solid ${COLORS.border}`, background: COLORS.panel, position: "sticky", top: 0, zIndex: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 22px", flexWrap: "wrap", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: `linear-gradient(135deg, ${COLORS.brand}, ${COLORS.brand2})`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F_DISPLAY, fontWeight: 700, color: "#05070A", fontSize: 15 }}>S²</div>
            <div>
              <div style={{ fontFamily: F_DISPLAY, fontWeight: 700, fontSize: 17, letterSpacing: 0.3 }}>S-SQUARED FINANCIALS</div>
              <div style={{ fontSize: 11, color: COLORS.mutedDim, fontFamily: F_BODY }}>Global FX · Rates · Crypto · Commodities · Indices Terminal</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <Badge tone="warn">
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><Radio size={11} /> SIMULATED DATA</span>
            </Badge>
            <div style={{ fontSize: 11, color: COLORS.mutedDim, fontFamily: F_DATA, display: "flex", alignItems: "center", gap: 5 }}>
              <Clock size={11} />
              Updated {lastUpdated.toLocaleTimeString()} · next auto-refresh {String(Math.floor(secondsToRefresh / 60)).padStart(2, "0")}:{String(secondsToRefresh % 60).padStart(2, "0")}
            </div>
            <button onClick={doRefresh} style={{
              display: "flex", alignItems: "center", gap: 6, padding: "7px 13px", borderRadius: 7,
              background: COLORS.brand, border: `1px solid ${COLORS.brand}`, color: "#05070A",
              fontFamily: F_BODY, fontWeight: 700, fontSize: 12,
            }}>
              <RefreshCw size={13} style={{ animation: refreshing ? "spin 0.6s linear" : "none" }} />
              Refresh Now
            </button>
          </div>
        </div>
        {/* ticker tape */}
        <div style={{ overflow: "hidden", borderTop: `1px solid ${COLORS.border}`, background: COLORS.bg, whiteSpace: "nowrap", padding: "7px 0" }}>
          <div className="tape-track">
            {[...tapeItems, ...tapeItems].map((it, i) => (
              <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: F_DATA, fontSize: 12, padding: "0 18px", color: it.val >= 0 ? COLORS.up : COLORS.down }}>
                {it.val >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {it.label} <span style={{ color: COLORS.text }}>{fmt(it.val, 2)}%</span>
              </span>
            ))}
          </div>
        </div>
        {/* tab nav */}
        <div style={{ display: "flex", gap: 4, padding: "0 18px", overflowX: "auto" }}>
          {TABS.map((t) => {
            const active = tab === t.id;
            return (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                display: "flex", alignItems: "center", gap: 7, padding: "10px 14px", background: "none", border: "none",
                borderBottom: active ? `2px solid ${COLORS.brand}` : "2px solid transparent",
                color: active ? COLORS.text : COLORS.muted, fontFamily: F_BODY, fontWeight: 600, fontSize: 13, whiteSpace: "nowrap",
              }}>
                <t.icon size={14} /> {t.label}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ maxWidth: 1360, margin: "0 auto", padding: "20px 22px 60px" }}>
        {/* ===== FILTER BAR (overview + fx) ===== */}
        {(tab === "overview" || tab === "fx") && (
          <Panel style={{ padding: 14, marginBottom: 18, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {CONTINENTS.map((c) => (
                <button key={c} onClick={() => setContinent(c)} style={{
                  padding: "6px 12px", borderRadius: 7, fontSize: 12, fontFamily: F_BODY, fontWeight: 600,
                  background: continent === c ? COLORS.brand : COLORS.panelAlt,
                  color: continent === c ? "#05070A" : COLORS.muted,
                  border: `1px solid ${continent === c ? COLORS.brand : COLORS.border}`,
                }}>{c}</button>
              ))}
            </div>
            <div style={{ width: 1, height: 22, background: COLORS.border }} />
            <div style={{ display: "flex", gap: 6 }}>
              {["All", "Major", "Minor"].map((c) => (
                <button key={c} onClick={() => setAssetClass(c)} style={{
                  padding: "6px 12px", borderRadius: 7, fontSize: 12, fontFamily: F_BODY, fontWeight: 600,
                  background: assetClass === c ? COLORS.brand2 : COLORS.panelAlt,
                  color: assetClass === c ? "#fff" : COLORS.muted,
                  border: `1px solid ${assetClass === c ? COLORS.brand2 : COLORS.border}`,
                }}>{c}</button>
              ))}
            </div>
            <div style={{ flex: 1, minWidth: 180, display: "flex", alignItems: "center", gap: 8, background: COLORS.panelAlt, border: `1px solid ${COLORS.border}`, borderRadius: 7, padding: "6px 10px" }}>
              <Search size={13} color={COLORS.mutedDim} />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search country or currency…" style={{ background: "none", border: "none", outline: "none", color: COLORS.text, fontSize: 12, fontFamily: F_BODY, width: "100%" }} />
            </div>
          </Panel>
        )}

        {/* ===== OVERVIEW ===== */}
        {tab === "overview" && (
          <>
            <SectionTitle icon={Globe} title="Daily FX Demand vs. Supply by Country" sub={`${filteredFx.length} currencies · pressure gauge = net demand (teal) vs. net supply (red)`} />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: 12 }}>
              {filteredFx.map((c) => (
                <Panel key={c.code} style={{ padding: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ fontFamily: F_DISPLAY, fontWeight: 700, fontSize: 15 }}>{c.flag} {c.code}</div>
                      <div style={{ fontSize: 11, color: COLORS.mutedDim }}>{c.country} · {c.name}</div>
                    </div>
                    <Badge tone={c.major ? "brand" : "neutral"}>{c.major ? "MAJOR" : "MINOR"}</Badge>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontFamily: F_DATA, fontSize: 12, marginTop: 12 }}>
                    <span style={{ color: COLORS.up }}>D ${fmt(c.demand, 1)}B</span>
                    <span style={{ color: COLORS.down }}>S ${fmt(c.supply, 1)}B</span>
                  </div>
                  <div style={{ marginTop: 6 }}><PressureGauge netPct={c.netPct} /></div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontFamily: F_DATA, fontSize: 11, color: c.net >= 0 ? COLORS.up : COLORS.down }}>
                    <span>Net {c.net >= 0 ? "+" : ""}{fmt(c.net, 1)}B</span>
                    <span>{fmt(c.netPct, 1)}%</span>
                  </div>
                  <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 8, lineHeight: 1.4 }}>
                    {c.relatedIntervention ? <><Landmark size={11} style={{ verticalAlign: -1, marginRight: 4 }} />{c.relatedIntervention.bank}: {c.relatedIntervention.desc}</> : "No active intervention flagged — flows tracking broad risk sentiment."}
                  </div>
                </Panel>
              ))}
            </div>
          </>
        )}

        {/* ===== FX MAJORS & MINORS ===== */}
        {tab === "fx" && (
          <>
            <SectionTitle icon={TrendingUp} title="Major vs. Minor Pair Comparison" sub="Net demand–supply pressure (%) per pair, today" />
            <Panel style={{ padding: 16, marginBottom: 22 }}>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={pairChartData} margin={{ top: 10, right: 10, left: -10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: COLORS.mutedDim, fontSize: 10, fontFamily: F_DATA }} angle={-35} textAnchor="end" interval={0} height={60} />
                  <YAxis tick={{ fill: COLORS.mutedDim, fontSize: 10, fontFamily: F_DATA }} />
                  <Tooltip contentStyle={{ background: COLORS.panelHi, border: `1px solid ${COLORS.border}`, borderRadius: 8, fontFamily: F_DATA, fontSize: 12 }} labelStyle={{ color: COLORS.text }} />
                  <Bar dataKey="Net" radius={[4, 4, 0, 0]}>
                    {pairChartData.map((d, i) => <Cell key={i} fill={d.Net >= 0 ? COLORS.up : COLORS.down} />)}
                    <LabelList dataKey="Net" position="top" formatter={(v) => `${v}%`} style={{ fill: COLORS.muted, fontSize: 9, fontFamily: F_DATA }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Panel>

            {[{ title: "Major Pairs", rows: majorPairRows }, { title: "Minor / Cross Pairs", rows: minorPairRows }].map((grp) => (
              <div key={grp.title} style={{ marginBottom: 26 }}>
                <SectionTitle title={grp.title} sub={`${grp.rows.length} pairs`} />
                <Panel style={{ overflow: "hidden" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1.3fr 2fr", padding: "10px 16px", fontSize: 11, color: COLORS.mutedDim, fontFamily: F_BODY, fontWeight: 600, borderBottom: `1px solid ${COLORS.border}` }}>
                    <span>PAIR</span><span>DEMAND / SUPPLY</span><span>PRESSURE</span><span>NET</span><span>EVENT / REASON</span>
                  </div>
                  {grp.rows.map((p) => (
                    <div key={p.pair} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1.3fr 2fr", padding: "12px 16px", alignItems: "center", borderBottom: `1px solid ${COLORS.border}`, fontSize: 12 }}>
                      <span style={{ fontFamily: F_DISPLAY, fontWeight: 700 }}>{p.pair}</span>
                      <span style={{ fontFamily: F_DATA, fontSize: 11 }}><span style={{ color: COLORS.up }}>${fmt(p.demand, 1)}B</span> / <span style={{ color: COLORS.down }}>${fmt(p.supply, 1)}B</span></span>
                      <PressureGauge netPct={p.netPct} />
                      <span style={{ fontFamily: F_DATA, color: p.net >= 0 ? COLORS.up : COLORS.down }}>{p.net >= 0 ? "+" : ""}{fmt(p.net, 1)}B ({fmt(p.netPct, 1)}%)</span>
                      <span style={{ color: COLORS.muted, fontSize: 11, lineHeight: 1.4 }}>{p.intervention ? p.intervention.desc : p.note}</span>
                    </div>
                  ))}
                </Panel>
              </div>
            ))}
          </>
        )}

        {/* ===== INTERVENTIONS ===== */}
        {tab === "interventions" && (
          <>
            <SectionTitle icon={Landmark} title="Central Bank & Government Interventions" sub="Actions and statements currently influencing FX supply and demand" />
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {INTERVENTIONS.map((iv) => (
                <Panel key={iv.id} style={{ padding: 14, display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <div style={{ width: 40, height: 40, borderRadius: 8, background: COLORS.panelHi, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Landmark size={18} color={COLORS.brand} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 6 }}>
                      <div style={{ fontFamily: F_DISPLAY, fontWeight: 700, fontSize: 14 }}>{iv.bank} <span style={{ color: COLORS.mutedDim, fontWeight: 500, fontSize: 12 }}>· {iv.country} ({iv.code})</span></div>
                      <div style={{ display: "flex", gap: 6 }}>
                        <Badge tone="neutral">{iv.type}</Badge>
                        <Badge tone={iv.impact === "Bullish" ? "up" : iv.impact === "Bearish" ? "down" : "warn"}>{iv.impact}</Badge>
                      </div>
                    </div>
                    <div style={{ fontSize: 12.5, color: COLORS.muted, marginTop: 6, lineHeight: 1.5 }}>{iv.desc}</div>
                    <div style={{ fontSize: 10.5, color: COLORS.mutedDim, marginTop: 6, fontFamily: F_DATA }}>{iv.time} local</div>
                  </div>
                </Panel>
              ))}
            </div>
          </>
        )}

        {/* ===== CROSS-ASSET ===== */}
        {tab === "cross" && (
          <>
            <SectionTitle icon={Activity} title="Cross-Asset Updates" sub="Crypto · Commodities · Agricultural · Indices · Futures — price, change, and daily demand vs. supply ($B). Commodity prices are anchored to real mid-August 2026 market levels." />
            <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
              {[{ id: "crypto", label: "Crypto" }, { id: "commodities", label: "Commodities" }, { id: "agri", label: "Agricultural" }, { id: "indices", label: "Indices" }, { id: "futures", label: "Futures" }].map((s) => {
                const Icon = crossIconMap[s.id];
                const active = crossTab === s.id;
                return (
                  <button key={s.id} onClick={() => setCrossTab(s.id)} style={{
                    display: "flex", alignItems: "center", gap: 6, padding: "8px 13px", borderRadius: 8, fontSize: 12.5, fontWeight: 600, fontFamily: F_BODY,
                    background: active ? COLORS.brand : COLORS.panelAlt, color: active ? "#05070A" : COLORS.muted, border: `1px solid ${active ? COLORS.brand : COLORS.border}`,
                  }}><Icon size={13} /> {s.label}</button>
                );
              })}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
              {crossMap[crossTab].map((a) => (
                <Panel key={a.key} style={{ padding: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ fontFamily: F_DISPLAY, fontWeight: 700, fontSize: 14 }}>{a.sym}</div>
                      <div style={{ fontSize: 11, color: COLORS.mutedDim }}>{a.name}{a.region ? ` · ${a.region}` : ""}</div>
                    </div>
                    <Badge tone={a.change >= 0 ? "up" : "down"}>{a.change >= 0 ? "+" : ""}{fmt(a.change, 2)}%</Badge>
                  </div>
                  <div style={{ fontFamily: F_DATA, fontSize: 18, fontWeight: 600, marginTop: 10 }}>{fmt(a.price, a.price > 1000 ? 0 : 2)}</div>
                  {a.demand !== undefined && (
                    <>
                      <div style={{ display: "flex", justifyContent: "space-between", fontFamily: F_DATA, fontSize: 12, marginTop: 12 }}>
                        <span style={{ color: COLORS.up }}>D ${fmt(a.demand, 1)}B</span>
                        <span style={{ color: COLORS.down }}>S ${fmt(a.supply, 1)}B</span>
                      </div>
                      <div style={{ marginTop: 6 }}><PressureGauge netPct={a.netPct} /></div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontFamily: F_DATA, fontSize: 11, color: a.net >= 0 ? COLORS.up : COLORS.down }}>
                        <span>Net {a.net >= 0 ? "+" : ""}{fmt(a.net, 1)}B</span>
                        <span>{fmt(a.netPct, 1)}%</span>
                      </div>
                    </>
                  )}
                  {a.driver && <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 8, lineHeight: 1.4 }}>{a.driver}</div>}
                </Panel>
              ))}
            </div>
          </>
        )}

        {/* ===== CFD INSTRUMENTS ===== */}
        {tab === "cfd" && (
          <>
            <SectionTitle icon={Boxes} title="All CFD Instruments" sub={`${filteredCfd.length} contracts-for-difference with live-updating prices, across FX, indices, commodities, agricultural, crypto, shares & bonds`} />
            <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
              {cfdCategories.map((c) => (
                <button key={c} onClick={() => setCfdCategory(c)} style={{
                  padding: "7px 13px", borderRadius: 8, fontSize: 12.5, fontWeight: 600, fontFamily: F_BODY,
                  background: cfdCategory === c ? COLORS.brand2 : COLORS.panelAlt,
                  color: cfdCategory === c ? "#fff" : COLORS.muted,
                  border: `1px solid ${cfdCategory === c ? COLORS.brand2 : COLORS.border}`,
                }}>{c}</button>
              ))}
            </div>
            <Panel style={{ overflow: "hidden" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 0.65fr 0.8fr 1.1fr 0.65fr 0.75fr 1fr", padding: "10px 16px", fontSize: 11, color: COLORS.mutedDim, fontWeight: 600, borderBottom: `1px solid ${COLORS.border}` }}>
                <span>INSTRUMENT</span><span>CATEGORY</span><span>PRICE (LIVE)</span><span>DEMAND / SUPPLY</span><span>CHANGE</span><span>PRESSURE</span><span>LEVERAGE / SESSION</span>
              </div>
              {filteredCfd.map((c, i) => (
                <div key={c.sym + i} style={{ display: "grid", gridTemplateColumns: "1fr 0.65fr 0.8fr 1.1fr 0.65fr 0.75fr 1fr", padding: "11px 16px", alignItems: "center", borderBottom: `1px solid ${COLORS.border}`, fontSize: 12.5 }}>
                  <span>
                    <span style={{ fontFamily: F_DISPLAY, fontWeight: 700 }}>{c.sym}</span>
                    <span style={{ color: COLORS.mutedDim, fontSize: 11 }}> · {c.name}</span>
                  </span>
                  <Badge tone="neutral">{c.category}</Badge>
                  <span style={{ fontFamily: F_DATA, fontSize: 12 }}>{fmtPrice(c.price)}</span>
                  <span style={{ fontFamily: F_DATA, fontSize: 11 }}>
                    {c.demand !== undefined ? (
                      <><span style={{ color: COLORS.up }}>${fmt(c.demand, 1)}B</span> / <span style={{ color: COLORS.down }}>${fmt(c.supply, 1)}B</span></>
                    ) : <span style={{ color: COLORS.mutedDim }}>—</span>}
                  </span>
                  <span style={{ fontFamily: F_DATA, color: c.change >= 0 ? COLORS.up : COLORS.down }}>{c.change >= 0 ? "+" : ""}{fmt(c.change, 2)}%</span>
                  <PressureGauge netPct={c.netPct} />
                  <span style={{ fontFamily: F_DATA, fontSize: 10.8, color: COLORS.muted, lineHeight: 1.5 }}>{c.spec.leverage}<br /><span style={{ color: COLORS.mutedDim }}>{c.spec.session}</span></span>
                </div>
              ))}
            </Panel>
            <div style={{ fontSize: 11, color: COLORS.mutedDim, marginTop: 10, display: "flex", gap: 6, alignItems: "flex-start" }}>
              <AlertTriangle size={12} style={{ marginTop: 1, flexShrink: 0 }} />
              Leverage figures are indicative, retail-tier examples only — actual CFD leverage, margin, and eligibility vary by broker, jurisdiction, and client classification.
            </div>
          </>
        )}

        {/* ===== MARGIN & PIP CALCULATOR ===== */}
        {tab === "calculator" && (
          <>
            <SectionTitle icon={Calculator} title="Margin &amp; Pip Calculator" sub="Estimate required margin, pip/point value, and potential profit or loss for any CFD instrument on the platform" />

            <Panel style={{ padding: 18, marginBottom: 18 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>
                <div>
                  <label style={{ fontSize: 11, color: COLORS.mutedDim, fontWeight: 600 }}>CATEGORY</label>
                  <select value={calcCategory} onChange={(e) => { setCalcCategory(e.target.value); }} style={selStyle}>
                    {cfdCategories.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11, color: COLORS.mutedDim, fontWeight: 600 }}>INSTRUMENT</label>
                  <select value={calcSym} onChange={(e) => { setCalcSym(e.target.value); setCalcEntry(""); setCalcExit(""); }} style={selStyle}>
                    {calcInstrumentList.map((c) => <option key={c.sym} value={c.sym}>{c.sym} — {c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11, color: COLORS.mutedDim, fontWeight: 600 }}>DIRECTION</label>
                  <select value={calcDirection} onChange={(e) => setCalcDirection(e.target.value)} style={selStyle}>
                    <option value="Buy">Buy / Long</option>
                    <option value="Sell">Sell / Short</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11, color: COLORS.mutedDim, fontWeight: 600 }}>LOT SIZE</label>
                  <input type="number" step="0.01" min="0.01" value={calcLot} onChange={(e) => setCalcLot(e.target.value)} style={selStyle} />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: COLORS.mutedDim, fontWeight: 600 }}>LEVERAGE RATIO</label>
                  <select value={calcLeverageChoice} onChange={(e) => setCalcLeverageChoice(e.target.value)} style={selStyle}>
                    {LEVERAGE_OPTIONS.map((lv) => (
                      <option key={lv} value={lv}>{lv === "Default" ? `Default (${calcInstrument.spec.leverage})` : lv}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11, color: COLORS.mutedDim, fontWeight: 600 }}>ENTRY PRICE</label>
                  <input type="number" step="any" value={calcEntry} onChange={(e) => setCalcEntry(e.target.value)} placeholder={`Live: ${fmtPrice(calcInstrument.price)}`} style={selStyle} />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: COLORS.mutedDim, fontWeight: 600 }}>EXIT / STOP PRICE</label>
                  <input type="number" step="any" value={calcExit} onChange={(e) => setCalcExit(e.target.value)} placeholder={`e.g. ${fmtPrice(effEntry)}`} style={selStyle} />
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <button onClick={() => setCalcEntry(String(calcInstrument.price))} style={{ ...miniBtn }}>Use Live Price as Entry</button>
                <button onClick={() => { setCalcEntry(""); setCalcExit(""); }} style={{ ...miniBtn }}>Reset</button>
              </div>
              <div style={{ fontSize: 11, color: COLORS.mutedDim, marginTop: 10 }}>{calcUnitsLabel} · Using leverage <span style={{ color: COLORS.brand, fontFamily: F_DATA }}>1:{calcLeverage}</span>{calcLeverageChoice === "Default" ? ` (instrument default, indicative cap ${calcInstrument.spec.leverage})` : " (manually selected)"} · Live price used automatically when a field is left blank.</div>
            </Panel>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginBottom: 22 }}>
              {[
                { label: "Required Margin", value: `$${fmt(calcMargin, 2)}`, icon: DollarSign, tone: "brand" },
                { label: "Leverage Used", value: `1:${calcLeverage}`, icon: Percent, tone: "brand" },
                { label: `Value per ${calcSpec.unitLabel}`, value: `$${fmt(calcPointValue, 2)}`, icon: Activity, tone: "brand" },
                { label: `${calcSpec.unitLabel === "point" ? "Points" : "Pips"} to Exit/Stop`, value: fmt(calcPointsMoved, 1), icon: Target, tone: "neutral" },
                { label: `${calcSpec.unitLabel === "point" ? "Points" : "Pips"} per $1`, value: fmt(calcPipsPerDollar, 2), icon: Percent, tone: "neutral" },
                { label: "Potential P/L (Entry → Exit)", value: `${calcPL >= 0 ? "+" : ""}$${fmt(calcPL, 2)}`, icon: calcPL >= 0 ? TrendingUp : TrendingDown, tone: calcPL >= 0 ? "up" : "down" },
              ].map((s, i) => (
                <Panel key={i} style={{ padding: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 11, color: COLORS.mutedDim, fontWeight: 600 }}>
                    <s.icon size={13} /> {s.label.toUpperCase()}
                  </div>
                  <div style={{ fontFamily: F_DATA, fontSize: 20, fontWeight: 600, marginTop: 8, color: s.tone === "up" ? COLORS.up : s.tone === "down" ? COLORS.down : s.tone === "brand" ? COLORS.brand : COLORS.text }}>{s.value}</div>
                </Panel>
              ))}
            </div>

            <SectionTitle title="Pip/Point Value &amp; Margin Reference — All CFD Instruments" sub="At a standard 1.00 lot, using each instrument's live price" />
            <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
              {cfdCategories.map((c) => (
                <button key={c} onClick={() => setCalcCategory(c)} style={{
                  padding: "7px 13px", borderRadius: 8, fontSize: 12.5, fontWeight: 600, fontFamily: F_BODY,
                  background: calcCategory === c ? COLORS.brand2 : COLORS.panelAlt,
                  color: calcCategory === c ? "#fff" : COLORS.muted,
                  border: `1px solid ${calcCategory === c ? COLORS.brand2 : COLORS.border}`,
                }}>{c}</button>
              ))}
            </div>
            <Panel style={{ overflow: "hidden" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.7fr 0.8fr 0.8fr 1.1fr 1fr 1.1fr", padding: "10px 16px", fontSize: 11, color: COLORS.mutedDim, fontWeight: 600, borderBottom: `1px solid ${COLORS.border}` }}>
                <span>INSTRUMENT</span><span>CATEGORY</span><span>PRICE</span><span>PIP/POINT</span><span>VALUE / PIP (1.00 LOT)</span><span>PIPS PER $1</span><span>MARGIN (1.00 LOT)</span>
              </div>
              {calcInstrumentList.map((c, i) => {
                const spec = getSpec(c.sym, c.category);
                const pv = pointValueUSD(c.sym, c.category, c.price, 1);
                const lev = parseLeverage(c.spec.leverage);
                const mgn = marginUSD(c.sym, c.category, c.price, 1, lev);
                const pipsPerDollar = pv !== 0 ? Math.abs(spec.pointSize / pv) : 0;
                return (
                  <div key={c.sym + i} style={{ display: "grid", gridTemplateColumns: "1.1fr 0.7fr 0.8fr 0.8fr 1.1fr 1fr 1.1fr", padding: "10px 16px", alignItems: "center", borderBottom: `1px solid ${COLORS.border}`, fontSize: 12 }}>
                    <span style={{ fontFamily: F_DISPLAY, fontWeight: 700 }}>{c.sym}</span>
                    <Badge tone="neutral">{c.category}</Badge>
                    <span style={{ fontFamily: F_DATA }}>{fmtPrice(c.price)}</span>
                    <span style={{ fontFamily: F_DATA, fontSize: 10.5, color: COLORS.muted }}>{spec.pointSize}</span>
                    <span style={{ fontFamily: F_DATA, color: COLORS.up }}>${fmt(pv, 2)}</span>
                    <span style={{ fontFamily: F_DATA }}>{fmt(pipsPerDollar, 2)}</span>
                    <span style={{ fontFamily: F_DATA, color: COLORS.muted }}>${fmt(mgn, 0)}</span>
                  </div>
                );
              })}
            </Panel>
            <div style={{ fontSize: 11, color: COLORS.mutedDim, marginTop: 10, display: "flex", gap: 6, alignItems: "flex-start" }}>
              <AlertTriangle size={12} style={{ marginTop: 1, flexShrink: 0 }} />
              Formulas use simplified, indicative contract sizes and leverage for demonstration (e.g. standard FX lot = 100,000 units, Gold = 100 oz/lot). Real broker specs, margin requirements, and pip/point conventions vary — this is not a substitute for your broker's official contract specifications.
            </div>
          </>
        )}

        {/* ===== TRADE IDEAS ===== */}
        {tab === "ideas" && (
          <>
            <SectionTitle icon={Target} title="Suggested Trade Opportunities — Today" sub="Ranked by demand/supply imbalance, intervention flow, and calendar catalysts. Not investment advice." />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 14 }}>
              {ideas.map((it, i) => (
                <Panel key={i} style={{ padding: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <Badge tone="neutral">{it.type}</Badge>
                      <div style={{ fontFamily: F_DISPLAY, fontWeight: 700, fontSize: 18, marginTop: 8 }}>{it.instrument}</div>
                    </div>
                    <Badge tone={it.netPct >= 0 ? "up" : "down"}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                        {it.netPct >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />} {it.direction}
                      </span>
                    </Badge>
                  </div>
                  <div style={{ marginTop: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: COLORS.mutedDim, marginBottom: 4 }}>
                      <span>CONFIDENCE</span><span style={{ fontFamily: F_DATA, color: COLORS.text }}>{it.confidence}%</span>
                    </div>
                    <div style={{ height: 6, background: COLORS.panelAlt, borderRadius: 4, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${it.confidence}%`, background: `linear-gradient(90deg, ${COLORS.brand}, ${COLORS.brand2})` }} />
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 12, lineHeight: 1.5, display: "flex", gap: 6 }}>
                    <Newspaper size={13} style={{ flexShrink: 0, marginTop: 2 }} color={COLORS.mutedDim} />
                    <span>{it.driver}</span>
                  </div>
                  {it.bank && (
                    <div style={{ fontSize: 11, color: COLORS.mutedDim, marginTop: 8, display: "flex", alignItems: "center", gap: 5 }}>
                      <Landmark size={12} /> Linked policy source: {it.bank}
                    </div>
                  )}
                </Panel>
              ))}
            </div>
          </>
        )}

        {/* ===== CALENDAR ===== */}
        {tab === "calendar" && (
          <>
            <SectionTitle icon={CalendarIcon} title="Economic Calendar" sub="Scheduled releases per continent — local release time, Nairobi (Kenya, EAT) time, actual vs. forecast/previous, and the likely demand/supply implication" />
            <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
              {CONTINENTS.map((c) => (
                <button key={c} onClick={() => setCalendarContinent(c)} style={{
                  padding: "7px 13px", borderRadius: 8, fontSize: 12.5, fontWeight: 600, fontFamily: F_BODY,
                  background: calendarContinent === c ? COLORS.brand : COLORS.panelAlt,
                  color: calendarContinent === c ? "#05070A" : COLORS.muted,
                  border: `1px solid ${calendarContinent === c ? COLORS.brand : COLORS.border}`,
                }}>{c}</button>
              ))}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {CALENDAR.filter((ev) => calendarContinent === "All" || ev.continent === calendarContinent).map((ev) => {
                const impl = buildImplication(ev);
                const kenyaTime = toKenyaTime(ev.timeLocal, ev.utcOffset);
                return (
                  <Panel key={ev.id} style={{ padding: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 20 }}>{ev.flag}</span>
                        <div>
                          <div style={{ fontFamily: F_DISPLAY, fontWeight: 700, fontSize: 14 }}>{ev.event}</div>
                          <div style={{ fontSize: 11, color: COLORS.mutedDim }}>{ev.country} · {ev.continent} · <Badge tone="brand">{ev.currency}</Badge></div>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 6, alignItems: "flex-start" }}>
                        <Badge tone={ev.impact === "High" ? "down" : ev.impact === "Medium" ? "warn" : "neutral"}>{ev.impact} Impact</Badge>
                        <Badge tone={impl.tone}>{impl.result}</Badge>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 18, flexWrap: "wrap", marginTop: 10, fontFamily: F_DATA, fontSize: 11.5, color: COLORS.muted }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><CalendarIcon size={12} color={COLORS.mutedDim} /> {ev.dateLocal}</span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><MapPin size={12} color={COLORS.mutedDim} /> Local ({ev.country}): {ev.timeLocal}</span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 5, color: COLORS.brand }}><Clock size={12} /> Nairobi (EAT): {kenyaTime}</span>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 12 }}>
                      <div style={{ background: COLORS.panelAlt, border: `1px solid ${COLORS.border}`, borderRadius: 7, padding: "8px 10px" }}>
                        <div style={{ fontSize: 10, color: COLORS.mutedDim, fontWeight: 600 }}>PREVIOUS</div>
                        <div style={{ fontFamily: F_DATA, fontSize: 13.5, marginTop: 3 }}>{ev.previous}</div>
                      </div>
                      <div style={{ background: COLORS.panelAlt, border: `1px solid ${COLORS.border}`, borderRadius: 7, padding: "8px 10px" }}>
                        <div style={{ fontSize: 10, color: COLORS.mutedDim, fontWeight: 600 }}>FORECAST</div>
                        <div style={{ fontFamily: F_DATA, fontSize: 13.5, marginTop: 3 }}>{ev.forecast}</div>
                      </div>
                      <div style={{ background: COLORS.panelAlt, border: `1px solid ${COLORS.border}`, borderRadius: 7, padding: "8px 10px" }}>
                        <div style={{ fontSize: 10, color: COLORS.mutedDim, fontWeight: 600 }}>ACTUAL</div>
                        <div style={{ fontFamily: F_DATA, fontSize: 13.5, marginTop: 3, color: ev.actual === null ? COLORS.mutedDim : impl.tone === "up" ? COLORS.up : impl.tone === "down" ? COLORS.down : COLORS.text }}>
                          {ev.actual === null ? "Awaiting release" : ev.actual}
                        </div>
                      </div>
                    </div>

                    <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 12, lineHeight: 1.5, display: "flex", gap: 6 }}>
                      <Newspaper size={13} style={{ flexShrink: 0, marginTop: 2 }} color={COLORS.mutedDim} />
                      <span><b style={{ color: COLORS.text }}>Implication: </b>{impl.text}</span>
                    </div>
                  </Panel>
                );
              })}
            </div>
            <div style={{ fontSize: 11, color: COLORS.mutedDim, marginTop: 10, display: "flex", gap: 6, alignItems: "flex-start" }}>
              <AlertTriangle size={12} style={{ marginTop: 1, flexShrink: 0 }} />
              Actual, forecast and previous figures are simulated. Implications follow a standard, rules-based forex-calendar read (actual vs. forecast surprise, scaled by impact level) similar in spirit to sites like myfxbook's economic calendar — not investment advice.
            </div>
          </>
        )}

        <div style={{ marginTop: 30, padding: 14, borderTop: `1px solid ${COLORS.border}`, fontSize: 11, color: COLORS.mutedDim, display: "flex", alignItems: "center", gap: 6 }}>
          <AlertTriangle size={13} /> All figures are simulated for demonstration and refresh on a timer — not live market data and not investment advice.
        </div>
      </div>
    </div>
  );
}
