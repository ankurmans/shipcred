interface BadgeProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost' | 'info' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

const sizeClass = { sm: 'badge-sm', md: '', lg: 'badge-lg' };

export default function Badge({ label, variant = 'ghost', size = 'md', icon }: BadgeProps) {
  return (
    <span className={`badge badge-${variant} ${sizeClass[size]} gap-1`}>
      {icon}
      {label}
    </span>
  );
}
