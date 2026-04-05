import type { ToolDeclaration } from '@/types';

const TOOL_DISPLAY: Record<string, { label: string; bg: string; color: string }> = {
  claude_code: { label: 'Claude Code', bg: '#FFF7ED', color: '#FF5C00' },
  copilot: { label: 'Copilot', bg: '#EFF6FF', color: '#3B82F6' },
  cursor: { label: 'Cursor', bg: '#EEF2FF', color: '#6366F1' },
  aider: { label: 'Aider', bg: '#FFFBEB', color: '#F59E0B' },
  windsurf: { label: 'Windsurf', bg: '#ECFDF5', color: '#059669' },
  devin: { label: 'Devin', bg: '#FEF2F2', color: '#EF4444' },
  lovable: { label: 'Lovable', bg: '#FDF2F8', color: '#EC4899' },
  clay: { label: 'Clay', bg: '#EFF6FF', color: '#3B82F6' },
  v0: { label: 'v0', bg: '#F5F5F5', color: '#666666' },
  bolt: { label: 'Bolt', bg: '#FFF7ED', color: '#FF5C00' },
  replit: { label: 'Replit', bg: '#EEF2FF', color: '#6366F1' },
};

export default function ToolBadges({ tools }: { tools: ToolDeclaration[] }) {
  if (!tools.length) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {tools.map((tool) => {
        const d = TOOL_DISPLAY[tool.tool_name] || { label: tool.tool_name, bg: '#F5F5F5', color: '#666' };
        return (
          <span key={tool.id} className="badge" style={{ backgroundColor: d.bg, color: d.color }}>
            {tool.is_verified && '✓ '}
            {d.label}
            {tool.is_verified && tool.verified_commit_count > 0 && ` (${tool.verified_commit_count})`}
          </span>
        );
      })}
    </div>
  );
}
