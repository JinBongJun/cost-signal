import { Header } from '@/components/Header';

export default function RefundPage() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-gray-900 dark:text-white">
            Refund Policy
          </h1>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 space-y-6">
            <section>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                <strong>Last updated:</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                At Cost Signal, we want you to be satisfied with your subscription. This Refund Policy explains our refund process and your rights.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
                1. Subscription Refunds
              </h2>
              <div className="space-y-3 text-gray-600 dark:text-gray-400">
                <p>
                  We offer refunds on a case-by-case basis. If you are not satisfied with your subscription, please contact us within 30 days of your purchase to request a refund.
                </p>
                <p>
                  Refund requests are reviewed individually, and we will work with you to resolve any issues. Approved refunds will be processed within 5-10 business days.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
                2. How to Request a Refund
              </h2>
              <div className="space-y-3 text-gray-600 dark:text-gray-400">
                <p>To request a refund, please:</p>
                <ol className="list-decimal list-inside space-y-2 ml-4">
                  <li>Go to your Account Settings</li>
                  <li>Navigate to the Subscription section</li>
                  <li>Click "Contact Support" or use the Feedback page</li>
                  <li>Include your reason for the refund request</li>
                </ol>
                <p>
                  Alternatively, you can cancel your subscription at any time through your account settings. Cancellations take effect at the end of your current billing period.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
                3. Processing Time
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Refunds are processed through Paddle, our payment processor. Once approved, refunds typically appear in your account within 5-10 business days, depending on your payment method and financial institution.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
                4. Cancellation vs. Refund
              </h2>
              <div className="space-y-3 text-gray-600 dark:text-gray-400">
                <p>
                  <strong>Cancellation:</strong> You can cancel your subscription at any time. Cancellation stops future charges but does not refund past payments. You will continue to have access until the end of your current billing period.
                </p>
                <p>
                  <strong>Refund:</strong> A refund returns money for a past payment. Refunds are evaluated on a case-by-case basis and are not guaranteed.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
                5. Non-Refundable Items
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Refunds are generally not available for:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400 ml-4 mt-2">
                <li>Subscriptions that have been active for more than 30 days</li>
                <li>Subscriptions that have been cancelled and then reactivated</li>
                <li>Cases where the service was used in violation of our Terms of Service</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
                6. Contact Us
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                If you have questions about our refund policy or need to request a refund, please contact us through your account settings or use the Feedback page. We aim to respond to all refund requests within 48 hours.
              </p>
            </section>

            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                This refund policy is part of our Terms of Service. By using Cost Signal, you agree to this refund policy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

