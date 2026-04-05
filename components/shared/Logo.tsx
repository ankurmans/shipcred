import { LuPackageCheck } from 'react-icons/lu';

interface LogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
}

export default function Logo({ size = 24, className = '', showText = true }: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <LuPackageCheck size={size} className="text-brand" />
      {showText && <span className="font-display font-bold text-fg-primary">gtmcommit</span>}
    </span>
  );
}
