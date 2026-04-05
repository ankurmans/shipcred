import type { ToolDeclaration } from '@/types';

const TOOL_DISPLAY: Record<string, { label: string; color: string }> = {
  claude_code: { label: 'Claude Code', color: 'badge-primary' },
  copilot: { label: 'Copilot', color: 'badge-info' },
  cursor: { label: 'Cursor', color: 'badge-secondary' },
  aider: { label: 'Aider', color: 'badge-warning' },
  windsurf: { label: 'Windsurf', color: 'badge-accent' },
  devin: { label: 'Devin', color: 'badge-error' },
  lovable: { label: 'Lovable', color: 'badge-success' },
  clay: { label: 'Clay', color: 'badge-info' },
  v0: { label: 'v0', color: 'badge-ghost' },
  bolt: { label: 'Bolt', color: 'badge-warning' },
  replit: { label: 'Replit', color: 'badge-accent' },
};

interface ToolBadgesProps {
  tools: ToolDeclaration[];
}

export default function ToolBadges({ tools }: ToolBadgesProps) {
  if (!tools.length) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {tools.map((tool) => {
        const display = TOOL_DISPLAY[tool.tool_name] || {
          label: tool.tool_name,
          color: 'badge-ghost',
        };
        return (
          <span
            key={tool.id}
            className={`badge ${display.color} gap-1`}
          >
            {tool.is_verified && (
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            {display.label}
            {tool.is_verified && tool.verified_commit_count > 0 && (
              <span className="text-xs opacity-70">({tool.verified_commit_count})</span>
            )}
          </span>
        );
      })}
    </div>
  );
}
