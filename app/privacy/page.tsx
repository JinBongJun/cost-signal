export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-gray-900 dark:text-white">
          Privacy Policy
        </h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 space-y-6">
          <section>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
              <strong>Last updated:</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Cost Signal ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
              1. Information We Collect
            </h2>
            <div className="space-y-3 text-gray-600 dark:text-gray-400">
              <div>
                <h3 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">Account Information</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Email address (required for account creation)</li>
                  <li>Name (optional)</li>
                  <li>Password (hashed and encrypted)</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">Usage Data</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Push notification subscription data (for weekly alerts)</li>
                  <li>Subscription status and payment information (processed by Paddle)</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">Technical Data</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Error logs and performance data (via Sentry, anonymized)</li>
                  <li>Browser type and device information</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
              2. How We Use Your Information
            </h2>
            <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400 ml-4">
              <li>To provide and maintain our service</li>
              <li>To send you weekly economic signal notifications (if subscribed)</li>
              <li>To process payments and manage subscriptions</li>
              <li>To improve our service and fix technical issues</li>
              <li>To communicate with you about your account</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
              3. Data Storage and Security
            </h2>
            <div className="space-y-3 text-gray-600 dark:text-gray-400">
              <p>
                Your data is stored securely using Supabase, a trusted cloud database service. We implement industry-standard security measures including:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Password encryption (bcrypt hashing)</li>
                <li>Secure HTTPS connections</li>
                <li>Regular security updates</li>
                <li>Access controls and authentication</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
              4. Third-Party Services
            </h2>
            <div className="space-y-3 text-gray-600 dark:text-gray-400">
              <div>
                <h3 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">Paddle</h3>
                <p>We use Paddle for payment processing. Paddle handles all payment data according to their privacy policy. We do not store credit card information.</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">Sentry</h3>
                <p>We use Sentry for error tracking and performance monitoring. Data is anonymized and used only for technical improvements.</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">Google OAuth</h3>
                <p>If you sign in with Google, Google handles authentication according to their privacy policy. We only receive your email and name.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
              5. Your Rights
            </h2>
            <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400 ml-4">
              <li><strong>Access:</strong> You can view your account information at any time</li>
              <li><strong>Update:</strong> You can update your profile information in account settings</li>
              <li><strong>Delete:</strong> You can delete your account at any time (contact support)</li>
              <li><strong>Unsubscribe:</strong> You can disable push notifications at any time</li>
              <li><strong>Cancel:</strong> You can cancel your subscription at any time</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
              6. Cookies and Tracking
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              We use session cookies for authentication only. We do not use tracking cookies or third-party analytics. We do not sell your data to advertisers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
              7. Children's Privacy
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Our service is not intended for children under 13. We do not knowingly collect information from children.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
              8. Changes to This Policy
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
              9. Contact Us
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              If you have questions about this Privacy Policy, please contact us through your account settings or email support.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

