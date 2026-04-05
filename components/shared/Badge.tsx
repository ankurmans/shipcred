interface BadgeProps {
  label: string;
  bg?: string;
  color?: string;
  icon?: React.ReactNode;
}

export default function Badge({ label, bg = '#F5F5F5', color = '#666', icon }: BadgeProps) {
  return (
    <span className="badge" style={{ backgroundColor: bg, color }}>
      {icon}
      {label}
    </span>
  );
}
