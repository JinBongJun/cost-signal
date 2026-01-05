import OpenAI from 'openai';
import { IndicatorData, WeeklySignal } from './db';
import { SpendingPattern } from './types';
import { WeeklyImpact } from './impact-calculator';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate a calm, neutral explanation for the weekly signal
 * Rules:
 * - 1-2 sentences max
 * - Calm, neutral tone
 * - No encouragement or alarmism
 * - No advice
 * - Only explains what the signal means, not what to do
 * 
 * Cost optimization: Uses caching and fallback to minimize OpenAI API calls
 */
export async function generateExplanation(
  signal: WeeklySignal,
  indicators: IndicatorData[]
): Promise<string> {
  // Cost optimization: Check if explanation already exists (caching)
  if (signal.explanation) {
    return signal.explanation;
  }

  // Cost optimization: Use template if OpenAI is disabled or unavailable
  const useOpenAI = process.env.ENABLE_OPENAI !== 'false' && process.env.OPENAI_API_KEY;
  
  if (!useOpenAI) {
    // Fallback explanation if OpenAI is disabled or no API key
    return generateFallbackExplanation(signal, indicators);
  }

  try {
    const riskIndicators = indicators.filter(ind => ind.status === 'risk');
    const riskNames = riskIndicators.map(ind => {
      switch (ind.indicator_type) {
        case 'gas': return 'gas prices';
        case 'cpi': return 'inflation';
        case 'interest_rate': return 'interest rates';
        case 'unemployment': return 'unemployment';
      }
    });

    const prompt = `You are explaining a weekly economic signal to U.S. consumers. 

The signal this week is: ${signal.overall_status.toUpperCase()} (${signal.risk_count} risk indicator${signal.risk_count !== 1 ? 's' : ''}).

${riskIndicators.length > 0 ? `Risk indicators: ${riskNames.join(', ')}.` : 'No indicators show unusual cost pressure.'}

Write a calm, neutral explanation in 1-2 sentences. Rules:
- Be factual and calm
- Do NOT give advice (no "good time to spend" or "time to save")
- Do NOT be alarmist
- Simply state what the signal means in plain language
- Focus on whether there's unusual cost pressure this week

Example good explanation: "This week's economic indicators show typical patterns with no unusual cost pressures affecting everyday expenses."

Example bad explanation: "This is a good time to spend money!" or "Economic crisis ahead!"

Your explanation:`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a neutral economic signal explainer. You provide calm, factual explanations without advice or alarmism.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 100,
      temperature: 0.3, // Lower temperature for more consistent, neutral output
    });

    const explanation = response.choices[0]?.message?.content?.trim();
    if (explanation) {
      return explanation;
    }
  } catch (error) {
    console.error('Error generating explanation with OpenAI:', error);
  }

  return generateFallbackExplanation(signal, indicators);
}

/**
 * Generate a personalized explanation for paid tier users
 * Includes user's spending pattern and impact analysis
 */
export async function generatePersonalizedExplanation(
  signal: WeeklySignal,
  indicators: IndicatorData[],
  spendingPattern: SpendingPattern | null,
  impactAnalysis: WeeklyImpact | null
): Promise<string> {
  // Cost optimization: Use template if OpenAI is disabled or unavailable
  const useOpenAI = process.env.ENABLE_OPENAI !== 'false' && process.env.OPENAI_API_KEY;
  
  if (!useOpenAI || !spendingPattern || !impactAnalysis) {
    // Fallback to regular explanation if no spending pattern or OpenAI unavailable
    return generateExplanation(signal, indicators);
  }

  try {
    const riskIndicators = indicators.filter(ind => ind.status === 'risk');
    const riskNames = riskIndicators.map(ind => {
      switch (ind.indicator_type) {
        case 'gas': return 'gas prices';
        case 'cpi': return 'inflation';
        case 'interest_rate': return 'interest rates';
        case 'unemployment': return 'unemployment';
      }
    });

    // Build spending pattern context
    const patternContext = [];
    if (spendingPattern.gas_frequency) {
      patternContext.push(`Gas fill-ups: ${spendingPattern.gas_frequency}`);
    }
    if (spendingPattern.transport_mode) {
      patternContext.push(`Transport: ${spendingPattern.transport_mode}`);
    }
    if (spendingPattern.food_ratio) {
      patternContext.push(`Food: ${spendingPattern.food_ratio} eating out`);
    }
    if (spendingPattern.has_debt) {
      patternContext.push('Has debt/loans');
    }

    // Build impact context
    const highImpactIndicators = impactAnalysis.breakdown
      .filter(item => item.level === 'HIGH')
      .map(item => {
        switch (item.indicator) {
          case 'gas': return 'gas prices';
          case 'cpi': return 'inflation';
          case 'interest_rate': return 'interest rates';
          default: return item.indicator;
        }
      });

    const prompt = `You are explaining a weekly economic signal to a U.S. consumer with personalized context.

The signal this week is: ${signal.overall_status.toUpperCase()} (${signal.risk_count} risk indicator${signal.risk_count !== 1 ? 's' : ''}).

${riskIndicators.length > 0 ? `Risk indicators: ${riskNames.join(', ')}.` : 'No indicators show unusual cost pressure.'}

User's spending pattern: ${patternContext.length > 0 ? patternContext.join(', ') : 'Not specified'}

Expected weekly cost impact: ${impactAnalysis.totalWeeklyChange >= 0 ? '+' : ''}$${impactAnalysis.totalWeeklyChange.toFixed(2)} per week
${highImpactIndicators.length > 0 ? `Highest impact from: ${highImpactIndicators.join(', ')}.` : ''}

Write a personalized, calm explanation in 2-3 sentences. Rules:
- Be factual and calm
- Reference the user's specific spending pattern when relevant
- Mention the expected weekly impact amount
- Do NOT give advice (no "good time to spend" or "time to save")
- Do NOT be alarmist
- Focus on what this means for their specific situation

Example good explanation: "This week's economic indicators suggest a ${impactAnalysis.totalWeeklyChange >= 0 ? 'moderate increase' : 'slight decrease'} in your weekly expenses, estimated at ${impactAnalysis.totalWeeklyChange >= 0 ? '+' : ''}$${Math.abs(impactAnalysis.totalWeeklyChange).toFixed(2)}. ${highImpactIndicators.length > 0 ? `The primary driver is ${highImpactIndicators[0]}, which affects your ${spendingPattern.gas_frequency === 'weekly' ? 'weekly gas fill-ups' : spendingPattern.transport_mode === 'car' ? 'car-based transportation' : 'spending pattern'}.` : 'Most indicators remain stable.'}"

Your explanation:`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a neutral economic signal explainer. You provide calm, factual, personalized explanations without advice or alarmism.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 150,
      temperature: 0.3,
    });

    const explanation = response.choices[0]?.message?.content?.trim();
    if (explanation) {
      return explanation;
    }
  } catch (error) {
    console.error('Error generating personalized explanation with OpenAI:', error);
  }

  // Fallback to regular explanation
  return generateExplanation(signal, indicators);
}

function generateFallbackExplanation(signal: WeeklySignal, indicators: IndicatorData[]): string {
  const riskCount = signal.risk_count;

  if (riskCount === 0) {
    return 'This week\'s economic indicators show typical patterns with no unusual cost pressures affecting everyday expenses.';
  } else if (riskCount === 1) {
    return 'One economic indicator shows increased cost pressure this week, while others remain stable.';
  } else {
    return 'Multiple economic indicators show increased cost pressure this week, suggesting broader changes in everyday expenses.';
  }
}

