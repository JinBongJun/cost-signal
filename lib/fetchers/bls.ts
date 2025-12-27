/**
 * BLS (Bureau of Labor Statistics) API fetcher for CPI
 * API docs: https://www.bls.gov/developers/api_signature_v2.htm
 * Note: BLS API requires POST requests and has rate limits
 */

const BLS_BASE_URL = 'https://api.bls.gov/publicAPI/v2/timeseries/data';

export interface CPIData {
  value: number; // CPI index value
  date: string; // YYYY-MM format
}

/**
 * Fetch latest CPI-U (Consumer Price Index for All Urban Consumers)
 * Series ID: CUUR0000SA0 (U.S. city average, all items)
 */
export async function fetchCPI(): Promise<CPIData | null> {
  try {
    // BLS API requires POST request
    const response = await fetch(BLS_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        seriesid: ['CUUR0000SA0'],
        startyear: new Date().getFullYear() - 1,
        endyear: new Date().getFullYear(),
        registrationkey: process.env.BLS_API_KEY || undefined, // Optional but recommended
      }),
    });

    if (!response.ok) {
      throw new Error(`BLS API error: ${response.status}`);
    }

    const data = await response.json();

    // Check for BLS API errors
    if (data.status === 'REQUEST_FAILED' || data.status === 'REQUEST_NOT_PROCESSED') {
      console.error('BLS API request failed:', data.message);
      return null;
    }

    if (data.Results?.series?.[0]?.data && Array.isArray(data.Results.series[0].data) && data.Results.series[0].data.length > 0) {
      // Get most recent data point (first in array after sorting)
      const latest = data.Results.series[0].data[0];
      const value = parseFloat(latest.value);
      
      if (isNaN(value)) {
        console.error('Invalid CPI value:', latest.value);
        return null;
      }
      
      // Convert period from "M01" format to "01"
      const month = latest.period.startsWith('M') ? latest.period.substring(1) : latest.period;
      return {
        value,
        date: `${latest.year}-${month.padStart(2, '0')}`,
      };
    }

    console.warn('No CPI data found in BLS response');
    return null;
  } catch (error) {
    console.error('Error fetching CPI from BLS:', error);
    return null;
  }
}

