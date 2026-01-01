import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service | Club Manager",
  description: "Terms of Service for Club Manager - the all-in-one platform for managing members, classes, and payments.",
};

export default function TermsPage() {
  const lastUpdated = "1 January 2026";

  return (
    <div className="py-16 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-sm p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
          <p className="text-gray-500 mb-8">Last updated: {lastUpdated}</p>

          <div className="prose prose-gray max-w-none">
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Agreement to Terms</h2>
              <p className="text-gray-600 mb-4">
                By accessing or using Club Manager (&quot;Service&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;).
                If you disagree with any part of these terms, you may not access the Service.
              </p>
              <p className="text-gray-600">
                These Terms apply to all visitors, users, and others who access or use the Service, including but not limited to
                club administrators, club owners, parents, guardians, and members.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
              <p className="text-gray-600 mb-4">
                Club Manager is a software-as-a-service (SaaS) platform that enables organisations such as sports clubs,
                dance schools, martial arts academies, and similar organisations (&quot;Clubs&quot;) to:
              </p>
              <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
                <li>Manage member information and records</li>
                <li>Schedule and manage classes and sessions</li>
                <li>Track attendance</li>
                <li>Process subscription payments via Stripe</li>
                <li>Communicate with parents and members</li>
                <li>Generate reports and analytics</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Account Registration</h2>
              <p className="text-gray-600 mb-4">
                To use certain features of the Service, you must register for an account. When you register, you agree to:
              </p>
              <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain and promptly update your account information</li>
                <li>Maintain the security and confidentiality of your login credentials</li>
                <li>Accept responsibility for all activities that occur under your account</li>
                <li>Notify us immediately of any unauthorised use of your account</li>
              </ul>
              <p className="text-gray-600">
                You must be at least 18 years old to create a Club administrator account. Parent portal accounts may be
                created by parents or legal guardians of members.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Club Administrator Responsibilities</h2>
              <p className="text-gray-600 mb-4">
                As a Club administrator using our Service, you are responsible for:
              </p>
              <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
                <li>Ensuring you have lawful basis to collect and process member data</li>
                <li>Obtaining appropriate consent from parents/guardians for minors</li>
                <li>Maintaining accurate membership records</li>
                <li>Complying with all applicable data protection laws (including GDPR)</li>
                <li>Setting appropriate membership fees and managing your Stripe account</li>
                <li>Responding to member enquiries and complaints</li>
                <li>Providing accurate information about your club and services</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Payment Terms</h2>
              <h3 className="text-lg font-medium text-gray-900 mb-3">5.1 Platform Fees</h3>
              <p className="text-gray-600 mb-4">
                Club Manager charges a <strong>10% platform fee</strong> on all subscription payments processed through the Service.
                This fee is automatically deducted from each transaction before funds are transferred to your connected Stripe account.
              </p>

              <h3 className="text-lg font-medium text-gray-900 mb-3">5.2 Stripe Connect</h3>
              <p className="text-gray-600 mb-4">
                Payment processing is provided by Stripe. By using our payment features, you also agree to
                Stripe&apos;s <a href="https://stripe.com/legal" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Terms of Service</a> and
                <a href="https://stripe.com/legal/connect-account" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline"> Connected Account Agreement</a>.
              </p>

              <h3 className="text-lg font-medium text-gray-900 mb-3">5.3 Refunds</h3>
              <p className="text-gray-600 mb-4">
                Refund policies are determined by individual Clubs. Club Manager is not responsible for processing refunds
                or resolving payment disputes between Clubs and their members. Such matters should be handled directly
                between the Club and the member.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Acceptable Use</h2>
              <p className="text-gray-600 mb-4">
                You agree not to use the Service to:
              </p>
              <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe upon the rights of others</li>
                <li>Upload or transmit viruses or malicious code</li>
                <li>Attempt to gain unauthorised access to our systems</li>
                <li>Interfere with the proper working of the Service</li>
                <li>Collect user information without consent</li>
                <li>Send spam or unsolicited communications</li>
                <li>Engage in fraudulent activities</li>
                <li>Store or process sensitive personal data beyond what is necessary for club management</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Data Protection</h2>
              <p className="text-gray-600 mb-4">
                We process personal data in accordance with our <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
                As a Club administrator, you act as the data controller for member information you collect,
                and Club Manager acts as a data processor on your behalf.
              </p>
              <p className="text-gray-600">
                You are responsible for ensuring that your use of the Service complies with the UK GDPR,
                Data Protection Act 2018, and any other applicable data protection legislation.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Intellectual Property</h2>
              <p className="text-gray-600 mb-4">
                The Service and its original content, features, and functionality are owned by Club Manager
                and are protected by international copyright, trademark, and other intellectual property laws.
              </p>
              <p className="text-gray-600">
                You retain ownership of any content you upload to the Service, including club logos, member photos,
                and other materials. By uploading content, you grant us a licence to use, store, and display that
                content solely for the purpose of providing the Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Service Availability</h2>
              <p className="text-gray-600 mb-4">
                We strive to ensure the Service is available 24/7, but we do not guarantee uninterrupted access.
                The Service may be temporarily unavailable due to:
              </p>
              <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
                <li>Scheduled maintenance</li>
                <li>Emergency repairs</li>
                <li>Circumstances beyond our reasonable control</li>
              </ul>
              <p className="text-gray-600">
                We will endeavour to provide advance notice of scheduled maintenance where possible.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Termination</h2>
              <p className="text-gray-600 mb-4">
                You may terminate your account at any time by contacting us. We may terminate or suspend your
                account immediately, without prior notice, if you breach these Terms.
              </p>
              <p className="text-gray-600 mb-4">
                Upon termination:
              </p>
              <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
                <li>Your right to use the Service will immediately cease</li>
                <li>We may delete your data in accordance with our data retention policies</li>
                <li>Outstanding platform fees remain payable</li>
                <li>Provisions that by their nature should survive termination will survive</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">11. Disclaimer of Warranties</h2>
              <p className="text-gray-600 mb-4">
                THE SERVICE IS PROVIDED ON AN &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; BASIS WITHOUT WARRANTIES OF ANY KIND,
                EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY,
                FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
              </p>
              <p className="text-gray-600">
                We do not warrant that the Service will be uninterrupted, secure, or error-free, or that defects will be corrected.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">12. Limitation of Liability</h2>
              <p className="text-gray-600 mb-4">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, CLUB MANAGER SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL,
                SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED
                DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.
              </p>
              <p className="text-gray-600">
                Our total liability for any claims arising from or related to these Terms or the Service shall not
                exceed the total amount of platform fees you have paid to us in the twelve (12) months preceding the claim.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">13. Indemnification</h2>
              <p className="text-gray-600">
                You agree to indemnify and hold harmless Club Manager, its officers, directors, employees, and agents
                from any claims, damages, losses, liabilities, and expenses (including legal fees) arising from:
              </p>
              <ul className="list-disc pl-6 text-gray-600 mt-4 space-y-2">
                <li>Your use of the Service</li>
                <li>Your violation of these Terms</li>
                <li>Your violation of any rights of another party</li>
                <li>Your collection and processing of member data</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">14. Governing Law</h2>
              <p className="text-gray-600">
                These Terms shall be governed by and construed in accordance with the laws of England and Wales,
                without regard to conflict of law principles. Any disputes arising from these Terms or the Service
                shall be subject to the exclusive jurisdiction of the courts of England and Wales.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">15. Changes to Terms</h2>
              <p className="text-gray-600">
                We reserve the right to modify these Terms at any time. We will notify users of any material changes
                by posting the new Terms on this page and updating the &quot;Last updated&quot; date. Your continued use of the
                Service after such changes constitutes acceptance of the new Terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">16. Contact Information</h2>
              <p className="text-gray-600">
                If you have any questions about these Terms, please contact us at:
              </p>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-700">
                  <strong>Club Manager</strong><br />
                  Email: legal@clubmanager.io<br />
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">17. Severability</h2>
              <p className="text-gray-600">
                If any provision of these Terms is held to be unenforceable or invalid, such provision will be
                changed and interpreted to accomplish the objectives of such provision to the greatest extent
                possible under applicable law, and the remaining provisions will continue in full force and effect.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">18. Entire Agreement</h2>
              <p className="text-gray-600">
                These Terms, together with our Privacy Policy, constitute the entire agreement between you and
                Club Manager regarding the Service and supersede all prior agreements and understandings.
              </p>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-gray-500 text-sm">
              By using Club Manager, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
            </p>
            <div className="mt-6 flex gap-4">
              <Link href="/privacy" className="text-primary hover:underline font-medium">
                Privacy Policy
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
