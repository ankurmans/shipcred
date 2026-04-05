'use client';

interface LeaderboardFiltersProps {
  selectedRole: string;
  onRoleChange: (role: string) => void;
}

const ROLES = [
  { value: '', label: 'All Roles' },
  { value: 'marketer', label: 'Marketer' },
  { value: 'sdr', label: 'SDR' },
  { value: 'ae', label: 'Account Executive' },
  { value: 'growth', label: 'Growth' },
  { value: 'founder', label: 'Founder' },
];

export default function LeaderboardFilters({ selectedRole, onRoleChange }: LeaderboardFiltersProps) {
  return (
    <div className="flex gap-2 flex-wrap">
      {ROLES.map((role) => (
        <button
          key={role.value}
          onClick={() => onRoleChange(role.value)}
          className={`btn btn-sm ${
            selectedRole === role.value ? 'btn-primary' : 'btn-ghost'
          }`}
        >
          {role.label}
        </button>
      ))}
    </div>
  );
}
