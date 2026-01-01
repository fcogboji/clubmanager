import Link from "next/link";
import { Users } from "lucide-react";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-xl text-gray-900">Club Manager</span>
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              <Link href="/industries" className="text-gray-600 hover:text-gray-900 font-medium">
                Industries
              </Link>
              <Link href="/industries#pricing" className="text-gray-600 hover:text-gray-900 font-medium">
                Pricing
              </Link>
              <Link href="/industries#features" className="text-gray-600 hover:text-gray-900 font-medium">
                Features
              </Link>
            </nav>

            <div className="flex items-center gap-4">
              <Link
                href="/sign-in"
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="gradient-primary text-white px-5 py-2.5 rounded-xl font-semibold hover:opacity-90 transition-opacity"
              >
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      {children}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-5 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <span className="font-bold text-xl">Club Manager</span>
              </div>
              <p className="text-gray-400">
                The all-in-one platform for managing members, classes, and payments.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Industries</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/industries/sports" className="hover:text-white">Sports Clubs</Link></li>
                <li><Link href="/industries/dance" className="hover:text-white">Dance Schools</Link></li>
                <li><Link href="/industries/martial-arts" className="hover:text-white">Martial Arts</Link></li>
                <li><Link href="/industries/music" className="hover:text-white">Music Schools</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/industries#features" className="hover:text-white">Features</Link></li>
                <li><Link href="/industries#pricing" className="hover:text-white">Pricing</Link></li>
                <li><Link href="/sign-up" className="hover:text-white">Get Started</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/terms" className="hover:text-white">Terms of Service</Link></li>
                <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Get Started</h4>
              <p className="text-gray-400 mb-4">
                Join hundreds of clubs already using Club Manager.
              </p>
              <Link
                href="/sign-up"
                className="inline-block bg-white text-gray-900 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
              >
                Start Free Trial
              </Link>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-500">
            <p>&copy; {new Date().getFullYear()} Club Manager. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
