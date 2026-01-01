import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | Club Manager",
  description: "Privacy Policy for Club Manager - how we collect, use, and protect your personal data.",
};

export default function PrivacyPage() {
  const lastUpdated = "1 January 2026";

  return (
    <div className="py-16 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-sm p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-gray-500 mb-8">Last updated: {lastUpdated}</p>

          <div className="prose prose-gray max-w-none">
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
              <p className="text-gray-600 mb-4">
                Club Manager (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your privacy and ensuring
                the security of your personal data. This Privacy Policy explains how we collect, use, disclose,
                and safeguard your information when you use our platform.
              </p>
              <p className="text-gray-600">
                We comply with the UK General Data Protection Regulation (UK GDPR), the Data Protection Act 2018,
                and other applicable data protection laws.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Data Controller and Processor</h2>
              <p className="text-gray-600 mb-4">
                <strong>For Club Administrators:</strong> When you create an account and manage your club through
                our platform, you act as the <strong>Data Controller</strong> for the member data you collect.
                Club Manager acts as a <strong>Data Processor</strong> on your behalf.
              </p>
              <p className="text-gray-600 mb-4">
                <strong>For Platform Data:</strong> Club Manager is the Data Controller for:
              </p>
              <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
                <li>Club administrator account information</li>
                <li>Platform usage data and analytics</li>
                <li>Payment and billing information related to platform fees</li>
              </ul>
              <p className="text-gray-600">
                <strong>For Parents/Members:</strong> The Club you are associated with is the Data Controller
                for your personal data. Please refer to your Club&apos;s privacy policy for information about how
                they handle your data.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Information We Collect</h2>

              <h3 className="text-lg font-medium text-gray-900 mb-3">3.1 Information Provided by Club Administrators</h3>
              <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
                <li>Name, email address, and contact information</li>
                <li>Club details (name, address, phone, website)</li>
                <li>Club logo and branding</li>
                <li>Stripe Connect account information for payment processing</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-900 mb-3">3.2 Member Information (Collected by Clubs)</h3>
              <p className="text-gray-600 mb-2">Clubs may collect and store the following member data through our platform:</p>
              <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
                <li>Member name, date of birth, and photograph</li>
                <li>Parent/guardian name, email, and phone number</li>
                <li>Emergency contact information</li>
                <li>Class enrolment and attendance records</li>
                <li>Membership plan and subscription status</li>
                <li>Payment history and invoice records</li>
                <li>Notes and additional information as determined by the Club</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-900 mb-3">3.3 Parent Portal Account Information</h3>
              <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
                <li>Email address and name</li>
                <li>Phone number (optional)</li>
                <li>Password (stored securely hashed)</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-900 mb-3">3.4 Automatically Collected Information</h3>
              <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
                <li>IP address and device information</li>
                <li>Browser type and version</li>
                <li>Pages visited and features used</li>
                <li>Date and time of access</li>
                <li>Cookies and similar technologies (see Cookie Policy below)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">4. How We Use Your Information</h2>
              <p className="text-gray-600 mb-4">We use the collected information for the following purposes:</p>

              <h3 className="text-lg font-medium text-gray-900 mb-3">4.1 Service Provision</h3>
              <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
                <li>Creating and managing user accounts</li>
                <li>Providing club management functionality</li>
                <li>Processing payments through Stripe</li>
                <li>Sending transactional emails (invitations, payment links, receipts)</li>
                <li>Enabling communication between clubs and members</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-900 mb-3">4.2 Service Improvement</h3>
              <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
                <li>Analysing usage patterns to improve our platform</li>
                <li>Developing new features and functionality</li>
                <li>Troubleshooting technical issues</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-900 mb-3">4.3 Legal and Security</h3>
              <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
                <li>Complying with legal obligations</li>
                <li>Protecting against fraudulent or illegal activity</li>
                <li>Enforcing our Terms of Service</li>
                <li>Maintaining audit logs for security purposes</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Legal Basis for Processing</h2>
              <p className="text-gray-600 mb-4">We process personal data under the following legal bases:</p>
              <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
                <li><strong>Contract:</strong> Processing necessary to perform our contract with you (providing the Service)</li>
                <li><strong>Legitimate Interests:</strong> Processing for our legitimate business interests, such as fraud prevention and service improvement</li>
                <li><strong>Legal Obligation:</strong> Processing required by applicable laws and regulations</li>
                <li><strong>Consent:</strong> Where you have given explicit consent for specific processing activities</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Data Sharing and Disclosure</h2>
              <p className="text-gray-600 mb-4">We may share your information with:</p>

              <h3 className="text-lg font-medium text-gray-900 mb-3">6.1 Service Providers</h3>
              <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
                <li><strong>Stripe:</strong> Payment processing (see <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Stripe Privacy Policy</a>)</li>
                <li><strong>Clerk:</strong> Authentication services (see <a href="https://clerk.com/legal/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Clerk Privacy Policy</a>)</li>
                <li><strong>Resend:</strong> Email delivery services (see <a href="https://resend.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Resend Privacy Policy</a>)</li>
                <li><strong>Neon:</strong> Database hosting (PostgreSQL)</li>
                <li><strong>Vercel:</strong> Application hosting</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-900 mb-3">6.2 Legal Requirements</h3>
              <p className="text-gray-600 mb-4">
                We may disclose information if required by law, court order, or government request, or if we believe
                disclosure is necessary to protect our rights, your safety, or the safety of others.
              </p>

              <h3 className="text-lg font-medium text-gray-900 mb-3">6.3 Business Transfers</h3>
              <p className="text-gray-600">
                In the event of a merger, acquisition, or sale of assets, your information may be transferred
                as part of that transaction. We will notify you of any such change.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Data Retention</h2>
              <p className="text-gray-600 mb-4">We retain personal data for as long as necessary to:</p>
              <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
                <li>Provide our services to you</li>
                <li>Comply with legal obligations</li>
                <li>Resolve disputes and enforce agreements</li>
              </ul>
              <p className="text-gray-600 mb-4">Specific retention periods:</p>
              <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
                <li><strong>Active accounts:</strong> Data retained while account is active</li>
                <li><strong>Deleted accounts:</strong> Data deleted within 30 days, except where legally required</li>
                <li><strong>Financial records:</strong> Retained for 7 years for tax and accounting purposes</li>
                <li><strong>Audit logs:</strong> Retained for 2 years for security purposes</li>
              </ul>
              <p className="text-gray-600">
                Clubs are responsible for determining retention periods for member data they collect and should
                inform members of these periods.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Data Security</h2>
              <p className="text-gray-600 mb-4">
                We implement appropriate technical and organisational measures to protect your personal data, including:
              </p>
              <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
                <li>Encryption of data in transit using TLS/SSL</li>
                <li>Encryption of data at rest</li>
                <li>Secure password hashing</li>
                <li>Regular security assessments and updates</li>
                <li>Access controls and authentication</li>
                <li>Secure data centres with appropriate physical security</li>
              </ul>
              <p className="text-gray-600">
                While we strive to protect your data, no method of transmission or storage is 100% secure.
                We cannot guarantee absolute security.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">9. International Data Transfers</h2>
              <p className="text-gray-600 mb-4">
                Our service providers may process data outside the UK and European Economic Area (EEA).
                Where this occurs, we ensure appropriate safeguards are in place, including:
              </p>
              <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
                <li>Standard Contractual Clauses approved by the UK ICO</li>
                <li>Adequacy decisions by the UK Government</li>
                <li>Other legally approved transfer mechanisms</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Your Rights</h2>
              <p className="text-gray-600 mb-4">
                Under data protection law, you have the following rights:
              </p>
              <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
                <li><strong>Right of Access:</strong> Request a copy of your personal data</li>
                <li><strong>Right to Rectification:</strong> Request correction of inaccurate data</li>
                <li><strong>Right to Erasure:</strong> Request deletion of your data (&quot;right to be forgotten&quot;)</li>
                <li><strong>Right to Restrict Processing:</strong> Request limitation of how we use your data</li>
                <li><strong>Right to Data Portability:</strong> Receive your data in a structured, machine-readable format</li>
                <li><strong>Right to Object:</strong> Object to processing based on legitimate interests</li>
                <li><strong>Right to Withdraw Consent:</strong> Withdraw consent at any time where processing is based on consent</li>
              </ul>
              <p className="text-gray-600 mb-4">
                <strong>For Club Administrators:</strong> Contact us directly to exercise your rights.
              </p>
              <p className="text-gray-600">
                <strong>For Parents/Members:</strong> Please contact your Club directly, as they are the Data Controller
                for your information. If you need our assistance, we will help facilitate your request.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">11. Children&apos;s Privacy</h2>
              <p className="text-gray-600 mb-4">
                Our platform is designed to help clubs manage members, including minors. We do not knowingly
                collect personal data directly from children under 13. All data regarding minors should be
                provided by a parent or legal guardian.
              </p>
              <p className="text-gray-600">
                Clubs are responsible for obtaining appropriate parental consent before collecting data about minors
                and must comply with applicable laws regarding children&apos;s privacy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">12. Cookies and Tracking</h2>
              <p className="text-gray-600 mb-4">We use cookies and similar technologies to:</p>
              <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
                <li><strong>Essential Cookies:</strong> Required for the platform to function (authentication, session management)</li>
                <li><strong>Functional Cookies:</strong> Remember your preferences and settings</li>
                <li><strong>Analytics Cookies:</strong> Help us understand how users interact with our platform</li>
              </ul>
              <p className="text-gray-600">
                You can manage cookie preferences through your browser settings. Disabling certain cookies may
                affect platform functionality.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">13. Changes to This Policy</h2>
              <p className="text-gray-600">
                We may update this Privacy Policy from time to time. We will notify you of any material changes
                by posting the new policy on this page and updating the &quot;Last updated&quot; date. We encourage you
                to review this policy periodically.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">14. Contact Us</h2>
              <p className="text-gray-600 mb-4">
                If you have questions about this Privacy Policy or wish to exercise your rights, please contact us:
              </p>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-700">
                  <strong>Club Manager - Data Protection</strong><br />
                  Email: privacy@clubmanager.io<br />
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">15. Supervisory Authority</h2>
              <p className="text-gray-600">
                You have the right to lodge a complaint with the Information Commissioner&apos;s Office (ICO)
                if you believe your data protection rights have been violated:
              </p>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-700">
                  <strong>Information Commissioner&apos;s Office</strong><br />
                  Website: <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">ico.org.uk</a><br />
                  Phone: 0303 123 1113
                </p>
              </div>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-gray-500 text-sm">
              By using Club Manager, you acknowledge that you have read and understood this Privacy Policy.
            </p>
            <div className="mt-6 flex gap-4">
              <Link href="/terms" className="text-primary hover:underline font-medium">
                Terms of Service
              </Link>
              <Link href="/" className="text-primary hover:underline font-medium">
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
