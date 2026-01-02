import { Header } from '@/components/Header';

export default function TermsPage() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-gray-900 dark:text-white">
          Terms of Service
        </h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
              1. Acceptance of Terms
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              By accessing and using Cost Signal, you accept and agree to be bound by the terms and provision of this agreement.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
              2. Service Description
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Cost Signal provides weekly economic signals for U.S. consumers. The service is informational only and does not constitute financial advice.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
              3. No Financial Advice
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Cost Signal is not a financial advisor. The information provided is for informational purposes only and should not be considered as financial, investment, or legal advice.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
              4. Subscription and Payment
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Paid subscriptions are managed through Paddle. By subscribing, you agree to the payment terms and billing cycle of your chosen plan.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
              5. Refund Policy
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Refunds are handled on a case-by-case basis. Please contact support for refund requests.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
              6. Limitation of Liability
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Cost Signal shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
              7. Changes to Terms
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              We reserve the right to modify these terms at any time. Continued use of the service after changes constitutes acceptance of the new terms.
            </p>
          </section>

          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}






