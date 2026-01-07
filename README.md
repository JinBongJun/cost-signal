# Cost Signal

A simple, production-minded SaaS app that provides a weekly economic signal for U.S. consumers using a traffic-light system (🟢 OK, 🟡 CAUTION, 🔴 RISK).

## Philosophy

Cost Signal is designed to **reduce unnecessary anxiety** by summarizing whether recent U.S. economic changes are likely to affect everyday living costs. It does **NOT** provide financial advice or encourage spending/saving behavior.

## Features

- **Weekly Economic Signal**: Simple traffic-light indicator (OK, CAUTION, RISK)
- **Official Data Sources**: Uses only U.S. government APIs (EIA, BLS, FRED)
- **Deterministic Logic**: Rule-based signal calculation (no AI decision-making)
- **Free & Paid Tiers**: 
  - Free: Overall signal + explanation
  - Paid: Individual indicator breakdowns

## Data Sources

1. **Gas Prices** → EIA (Energy Information Administration)
2. **Inflation** → CPI from BLS (Bureau of Labor Statistics)
3. **Interest Rates** → FRED (Federal Reserve Economic Data)
4. **Unemployment** → FRED (Federal Reserve Economic Data)

## Signal Logic

Each indicator produces a status: **OK** or **RISK**

### Indicator Risk Conditions

- **Gas Prices**: RISK if price rose >5% in one week OR has risen for 3+ consecutive weeks
- **CPI**: RISK if MoM increase >0.5% OR has increased for 2+ consecutive months
- **Interest Rates**: RISK if rate has increased recently
- **Unemployment**: RISK if unemployment has increased for 2+ consecutive months

### Overall Signal

- **0 risk indicators** → 🟢 OK
- **1 risk indicator** → 🟡 CAUTION
- **2+ risk indicators** → 🔴 RISK

## Setup

### Prerequisites

- Node.js 18+ 
- npm or yarn
- API keys for:
  - OpenAI (for explanations)
  - EIA (for gas prices)
  - FRED (for interest rates and unemployment)
  - BLS (optional, but recommended)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file (copy from `.env.example`):
   ```bash
   OPENAI_API_KEY=your_openai_api_key_here
   EIA_API_KEY=your_eia_api_key_here
   FRED_API_KEY=your_fred_api_key_here
   DATABASE_PATH=./data/cost-signal.db
   ```

4. Get API keys:
   - **OpenAI**: https://platform.openai.com/api-keys
   - **EIA**: https://www.eia.gov/opendata/register.php
   - **FRED**: https://fred.stlouisfed.org/docs/api/api_key.html
   - **BLS**: No key required, but rate-limited

### Running the App

1. **Development mode**:
   ```bash
   npm run dev
   ```
   Visit http://localhost:3000

2. **Manual data update** (run weekly):
   ```bash
   npm run cron
   ```

3. **Production build**:
   ```bash
   npm run build
   npm start
   ```

## Weekly Updates

The app fetches data once per week. You can:

1. **Run manually**: `npm run cron`
2. **Schedule via cron**: Set up a cron job to run every Monday
3. **Use Vercel Cron** (if deployed on Vercel): Configure in `vercel.json`
4. **Use external scheduler**: Call `POST /api/cron` weekly

### Example Cron Setup

```bash
# Run every Monday at 9 AM UTC
0 9 * * 1 cd /path/to/cost-signal && npm run cron
```

## Project Structure

```
cost-signal/
├── app/
│   ├── api/
│   │   ├── signal/      # GET /api/signal (free/paid tiers)
│   │   └── cron/         # POST /api/cron (manual trigger)
│   ├── page.tsx          # Main frontend
│   ├── layout.tsx        # App layout
│   └── globals.css       # Styles
├── lib/
│   ├── db.ts             # Database operations
│   ├── signals.ts         # Signal evaluation logic
│   ├── explainer.ts      # LLM explanation generator
│   ├── cron.ts           # Cron job setup
│   ├── utils.ts          # Utility functions
│   └── fetchers/
│       ├── eia.ts        # Gas price fetcher
│       ├── bls.ts        # CPI fetcher
│       └── fred.ts       # Interest rate & unemployment fetchers
├── scripts/
│   └── run-cron.ts       # Weekly update script
└── data/                 # SQLite database (gitignored)
```

## API Endpoints

### GET /api/signal

Get the latest weekly signal.

**Query Parameters:**
- `tier` (optional): `'free'` or `'paid'` (default: `'free'`)

**Response (Free):**
```json
{
  "week_start": "2024-01-01",
  "overall_status": "ok",
  "risk_count": 0,
  "explanation": "This week's economic indicators show typical patterns..."
}
```

**Response (Paid):**
```json
{
  "week_start": "2024-01-01",
  "overall_status": "ok",
  "risk_count": 0,
  "explanation": "...",
  "indicators": [
    {
      "type": "gas",
      "value": 3.45,
      "previous_value": 3.40,
      "change_percent": 1.47,
      "status": "ok"
    },
    ...
  ]
}
```

### POST /api/cron

Manually trigger a weekly data update. In production, protect this endpoint with authentication.

## Database

The app uses SQLite to store:
- **indicators**: Weekly data for each economic indicator
- **weekly_signals**: Computed weekly signals with explanations

Database file location: `./data/cost-signal.db` (configurable via `DATABASE_PATH`)

## LLM Usage

The LLM (OpenAI) is used **only** for generating explanations. It:
- Never decides the signal (that's rule-based)
- Follows strict tone rules (calm, neutral, no advice)
- Generates 1-2 sentence explanations

If OpenAI API is unavailable, the app falls back to template-based explanations.

## Deployment

### Vercel

1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Configure cron job in `vercel.json` (optional)

### Other Platforms

- Ensure Node.js 18+ is available
- Set up weekly cron job or scheduled task
- Configure environment variables
- Run `npm run build` and `npm start`

## Important Notes

- This app intentionally does **NOT** include:
  - Charts or graphs
  - Forecasts or predictions
  - Financial planning features
  - Spending/saving recommendations
- The signal is **deterministic** and **explainable**
- Data is fetched from **official U.S. government sources only**
- Updates occur **once per week**

## License

MIT

