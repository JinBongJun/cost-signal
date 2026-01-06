'use client';

import { useState, useEffect } from 'react';
import { Card } from './Card';
import { Button } from './Button';
import { useToast } from './Toast';

interface SpendingPatternFormProps {
  onSave?: () => void; // Callback when pattern is saved
  compact?: boolean; // Compact mode for inline display
}

export function SpendingPatternForm({ onSave, compact = false }: SpendingPatternFormProps) {
  const [pattern, setPattern] = useState<{
    gas_frequency?: 'daily' | 'weekly' | 'biweekly' | 'monthly' | null;
    monthly_rent?: number | null;
    food_ratio?: 'low' | 'medium' | 'high' | null;
    transport_mode?: 'car' | 'public' | 'mixed' | null;
    has_debt?: boolean | null;
  }>({
    gas_frequency: null,
    monthly_rent: null,
    food_ratio: null,
    transport_mode: null,
    has_debt: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    fetchSpendingPattern();
  }, []);

  async function fetchSpendingPattern() {
    try {
      const response = await fetch('/api/account/spending-pattern');
      if (response.ok) {
        const data = await response.json();
        if (data.pattern) {
          setPattern({
            gas_frequency: data.pattern.gas_frequency || null,
            monthly_rent: data.pattern.monthly_rent || null,
            food_ratio: data.pattern.food_ratio || null,
            transport_mode: data.pattern.transport_mode || null,
            has_debt: data.pattern.has_debt || false,
          });
        }
      }
    } catch (error) {
      console.error('Error fetching spending pattern:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const response = await fetch('/api/account/spending-pattern', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pattern),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        const errorMessage = data.details || data.error || `Server error (${response.status})`;
        console.error('Save failed:', {
          status: response.status,
          error: data,
        });
        throw new Error(errorMessage);
      }

      toast.success('Spending pattern saved! Loading your personalized analysis...');
      if (onSave) {
        // Call onSave callback which will refresh the signal
        await onSave();
      }
    } catch (error) {
      console.error('Error saving spending pattern:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save spending pattern';
      toast.error(errorMessage);
      // Show more details in console for debugging
      if (error instanceof Error && error.message.includes('Code:')) {
        console.error('Supabase error code detected. Check if table exists and RLS policies are set correctly.');
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <Card className={compact ? '' : 'mb-6'}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-48 bg-gray-300 dark:bg-gray-700 rounded"></div>
          <div className="h-32 bg-gray-300 dark:bg-gray-700 rounded"></div>
        </div>
      </Card>
    );
  }

  const content = (
    <div className="space-y-6">
      {!compact && (
        <div>
          <h3 className="text-xl md:text-2xl font-semibold mb-2 text-gray-900 dark:text-gray-100 tracking-tight">
            Personalize Your Cost Impact Analysis
          </h3>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
            Tell us about your spending habits to see how economic indicators affect your weekly expenses.
          </p>
        </div>
      )}

      {/* Gas Frequency */}
      <div>
        <label className="block text-base md:text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">
          How often do you fill up gas?
        </label>
        <select
          value={pattern.gas_frequency || ''}
          onChange={(e) => setPattern({
            ...pattern,
            gas_frequency: e.target.value as 'daily' | 'weekly' | 'biweekly' | 'monthly' | null || null,
          })}
              className="w-full px-4 py-3 md:px-5 md:py-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 min-h-[52px] text-base"
        >
          <option value="">Select frequency</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="biweekly">Bi-weekly</option>
          <option value="monthly">Monthly</option>
        </select>
      </div>

      {/* Monthly Rent */}
      <div>
        <label className="block text-base md:text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">
          Monthly Rent/Mortgage (optional)
        </label>
        <input
          type="number"
          value={pattern.monthly_rent || ''}
          onChange={(e) => setPattern({
            ...pattern,
            monthly_rent: e.target.value ? parseFloat(e.target.value) : null,
          })}
          placeholder="e.g., 1500"
          min="0"
          step="0.01"
              className="w-full px-4 py-3 md:px-5 md:py-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 min-h-[52px] text-base"
        />
      </div>

      {/* Food Ratio */}
      <div>
        <label className="block text-base md:text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">
          Eating out vs. groceries ratio
        </label>
        <select
          value={pattern.food_ratio || ''}
          onChange={(e) => setPattern({
            ...pattern,
            food_ratio: e.target.value as 'low' | 'medium' | 'high' | null || null,
          })}
              className="w-full px-4 py-3 md:px-5 md:py-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 min-h-[52px] text-base"
        >
          <option value="">Select ratio</option>
          <option value="low">Mostly groceries (low eating out)</option>
          <option value="medium">Mixed (some eating out)</option>
          <option value="high">Mostly eating out (high)</option>
        </select>
      </div>

      {/* Transport Mode */}
      <div>
        <label className="block text-base md:text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">
          Primary transportation
        </label>
        <select
          value={pattern.transport_mode || ''}
          onChange={(e) => setPattern({
            ...pattern,
            transport_mode: e.target.value as 'car' | 'public' | 'mixed' | null || null,
          })}
              className="w-full px-4 py-3 md:px-5 md:py-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 min-h-[52px] text-base"
        >
          <option value="">Select mode</option>
          <option value="car">Car (own vehicle)</option>
          <option value="public">Public transportation</option>
          <option value="mixed">Mixed (both)</option>
        </select>
      </div>

      {/* Has Debt */}
      <div>
        <label className="flex items-center gap-4 cursor-pointer">
          <input
            type="checkbox"
            checked={pattern.has_debt || false}
            onChange={(e) => setPattern({
              ...pattern,
              has_debt: e.target.checked,
            })}
            className="w-6 h-6 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-base md:text-lg font-medium text-gray-700 dark:text-gray-300">
            I have loans or credit card debt (interest rate changes affect me)
          </span>
        </label>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-6 border-t border-gray-200 dark:border-gray-800">
        <Button
          onClick={handleSave}
          disabled={saving}
          isLoading={saving}
          variant="primary"
          size="md"
          className="min-h-[44px] flex-1"
        >
          Save & See My Impact
        </Button>
      </div>
    </div>
  );

  if (compact) {
    return content;
  }

  return (
    <Card className="mb-6">
      {content}
    </Card>
  );
}

