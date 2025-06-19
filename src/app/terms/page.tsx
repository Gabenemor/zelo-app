
import { PageHeader } from "@/components/ui/page-header";
import { FileText } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function TermsPage() {
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
          title="Terms of Service"
          description="Please read these terms carefully before using Zelo."
        />
        <div className="prose prose-sm sm:prose-base lg:prose-lg xl:prose-xl mx-auto mt-8 rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="font-headline">1. Acceptance of Terms</h2>
          <p>
            By accessing or using the Zelo platform ("Service"), operated by Zelo Inc. ("us", "we", or "our"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of the terms, then you may not access the Service.
          </p>

          <h2 className="font-headline">2. Description of Service</h2>
          <p>
            Zelo provides an online platform that connects individuals seeking services ("Clients") with individuals and businesses providing services ("Artisans"). We facilitate discovery, communication, and secure payments through an escrow system.
          </p>
          
          <h2 className="font-headline">3. User Accounts</h2>
          <p>
            When you create an account with us, you must provide information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.
          </p>

          <h2 className="font-headline">4. Escrow and Payments</h2>
          <p>
            Zelo utilizes an escrow system for payments. Clients fund the agreed service amount into escrow. Upon satisfactory completion confirmed by the Client, funds are released to the Artisan, less a 10% platform service fee. Zelo is not a bank and does not offer banking services.
          </p>
          
          <h2 className="font-headline">5. User Conduct</h2>
          <p>
            You agree not to use the Service to:
            <ul>
              <li>Violate any local, state, national, or international law.</li>
              <li>Engage in any fraudulent activity.</li>
              <li>Post false, misleading, or inaccurate information.</li>
              <li>Harass, abuse, or harm another person.</li>
            </ul>
          </p>

          <h2 className="font-headline">6. Intellectual Property</h2>
          <p>
            The Service and its original content, features, and functionality are and will remain the exclusive property of Zelo Inc. and its licensors.
          </p>

          <h2 className="font-headline">7. Termination</h2>
          <p>
            We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
          </p>

          <h2 className="font-headline">8. Limitation of Liability</h2>
          <p>
            In no event shall Zelo Inc., nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
          </p>

          <h2 className="font-headline">9. Governing Law</h2>
          <p>
            These Terms shall be governed and construed in accordance with the laws of Nigeria, without regard to its conflict of law provisions.
          </p>

          <h2 className="font-headline">10. Changes to Terms</h2>
          <p>
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will try to provide at least 30 days' notice prior to any new terms taking effect.
          </p>

          <h2 className="font-headline">Contact Us</h2>
          <p>
            If you have any questions about these Terms, please contact us at legal@zelo.app.
          </p>
          <p className="text-xs text-muted-foreground">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
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
