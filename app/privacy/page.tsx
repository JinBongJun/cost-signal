import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 md:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 md:mb-12">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 text-gray-900 dark:text-white">
              Privacy Policy
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6 md:p-10 lg:p-12 space-y-8 md:space-y-10">
              <section className="pb-6 md:pb-8 border-b border-gray-100 dark:border-gray-700">
                <p className="text-gray-600 dark:text-gray-300 leading-7 text-base md:text-lg">
                  Cost Signal ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our service.
                </p>
              </section>

              <section className="pb-6 md:pb-8 border-b border-gray-100 dark:border-gray-700">
                <h2 className="text-xl md:text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                  1. Information We Collect
                </h2>
                <div className="space-y-4 text-gray-600 dark:text-gray-300">
                  <div>
                    <h3 className="font-semibold mb-2 text-gray-900 dark:text-gray-100 text-lg">Account Information</h3>
                    <ul className="list-disc list-outside space-y-2 ml-5 leading-7">
                      <li>Email address (required for account creation)</li>
                      <li>Name (optional)</li>
                      <li>Password (hashed and encrypted)</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2 text-gray-900 dark:text-gray-100 text-lg">Usage Data</h3>
                    <ul className="list-disc list-outside space-y-2 ml-5 leading-7">
                      <li>Push notification subscription data (for weekly alerts)</li>
                      <li>Subscription status and payment information (processed by Paddle)</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2 text-gray-900 dark:text-gray-100 text-lg">Technical Data</h3>
                    <ul className="list-disc list-outside space-y-2 ml-5 leading-7">
                      <li>Error logs and performance data (via Sentry, anonymized)</li>
                      <li>Browser type and device information</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section className="pb-6 md:pb-8 border-b border-gray-100 dark:border-gray-700">
                <h2 className="text-xl md:text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                  2. How We Use Your Information
                </h2>
                <ul className="list-disc list-outside space-y-2 text-gray-600 dark:text-gray-300 ml-5 leading-7">
                  <li>To provide and maintain our service</li>
                  <li>To send you weekly economic signal notifications (if subscribed)</li>
                  <li>To process payments and manage subscriptions</li>
                  <li>To improve our service and fix technical issues</li>
                  <li>To communicate with you about your account</li>
                </ul>
              </section>

              <section className="pb-6 md:pb-8 border-b border-gray-100 dark:border-gray-700">
                <h2 className="text-xl md:text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                  3. Data Storage and Security
                </h2>
                <div className="space-y-3 text-gray-600 dark:text-gray-300 leading-7">
                  <p className="text-base md:text-lg">
                    Your data is stored securely using Supabase, a trusted cloud database service. We implement industry-standard security measures including:
                  </p>
                  <ul className="list-disc list-outside space-y-2 ml-5">
                    <li>Password encryption (bcrypt hashing)</li>
                    <li>Secure HTTPS connections</li>
                    <li>Regular security updates</li>
                    <li>Access controls and authentication</li>
                  </ul>
                </div>
              </section>

              <section className="pb-6 md:pb-8 border-b border-gray-100 dark:border-gray-700">
                <h2 className="text-xl md:text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                  4. Third-Party Services
                </h2>
                <div className="space-y-4 text-gray-600 dark:text-gray-300">
                  <div>
                    <h3 className="font-semibold mb-2 text-gray-900 dark:text-gray-100 text-lg">Paddle</h3>
                    <p className="leading-7 text-base md:text-lg">We use Paddle for payment processing. Paddle handles all payment data according to their privacy policy. We do not store credit card information.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2 text-gray-900 dark:text-gray-100 text-lg">Sentry</h3>
                    <p className="leading-7 text-base md:text-lg">We use Sentry for error tracking and performance monitoring. Data is anonymized and used only for technical improvements.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2 text-gray-900 dark:text-gray-100 text-lg">Google OAuth</h3>
                    <p className="leading-7 text-base md:text-lg">If you sign in with Google, Google handles authentication according to their privacy policy. We only receive your email and name.</p>
                  </div>
                </div>
              </section>

              <section className="pb-6 md:pb-8 border-b border-gray-100 dark:border-gray-700">
                <h2 className="text-xl md:text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                  5. Your Rights
                </h2>
                <ul className="list-disc list-outside space-y-2 text-gray-600 dark:text-gray-300 ml-5 leading-7">
                  <li><strong className="text-gray-900 dark:text-gray-100">Access:</strong> You can view your account information at any time</li>
                  <li><strong className="text-gray-900 dark:text-gray-100">Update:</strong> You can update your profile information in account settings</li>
                  <li><strong className="text-gray-900 dark:text-gray-100">Delete:</strong> You can delete your account at any time (contact support)</li>
                  <li><strong className="text-gray-900 dark:text-gray-100">Unsubscribe:</strong> You can disable push notifications at any time</li>
                  <li><strong className="text-gray-900 dark:text-gray-100">Cancel:</strong> You can cancel your subscription at any time</li>
                </ul>
              </section>

              <section className="pb-6 md:pb-8 border-b border-gray-100 dark:border-gray-700">
                <h2 className="text-xl md:text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                  6. Cookies and Tracking
                </h2>
                <p className="text-gray-600 dark:text-gray-300 leading-7 text-base md:text-lg">
                  We use session cookies for authentication only. We do not use tracking cookies or third-party analytics. We do not sell your data to advertisers.
                </p>
              </section>

              <section className="pb-6 md:pb-8 border-b border-gray-100 dark:border-gray-700">
                <h2 className="text-xl md:text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                  7. Children's Privacy
                </h2>
                <p className="text-gray-600 dark:text-gray-300 leading-7 text-base md:text-lg">
                  Our service is not intended for children under 13. We do not knowingly collect information from children.
                </p>
              </section>

              <section className="pb-6 md:pb-8 border-b border-gray-100 dark:border-gray-700">
                <h2 className="text-xl md:text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                  8. Changes to This Policy
                </h2>
                <p className="text-gray-600 dark:text-gray-300 leading-7 text-base md:text-lg">
                  We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.
                </p>
              </section>

              <section>
                <h2 className="text-xl md:text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                  9. Contact Us
                </h2>
                <p className="text-gray-600 dark:text-gray-300 leading-7 text-base md:text-lg">
                  If you have questions about this Privacy Policy, please contact us through your account settings or email support.
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
