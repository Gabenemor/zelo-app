import { Sprout } from 'lucide-react'; // Changed icon to Sprout for "Zelo"
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  iconOnly?: boolean;
}

export function Logo({ size = 'md', className, iconOnly = false }: LogoProps) {
  const textSizeClass = size === 'sm' ? 'text-xl' : size === 'lg' ? 'text-3xl' : 'text-2xl';
  const iconSizeClasses = {
    sm: 'h-5 w-5',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return (
    <Link href="/" className={cn("flex items-center gap-2 group", className)}>
      <Sprout className={cn(iconSizeClasses[size], "text-primary transition-transform group-hover:scale-110")} />
      {!iconOnly && (
        <span className={cn("font-headline font-bold", textSizeClass, "text-foreground group-hover:text-primary transition-colors")}>
          Zelo
        </span>
      )}
    </Link>
  );
}
