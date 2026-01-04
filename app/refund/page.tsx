import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function RefundPage() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 md:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 md:mb-12">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 text-gray-900 dark:text-white">
              Refund Policy
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6 md:p-10 lg:p-12 space-y-8 md:space-y-10">
              <section className="pb-6 md:pb-8 border-b border-gray-100 dark:border-gray-700">
                <p className="text-gray-600 dark:text-gray-300 leading-7 text-base md:text-lg">
                  At Cost Signal, we want you to be satisfied with your subscription. This Refund Policy explains our refund process and your rights.
                </p>
              </section>

              <section className="pb-6 md:pb-8 border-b border-gray-100 dark:border-gray-700">
                <h2 className="text-xl md:text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                  1. Subscription Refunds
                </h2>
                <div className="space-y-3 text-gray-600 dark:text-gray-300 leading-7">
                  <p className="text-base md:text-lg">
                    If you are not satisfied with your subscription, you may request a refund within <strong className="text-gray-900 dark:text-gray-100">30 days</strong> of your purchase date. Refunds will be processed within 5-10 business days.
                  </p>
                </div>
              </section>

              <section className="pb-6 md:pb-8 border-b border-gray-100 dark:border-gray-700">
                <h2 className="text-xl md:text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                  2. How to Request a Refund
                </h2>
                <div className="space-y-3 text-gray-600 dark:text-gray-300 leading-7">
                  <p className="text-base md:text-lg">To request a refund, please:</p>
                  <ol className="list-decimal list-outside space-y-2 ml-5">
                    <li>Go to your Account Settings</li>
                    <li>Navigate to the Subscription section</li>
                    <li>Click "Contact Support" or use the Feedback page</li>
                    <li>Include your reason for the refund request</li>
                  </ol>
                  <p className="text-base md:text-lg mt-4">
                    Alternatively, you can cancel your subscription at any time through your account settings. Cancellations take effect at the end of your current billing period.
                  </p>
                </div>
              </section>

              <section className="pb-6 md:pb-8 border-b border-gray-100 dark:border-gray-700">
                <h2 className="text-xl md:text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                  3. Processing Time
                </h2>
                <p className="text-gray-600 dark:text-gray-300 leading-7 text-base md:text-lg">
                  Refunds are processed through Paddle, our payment processor. Refunds typically appear in your account within 5-10 business days, depending on your payment method and financial institution.
                </p>
              </section>

              <section className="pb-6 md:pb-8 border-b border-gray-100 dark:border-gray-700">
                <h2 className="text-xl md:text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                  4. Cancellation vs. Refund
                </h2>
                <div className="space-y-3 text-gray-600 dark:text-gray-300 leading-7">
                  <p className="text-base md:text-lg">
                    <strong className="text-gray-900 dark:text-gray-100">Cancellation:</strong> You can cancel your subscription at any time. Cancellation stops future charges but does not refund past payments. You will continue to have access until the end of your current billing period.
                  </p>
                  <p className="text-base md:text-lg">
                    <strong className="text-gray-900 dark:text-gray-100">Refund:</strong> A refund returns money for a past payment. You may request a refund within 30 days of your purchase date.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-xl md:text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                  5. Contact Us
                </h2>
                <p className="text-gray-600 dark:text-gray-300 leading-7 text-base md:text-lg">
                  If you have questions about our refund policy or need to request a refund, please contact us through your account settings or use the Feedback page. We aim to respond to all refund requests within 48 hours.
                </p>
              </section>

              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-6">
                  This refund policy is part of our{' '}
                  <a href="/terms" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                    Terms of Service
                  </a>. By using Cost Signal, you agree to this refund policy.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
