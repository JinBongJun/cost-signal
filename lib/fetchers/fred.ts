/**
 * FRED (Federal Reserve Economic Data) API fetcher
 * API docs: https://fred.stlouisfed.org/docs/api/
 */

const FRED_API_KEY = process.env.FRED_API_KEY;
const FRED_BASE_URL = 'https://api.stlouisfed.org/fred';

export interface InterestRateData {
  value: number; // Interest rate percentage
  date: string; // ISO date string
}

export interface UnemploymentData {
  value: number; // Unemployment rate percentage
  date: string; // ISO date string
}

/**
 * Fetch latest Federal Funds Effective Rate
 * Series ID: FEDFUNDS
 */
export async function fetchInterestRate(): Promise<InterestRateData | null> {
  if (!FRED_API_KEY) {
    console.error('FRED_API_KEY not configured');
    return null;
  }

  try {
    const url = `${FRED_BASE_URL}/series/observations?series_id=FEDFUNDS&api_key=${FRED_API_KEY}&file_type=json&sort_order=desc&limit=1`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`FRED API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.observations && data.observations.length > 0) {
      const latest = data.observations[0];
      // Skip if value is "." (missing data)
      if (latest.value !== '.') {
        return {
          value: parseFloat(latest.value),
          date: latest.date,
        };
      }
    }

    return null;
  } catch (error) {
    console.error('Error fetching interest rate from FRED:', error);
    return null;
  }
}

/**
 * Fetch latest U.S. Unemployment Rate
 * Series ID: UNRATE
 */
export async function fetchUnemploymentRate(): Promise<UnemploymentData | null> {
  if (!FRED_API_KEY) {
    console.error('FRED_API_KEY not configured');
    return null;
  }

  try {
    const url = `${FRED_BASE_URL}/series/observations?series_id=UNRATE&api_key=${FRED_API_KEY}&file_type=json&sort_order=desc&limit=1`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`FRED API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.observations && data.observations.length > 0) {
      const latest = data.observations[0];
      if (latest.value !== '.') {
        return {
          value: parseFloat(latest.value),
          date: latest.date,
        };
      }
    }

    return null;
  } catch (error) {
    console.error('Error fetching unemployment rate from FRED:', error);
    return null;
  }
}

