
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Users, MapPin, MessageSquare, CreditCard, Briefcase } from "lucide-react"; // Added Briefcase
import { Logo } from "@/components/shared/logo";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between">
          <Logo />
          <nav className="flex items-center gap-2 sm:gap-4">
            <Button variant="ghost" asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Sign Up <ArrowRight className="ml-2 h-4 w-4 hidden sm:inline-block" /></Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="container mx-auto py-12 text-center md:py-24 lg:py-32">
          <h1 className="font-headline text-4xl font-bold tracking-tighter text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
            Connect with Skilled Artisans. <span className="text-primary">Effortlessly.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-[700px] text-lg text-muted-foreground md:text-xl">
            Zelo is your trusted platform in Nigeria to find and hire local artisans for any service you need. Secure payments, verified profiles, and direct communication.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button size="lg" asChild className="font-body">
              <Link href="/register">Get Started <ArrowRight className="ml-2 h-5 w-5" /></Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="font-body">
              <Link href="/browse-services">Browse Services</Link>
            </Button>
          </div>
        </section>

        <section className="bg-secondary py-12 md:py-24">
          <div className="container mx-auto">
            <h2 className="font-headline mb-12 text-center text-3xl font-bold text-foreground md:text-4xl">
              Why Choose Zelo?
            </h2>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              <FeatureCard
                icon={Users}
                title="Verified Professionals"
                description="Access a network of skilled and vetted artisans across Nigeria, ready to deliver quality work."
              />
              <FeatureCard
                icon={ShieldCheck}
                title="Secure Escrow Payments"
                description="Your funds (in Naira) are held safely until the job is completed to your satisfaction. We charge a fair 10% service fee."
              />
              <FeatureCard
                icon={MapPin}
                title="Local & Convenient"
                description="Find artisans near you with our Nigeria-focused location-based search and connect instantly."
              />
              <FeatureCard
                icon={MessageSquare}
                title="In-App Messaging"
                description="Communicate directly with service providers, with an option for Google Meet video calls."
              />
               <FeatureCard
                icon={CreditCard}
                title="Easy Withdrawals"
                description="Artisans can easily set up and manage their withdrawal accounts for prompt payments."
              />
               <FeatureCard
                icon={Briefcase} // Using the imported Briefcase
                title="Post Service Requests"
                description="Clients can easily post job details and service providers can find relevant opportunities."
              />
            </div>
          </div>
        </section>
         <section className="container mx-auto py-12 text-center md:py-24 lg:py-32">
           <h2 className="font-headline mb-6 text-3xl font-bold text-foreground md:text-4xl">Ready to get started?</h2>
           <p className="mx-auto mb-10 max-w-[600px] text-lg text-muted-foreground md:text-xl">
             Join Zelo today, whether you're looking for a service or offering your skills.
           </p>
           <Button size="lg" asChild className="font-body">
              <Link href="/register">Join Zelo Now <ArrowRight className="ml-2 h-5 w-5" /></Link>
            </Button>
         </section>
      </main>

      <footer className="border-t bg-background py-8">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 sm:flex-row">
          <Logo size="sm" />
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Zelo. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary">Terms of Service</Link>
            <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary">Privacy Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
}

function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  return (
    <div className="flex flex-col items-center rounded-lg border bg-card p-6 text-center shadow-sm transition-all hover:shadow-md">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <h3 className="font-headline mb-2 text-xl font-semibold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
