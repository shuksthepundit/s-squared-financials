import React, { useState, useEffect, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList,
} from "recharts";
import {
  Globe, TrendingUp, TrendingDown, AlertTriangle, Newspaper, Calendar as CalendarIcon,
  Landmark, Coins, Target, ArrowUpRight, ArrowDownRight, Search, LineChart as LineChartIcon,
  Fuel, Gem, Sprout, ChevronDown, Activity, Clock, Radio, RefreshCw, Boxes,
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
  { pair: "EUR/USD", key: "EURUSD", link: "ecb", note: "ECB dovish tilt vs. hawkish Fed hold" },
  { pair: "USD/JPY", key: "USDJPY", link: "boj", note: "Yield gap wide; MOF verbal intervention watch" },
  { pair: "GBP/USD", key: "GBPUSD", link: "boe", note: "Split BoE vote keeps range intact" },
  { pair: "USD/CHF", key: "USDCHF", link: "snb", note: "SNB flags FX action against franc strength" },
  { pair: "AUD/USD", key: "AUDUSD", link: "rba", note: "RBA on hold; commodity demand supportive" },
  { pair: "USD/CAD", key: "USDCAD", link: "fed", note: "Crude prices and rate-hold dollar bid offsetting" },
  { pair: "NZD/USD", key: "NZDUSD", link: "rba", note: "Tracking AUD; dairy export demand in focus" },
];
const MINOR_PAIRS = [
  { pair: "EUR/GBP", key: "EURGBP", link: "ecb", note: "Diverging central bank rhetoric" },
  { pair: "AUD/JPY", key: "AUDJPY", link: "boj", note: "Risk-carry flows vs. yen intervention risk" },
  { pair: "USD/ZAR", key: "USDZAR", link: "sarb", note: "SARB hike defends rand demand" },
  { pair: "USD/MXN", key: "USDMXN", link: "banxico", note: "Banxico cut trims peso carry appeal" },
  { pair: "USD/TRY", key: "USDTRY", link: "cbrt", note: "Restrictive CBRT stance supports lira demand" },
  { pair: "USD/INR", key: "USDINR", link: null, note: "RBI smoothing two-way flows near record highs" },
  { pair: "USD/NGN", key: "USDNGN", link: "cbn", note: "FX unification lifts naira supply" },
];

/* ============================== CROSS-ASSET STATIC DATA ============================== */
const CRYPTO = [
  { sym: "BTC", name: "Bitcoin", key: "BTC", driver: "ETF inflows steady; funding rates neutral-to-positive." },
  { sym: "ETH", name: "Ethereum", key: "ETH", driver: "Staking withdrawals muted; L2 activity climbing." },
  { sym: "SOL", name: "Solana", key: "SOL", driver: "Network throughput highs supporting speculative demand." },
  { sym: "BNB", name: "BNB", key: "BNB", driver: "Exchange volumes firm across Asia session." },
  { sym: "XRP", name: "XRP", key: "XRP", driver: "Regulatory clarity headlines driving two-way flow." },
];
const COMMODITIES = [
  { sym: "XAU", name: "Gold", key: "XAU", icon: "gem", driver: "Central-bank buying and safe-haven bid persist." },
  { sym: "XAG", name: "Silver", key: "XAG", icon: "gem", driver: "Industrial demand from solar sector supportive." },
  { sym: "WTI", name: "Crude Oil (WTI)", key: "WTI", icon: "fuel", driver: "OPEC+ supply discipline vs. soft demand data." },
  { sym: "BRENT", name: "Crude Oil (Brent)", key: "BRENT", icon: "fuel", driver: "Red Sea shipping disruptions keep risk premium bid." },
  { sym: "NATGAS", name: "Natural Gas", key: "NATGAS", icon: "fuel", driver: "Mild weather forecasts easing near-term demand." },
  { sym: "HG", name: "Copper", key: "HG", icon: "gem", driver: "Grid and EV demand vs. Chinese property drag." },
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
  { sym: "XPT", name: "Platinum", key: "XPT", icon: "gem", driver: "Auto-catalyst demand recovering with EV-hybrid mix shift." },
  { sym: "XPD", name: "Palladium", key: "XPD", icon: "gem", driver: "Tight mine supply from Russia/South Africa underpins price." },
  { sym: "HO", name: "Heating Oil", key: "HO", icon: "fuel", driver: "Seasonal demand build ahead of Northern Hemisphere winter." },
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

/* ============================== CALENDAR ============================== */
const CALENDAR = [
  { time: "09:30", when: "Today", country: "🇬🇧 UK", event: "CPI y/y", impact: "High", forecast: "2.6%", previous: "2.8%" },
  { time: "12:30", when: "Today", country: "🇺🇸 US", event: "Core Retail Sales m/m", impact: "High", forecast: "0.3%", previous: "0.1%" },
  { time: "14:00", when: "Today", country: "🇹🇷 Turkey", event: "CBRT Rate Decision", impact: "High", forecast: "Hold", previous: "Hold" },
  { time: "23:50", when: "Today", country: "🇯🇵 Japan", event: "Trade Balance", impact: "Medium", forecast: "-¥450B", previous: "-¥622B" },
  { time: "01:30", when: "Tomorrow", country: "🇨🇳 China", event: "PBoC Loan Prime Rate", impact: "High", forecast: "3.45%", previous: "3.45%" },
  { time: "08:00", when: "Tomorrow", country: "🇪🇺 Eurozone", event: "Flash PMI (Composite)", impact: "Medium", forecast: "51.2", previous: "50.9" },
  { time: "12:30", when: "Tomorrow", country: "🇨🇦 Canada", event: "Core CPI m/m", impact: "Medium", forecast: "0.2%", previous: "0.3%" },
  { time: "14:30", when: "Tomorrow", country: "🇿🇦 South Africa", event: "SARB MPC Statement", impact: "Medium", forecast: "—", previous: "—" },
];

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
    return { ...p, demand, supply, net, netPct, intervention };
  }
  const majorPairRows = MAJOR_PAIRS.map(pairRow);
  const minorPairRows = MINOR_PAIRS.map(pairRow);
  const pairChartData = [...majorPairRows, ...minorPairRows].map((p) => ({ name: p.pair, Net: Number(p.netPct.toFixed(1)) }));

  /* ---- cross asset live values ---- */
  function assetLive(list, priceMin, priceMax, changeAmp) {
    return list.map((a) => {
      const priceBase = baseVal(a.key + "P-e" + refreshEpoch, priceMin, priceMax);
      const price = priceBase + jitter(a.key + "P", tick, priceBase * 0.004);
      const change = jitter(a.key + "C", tick, changeAmp) + baseVal(a.key + "CB-e" + refreshEpoch, -1.2, 1.2);
      return { ...a, price, change };
    });
  }
  const cryptoLive = assetLive(CRYPTO, 0.4, 68000, 1.8).map((a) => ({ ...a, price: a.sym === "BTC" ? a.price : a.sym === "ETH" ? a.price * 0.05 + 2000 : a.price }));
  const commoditiesLive = assetLive(COMMODITIES, 1.9, 2400, 0.9);
  const agriLive = assetLive(AGRI, 3, 620, 1.1);
  const indicesLive = assetLive(INDICES, 4200, 39000, 0.7);
  const futuresLive = assetLive(FUTURES, 24, 5600, 0.8);

  const crossMap = { crypto: cryptoLive, commodities: commoditiesLive, agri: agriLive, indices: indicesLive, futures: futuresLive };
  const crossIconMap = { crypto: Coins, commodities: Gem, agri: Sprout, indices: LineChartIcon, futures: Activity };

  /* ---- full CFD instrument catalog (every asset class, CFD wrapper) ---- */
  const sharesCfdLive = assetLive(SHARES_CFD, 18, 950, 1.3);
  const bondsCfdLive = assetLive(BONDS_CFD, 92, 145, 0.3);
  const indicesExtraLive = assetLive(INDICES_EXTRA, 3800, 84000, 0.7);
  const commoditiesExtraLive = assetLive(COMMODITIES_EXTRA, 0.6, 1050, 1.0);
  const cryptoExtraLive = assetLive(CRYPTO_EXTRA, 0.06, 7.5, 2.5);

  const cfdCatalog = [
    ...majorPairRows.map((p) => ({ sym: p.pair, name: `${p.pair} Spot FX`, category: "FX", change: p.netPct / 8 })),
    ...minorPairRows.map((p) => ({ sym: p.pair, name: `${p.pair} Spot FX`, category: "FX", change: p.netPct / 8 })),
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

  /* ---- trade ideas (derived) ---- */
  const ideaPool = [
    ...majorPairRows.map((p) => ({ type: "FX Major", instrument: p.pair, netPct: p.netPct, driver: p.intervention ? p.intervention.desc : p.note, bank: p.intervention ? p.intervention.bank : null })),
    ...minorPairRows.map((p) => ({ type: "FX Minor", instrument: p.pair, netPct: p.netPct, driver: p.intervention ? p.intervention.desc : p.note, bank: p.intervention ? p.intervention.bank : null })),
    ...cryptoLive.map((a) => ({ type: "Crypto", instrument: a.sym, netPct: a.change * 10, driver: a.driver })),
    ...commoditiesLive.map((a) => ({ type: "Commodity", instrument: a.name, netPct: a.change * 10, driver: a.driver })),
    ...indicesLive.map((a) => ({ type: "Index", instrument: a.name, netPct: a.change * 10, driver: `Cross-asset flow rotation into ${a.region}.` })),
  ];
  const ideas = [...ideaPool]
    .sort((a, b) => Math.abs(b.netPct) - Math.abs(a.netPct))
    .slice(0, 6)
    .map((it) => {
      const direction = it.netPct >= 0 ? "Buy / Long" : "Sell / Short";
      const confidence = Math.min(93, Math.round(52 + Math.abs(it.netPct) * 1.6));
      const calendarHit = CALENDAR.find((c) => it.instrument.includes(c.country.split(" ")[1] || "___") || false);
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
            <SectionTitle icon={Activity} title="Cross-Asset Updates" sub="Crypto · Commodities · Agricultural · Indices · Futures" />
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
                  <div style={{ marginTop: 8 }}><PressureGauge netPct={a.change * 12} /></div>
                  {a.driver && <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 8, lineHeight: 1.4 }}>{a.driver}</div>}
                </Panel>
              ))}
            </div>
          </>
        )}

        {/* ===== CFD INSTRUMENTS ===== */}
        {tab === "cfd" && (
          <>
            <SectionTitle icon={Boxes} title="All CFD Instruments" sub={`${filteredCfd.length} contracts-for-difference across FX, indices, commodities, agricultural, crypto, shares & bonds`} />
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
              <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr 1fr 1fr 1.2fr 1fr", padding: "10px 16px", fontSize: 11, color: COLORS.mutedDim, fontWeight: 600, borderBottom: `1px solid ${COLORS.border}` }}>
                <span>INSTRUMENT</span><span>CATEGORY</span><span>CHANGE</span><span>PRESSURE</span><span>LEVERAGE (INDICATIVE)</span><span>SESSION</span>
              </div>
              {filteredCfd.map((c, i) => (
                <div key={c.sym + i} style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr 1fr 1fr 1.2fr 1fr", padding: "11px 16px", alignItems: "center", borderBottom: `1px solid ${COLORS.border}`, fontSize: 12.5 }}>
                  <span>
                    <span style={{ fontFamily: F_DISPLAY, fontWeight: 700 }}>{c.sym}</span>
                    <span style={{ color: COLORS.mutedDim, fontSize: 11 }}> · {c.name}</span>
                  </span>
                  <Badge tone="neutral">{c.category}</Badge>
                  <span style={{ fontFamily: F_DATA, color: c.change >= 0 ? COLORS.up : COLORS.down }}>{c.change >= 0 ? "+" : ""}{fmt(c.change, 2)}%</span>
                  <PressureGauge netPct={c.netPct} />
                  <span style={{ fontFamily: F_DATA, fontSize: 11.5, color: COLORS.muted }}>{c.spec.leverage}</span>
                  <span style={{ fontFamily: F_DATA, fontSize: 11.5, color: COLORS.mutedDim }}>{c.spec.session}</span>
                </div>
              ))}
            </Panel>
            <div style={{ fontSize: 11, color: COLORS.mutedDim, marginTop: 10, display: "flex", gap: 6, alignItems: "flex-start" }}>
              <AlertTriangle size={12} style={{ marginTop: 1, flexShrink: 0 }} />
              Leverage figures are indicative, retail-tier examples only — actual CFD leverage, margin, and eligibility vary by broker, jurisdiction, and client classification.
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
            <SectionTitle icon={CalendarIcon} title="Economic Calendar" sub="High-impact releases and central bank events" />
            <Panel style={{ overflow: "hidden" }}>
              <div style={{ display: "grid", gridTemplateColumns: "0.6fr 0.6fr 1fr 1.6fr 0.7fr 0.8fr 0.8fr", padding: "10px 16px", fontSize: 11, color: COLORS.mutedDim, fontWeight: 600, borderBottom: `1px solid ${COLORS.border}` }}>
                <span>WHEN</span><span>TIME</span><span>COUNTRY</span><span>EVENT</span><span>IMPACT</span><span>FORECAST</span><span>PREVIOUS</span>
              </div>
              {CALENDAR.map((c, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "0.6fr 0.6fr 1fr 1.6fr 0.7fr 0.8fr 0.8fr", padding: "12px 16px", alignItems: "center", borderBottom: `1px solid ${COLORS.border}`, fontSize: 12.5 }}>
                  <span style={{ color: COLORS.mutedDim }}>{c.when}</span>
                  <span style={{ fontFamily: F_DATA }}>{c.time}</span>
                  <span>{c.country}</span>
                  <span>{c.event}</span>
                  <Badge tone={c.impact === "High" ? "down" : c.impact === "Medium" ? "warn" : "neutral"}>{c.impact}</Badge>
                  <span style={{ fontFamily: F_DATA, color: COLORS.muted }}>{c.forecast}</span>
                  <span style={{ fontFamily: F_DATA, color: COLORS.mutedDim }}>{c.previous}</span>
                </div>
              ))}
            </Panel>
          </>
        )}

        <div style={{ marginTop: 30, padding: 14, borderTop: `1px solid ${COLORS.border}`, fontSize: 11, color: COLORS.mutedDim, display: "flex", alignItems: "center", gap: 6 }}>
          <AlertTriangle size={13} /> All figures are simulated for demonstration and refresh on a timer — not live market data and not investment advice.
        </div>
      </div>
    </div>
  );
}
