'use client';

import { Button } from './Button';
import { Card } from './Card';

interface CancelSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
  periodEndDate: string;
}

export function CancelSubscriptionModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  periodEndDate,
}: CancelSubscriptionModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <Card className="max-w-md w-full">
        <h2 className="text-xl font-semibold mb-4">Cancel Subscription</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Are you sure you want to cancel your subscription? You will continue to have access to all features until{' '}
          <span className="font-semibold text-gray-900 dark:text-gray-100">{periodEndDate}</span>.
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          After this date, you'll lose access to paid features. You can reactivate your subscription anytime before then.
        </p>
        <div className="flex gap-3 justify-end">
          <Button
            onClick={onClose}
            disabled={isLoading}
            variant="secondary"
            size="md"
            className="min-h-[44px]"
          >
            Keep Subscription
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            variant="danger"
            size="md"
            isLoading={isLoading}
            className="min-h-[44px]"
          >
            Cancel Subscription
          </Button>
        </div>
      </Card>
    </div>
  );
}

