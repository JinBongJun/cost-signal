# Quick Setup Guide

## 1. Install Dependencies

```bash
npm install
```

## 2. Get API Keys

### Required:
- **OpenAI API Key**: https://platform.openai.com/api-keys
  - Used for generating calm, neutral explanations
  - Free tier works, but paid tier recommended for production

- **EIA API Key**: https://www.eia.gov/opendata/register.php
  - Used for gas price data
  - Free registration required

- **FRED API Key**: https://fred.stlouisfed.org/docs/api/api_key.html
  - Used for interest rates and unemployment data
  - Free registration required

### Optional:
- **BLS API Key**: https://www.bls.gov/developers/api_signature_v2.htm
  - Used for CPI data
  - Not required, but recommended to avoid rate limits

## 3. Configure Environment

Create a `.env` file in the root directory:

```env
OPENAI_API_KEY=sk-...
EIA_API_KEY=your_eia_key
FRED_API_KEY=your_fred_key
BLS_API_KEY=your_bls_key  # Optional
DATABASE_PATH=./data/cost-signal.db
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 4. Run Initial Data Fetch

Before running the app, fetch the first week of data:

```bash
npm run cron
```

This will:
- Fetch data from all APIs
- Calculate signals
- Store in the database
- Generate an explanation

## 5. Start Development Server

```bash
npm run dev
```

Visit http://localhost:3000

## 6. Set Up Weekly Updates

Choose one method:

### Option A: Manual (for testing)
```bash
npm run cron
```

### Option B: Cron Job (Linux/Mac)
```bash
# Edit crontab
crontab -e

# Add this line (runs every Monday at 9 AM UTC)
0 9 * * 1 cd /path/to/cost-signal && npm run cron
```

### Option C: Vercel Cron (if deployed on Vercel)
The `vercel.json` file is already configured. Just deploy to Vercel and the cron job will run automatically.

### Option D: External Scheduler
Call `POST /api/cron` weekly from your scheduler (e.g., GitHub Actions, external cron service).

## Troubleshooting

### Database Issues
- Ensure the `data/` directory is writable
- Check `DATABASE_PATH` in `.env`

### API Errors
- Verify all API keys are correct
- Check API rate limits (especially BLS)
- Some APIs may have delays in data availability

### No Signal Data
- Run `npm run cron` at least once
- Check that APIs returned data successfully
- Review console logs for errors

## Next Steps

1. Customize signal thresholds in `lib/signals.ts` if needed
2. Adjust explanation prompts in `lib/explainer.ts`
3. Add authentication for paid tier (currently just a query parameter)
4. Deploy to production (Vercel, Railway, etc.)

