import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function TermsPage() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 md:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 md:mb-12">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 text-gray-900 dark:text-white">
              Terms of Service
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6 md:p-10 lg:p-12 space-y-8 md:space-y-10">
              <section className="pb-6 md:pb-8 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                <h2 className="text-xl md:text-2xl font-semibold mb-3 text-gray-900 dark:text-gray-100 mb-4">
                  Legal Business Name
                </h2>
                <p className="text-gray-600 dark:text-gray-300 leading-7 text-base md:text-lg">
                  These Terms of Service are provided by <strong className="text-gray-900 dark:text-gray-100">Cost Signal</strong> ("Cost Signal", "we", "us", or "our").
                </p>
              </section>

              <section className="pb-6 md:pb-8 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                <h2 className="text-xl md:text-2xl font-semibold mb-3 text-gray-900 dark:text-gray-100 mb-4">
                  1. Acceptance of Terms
                </h2>
                <p className="text-gray-600 dark:text-gray-300 leading-7 text-base md:text-lg">
                  By accessing and using Cost Signal, you accept and agree to be bound by the terms and provision of this agreement.
                </p>
              </section>

              <section className="pb-6 md:pb-8 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                <h2 className="text-xl md:text-2xl font-semibold mb-3 text-gray-900 dark:text-gray-100 mb-4">
                  2. Service Description
                </h2>
                <p className="text-gray-600 dark:text-gray-300 leading-7 text-base md:text-lg">
                  Cost Signal ("Cost Signal", "we", "us", or "our") provides weekly economic signals for U.S. consumers. The service is informational only and does not constitute financial advice.
                </p>
              </section>

              <section className="pb-6 md:pb-8 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                <h2 className="text-xl md:text-2xl font-semibold mb-3 text-gray-900 dark:text-gray-100 mb-4">
                  3. No Financial Advice
                </h2>
                <p className="text-gray-600 dark:text-gray-300 leading-7 text-base md:text-lg">
                  Cost Signal is not a financial advisor. The information provided is for informational purposes only and should not be considered as financial, investment, or legal advice.
                </p>
              </section>

              <section className="pb-6 md:pb-8 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                <h2 className="text-xl md:text-2xl font-semibold mb-3 text-gray-900 dark:text-gray-100 mb-4">
                  4. Subscription and Payment
                </h2>
                <p className="text-gray-600 dark:text-gray-300 leading-7 text-base md:text-lg">
                  Paid subscriptions are managed through Paddle. By subscribing, you agree to the payment terms and billing cycle of your chosen plan.
                </p>
              </section>

              <section className="pb-6 md:pb-8 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                <h2 className="text-xl md:text-2xl font-semibold mb-3 text-gray-900 dark:text-gray-100 mb-4">
                  5. Refund Policy
                </h2>
                <p className="text-gray-600 dark:text-gray-300 leading-7 text-base md:text-lg">
                  Refunds are handled on a case-by-case basis. Please contact support for refund requests. For more details, please see our{' '}
                  <a href="/refund" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                    Refund Policy
                  </a>.
                </p>
              </section>

              <section className="pb-6 md:pb-8 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                <h2 className="text-xl md:text-2xl font-semibold mb-3 text-gray-900 dark:text-gray-100 mb-4">
                  6. Limitation of Liability
                </h2>
                <p className="text-gray-600 dark:text-gray-300 leading-7 text-base md:text-lg">
                  Cost Signal shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the service.
                </p>
              </section>

              <section className="pb-6 md:pb-8 last:border-b-0">
                <h2 className="text-xl md:text-2xl font-semibold mb-3 text-gray-900 dark:text-gray-100 mb-4">
                  7. Changes to Terms
                </h2>
                <p className="text-gray-600 dark:text-gray-300 leading-7 text-base md:text-lg">
                  We reserve the right to modify these terms at any time. Continued use of the service after changes constitutes acceptance of the new terms.
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
