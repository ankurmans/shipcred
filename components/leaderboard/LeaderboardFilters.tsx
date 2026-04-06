'use client';

import { analytics } from '@/lib/analytics';

const ROLES = [
  { value: '', label: 'All Roles' }, { value: 'marketer', label: 'Marketer' },
  { value: 'sdr', label: 'SDR' }, { value: 'ae', label: 'Account Executive' },
  { value: 'growth', label: 'Growth' }, { value: 'founder', label: 'Founder' },
];

export default function LeaderboardFilters({ selectedRole, onRoleChange }: { selectedRole: string; onRoleChange: (role: string) => void }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {ROLES.map((role) => (
        <button
          key={role.value}
          onClick={() => { onRoleChange(role.value); analytics.leaderboardFiltered(role.value || 'all'); }}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            selectedRole === role.value ? 'bg-brand text-white' : 'bg-surface-secondary text-fg-secondary hover:bg-surface-muted'
          }`}
        >
          {role.label}
        </button>
      ))}
    </div>
  );
}
