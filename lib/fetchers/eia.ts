/**
 * EIA (Energy Information Administration) API fetcher for gas prices
 * API docs: https://www.eia.gov/opendata/
 */

import { retryWithBackoff } from '../retry';

const EIA_API_KEY = process.env.EIA_API_KEY;
const EIA_BASE_URL = 'https://api.eia.gov/v2';

export interface GasPriceData {
  value: number; // Price per gallon in USD
  date: string; // ISO date string
}

/**
 * Fetch latest U.S. regular gasoline retail price
 * Using EIA API v2 - Weekly U.S. All Grades All Formulations Retail Gasoline Prices
 * Series: PET.EMM_EPM0_PTE_NUS_DPG.W
 */
export async function fetchGasPrice(): Promise<GasPriceData | null> {
  if (!EIA_API_KEY) {
    console.error('EIA_API_KEY not configured');
    return null;
  }

  try {
    // EIA API v2 endpoint for weekly gas prices
    const url = `${EIA_BASE_URL}/petroleum/pri/gnd/data/?api_key=${EIA_API_KEY}&frequency=weekly&data[0]=value&sort[0][column]=period&sort[0][direction]=desc&length=1`;
    
    // Retry with exponential backoff for reliability
    const response = await retryWithBackoff(async () => {
      const res = await fetch(url, {
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (!res.ok) {
        throw new Error(`EIA API error: ${res.status} ${res.statusText}`);
      }
      
      return res;
    });

    const data = await response.json();
    
    // Handle EIA API v2 response structure
    if (data.response?.data && Array.isArray(data.response.data) && data.response.data.length > 0) {
      const latest = data.response.data[0];
      const value = parseFloat(latest.value);
      
      if (isNaN(value)) {
        console.error('Invalid gas price value:', latest.value);
        return null;
      }
      
      return {
        value,
        date: latest.period || latest.date || new Date().toISOString().split('T')[0],
      };
    }

    console.warn('No gas price data found in EIA response');
    return null;
  } catch (error) {
    console.error('Error fetching gas price from EIA:', error);
    return null;
  }
}

