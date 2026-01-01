import Link from 'next/link';
import { Header } from '@/components/Header';
import { Button } from '@/components/Button';

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
        <div className="text-center max-w-md">
          <div className="mb-8">
            <h1 className="text-9xl font-bold text-gray-300 dark:text-gray-700 mb-4">404</h1>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Page Not Found
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              The page you're looking for doesn't exist or has been moved.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <Button variant="primary" size="lg">
                Go Home
              </Button>
            </Link>
            <Link href="/faq">
              <Button variant="secondary" size="lg">
                Visit FAQ
              </Button>
            </Link>
          </div>

          <div className="mt-12 text-sm text-gray-500 dark:text-gray-400">
            <p>Need help? Check out our <Link href="/faq" className="text-blue-600 dark:text-blue-400 hover:underline">FAQ</Link> or contact support.</p>
          </div>
        </div>
      </main>
    </>
  );
}



