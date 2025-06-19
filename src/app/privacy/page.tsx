
import { PageHeader } from "@/components/ui/page-header";
import { Shield } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background lg:px-[5%]">
       <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Logo />
          <Button variant="outline" asChild>
            <Link href="/"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Home</Link>
          </Button>
        </div>
      </header>
      <main className="container mx-auto max-w-3xl py-8 sm:py-12">
        <PageHeader
          title="Privacy Policy"
          description="Your privacy is important to us at Zelo."
        />
        <div className="prose prose-sm sm:prose-base lg:prose-lg xl:prose-xl mx-auto mt-8 rounded-lg border bg-card p-6 shadow-sm">
          <p>Effective Date: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

          <h2 className="font-headline">1. Introduction</h2>
          <p>
            Zelo Inc. ("Zelo", "we", "us", or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application and website (collectively, the "Service"). Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the service.
          </p>

          <h2 className="font-headline">2. Information We Collect</h2>
          <p>
            We may collect information about you in a variety of ways. The information we may collect via the Service includes:
            <ul>
              <li>
                <strong>Personal Data:</strong> Personally identifiable information, such as your name, shipping address, email address, and telephone number, and demographic information, such as your age, gender, hometown, and interests, that you voluntarily give to us when you register with the Service or when you choose to participate in various activities related to the Service.
              </li>
              <li>
                <strong>Derivative Data:</strong> Information our servers automatically collect when you access the Service, such as your IP address, your browser type, your operating system, your access times, and the pages you have viewed directly before and after accessing the Service.
              </li>
              <li>
                <strong>Financial Data:</strong> Financial information, such as data related to your payment method (e.g., valid bank account details for artisans) that we may collect when you make payments or set up withdrawals. We store only very limited, if any, financial information that we collect. Otherwise, all financial information is stored by our payment processors.
              </li>
              <li>
                <strong>Location Data:</strong> We may request access or permission to and track location-based information from your mobile device or web browser, either continuously or while you are using the Service, to provide location-based services.
              </li>
            </ul>
          </p>

          <h2 className="font-headline">3. Use of Your Information</h2>
          <p>
            Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Service to:
            <ul>
              <li>Create and manage your account.</li>
              <li>Facilitate account creation and logon process.</li>
              <li>Process your transactions and send you related information, including purchase confirmations and invoices.</li>
              <li>Manage escrow payments and artisan withdrawals.</li>
              <li>Enable user-to-user communications.</li>
              <li>Monitor and analyze usage and trends to improve your experience with the Service.</li>
              <li>Notify you of updates to the Service.</li>
              <li>Prevent fraudulent transactions, monitor against theft, and protect against criminal activity.</li>
            </ul>
          </p>
          
          <h2 className="font-headline">4. Disclosure of Your Information</h2>
          <p>
            We may share information we have collected about you in certain situations. Your information may be disclosed as follows:
            <ul>
              <li>
                <strong>By Law or to Protect Rights:</strong> If we believe the release of information about you is necessary to respond to legal process, to investigate or remedy potential violations of our policies, or to protect the rights, property, and safety of others, we may share your information as permitted or required by any applicable law, rule, or regulation.
              </li>
              <li>
                <strong>Third-Party Service Providers:</strong> We may share your information with third parties that perform services for us or on our behalf, including payment processing, data analysis, email delivery, hosting services, customer service, and marketing assistance.
              </li>
               <li>
                <strong>With Other Users:</strong> When you interact with other users of the Service (e.g., an Artisan communicating with a Client), that user may see your name, profile photo, and descriptions of your activity, including service requests or offers.
              </li>
            </ul>
          </p>

          <h2 className="font-headline">5. Security of Your Information</h2>
          <p>
            We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
          </p>

          <h2 className="font-headline">6. Your Rights</h2>
          <p>
            Depending on your location, you may have certain rights regarding your personal information, such as the right to access, correct, or delete your personal data.
          </p>

          <h2 className="font-headline">7. Changes to This Privacy Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.
          </p>

          <h2 className="font-headline">Contact Us</h2>
          <p>
            If you have questions or comments about this Privacy Policy, please contact us at: privacy@zelo.app
          </p>
        </div>
      </main>
      <footer className="border-t bg-background py-8 text-center">
        <div className="container">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Zelo. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
