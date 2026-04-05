import type { GitHubAPICommit, AITool, AIDetectionMethod } from '@/types';

interface AIDetection {
  tool: AITool;
  method: AIDetectionMethod;
  confidence: number;
}

export function detectAITool(commit: GitHubAPICommit): AIDetection | null {
  const message = commit.commit.message;
  const author = commit.commit.author?.name || '';
  const committer = commit.committer?.login || '';

  // === CLAUDE CODE (100% confidence) ===
  if (message.includes('Co-Authored-By: Claude <noreply@anthropic.com>')) {
    return { tool: 'claude_code', method: 'co_author_trailer', confidence: 1.0 };
  }
  if (message.includes('Generated with Claude Code') || message.includes('claude.com/claude-code')) {
    return { tool: 'claude_code', method: 'co_author_trailer', confidence: 1.0 };
  }
  // Claude Opus/Sonnet/Haiku co-author patterns
  if (message.includes('Co-Authored-By: Claude') && message.includes('noreply@anthropic.com')) {
    return { tool: 'claude_code', method: 'co_author_trailer', confidence: 1.0 };
  }

  // === GITHUB COPILOT CODING AGENT (100% confidence) ===
  if (committer === 'github-copilot[bot]' || author === 'github-copilot[bot]') {
    return { tool: 'copilot', method: 'bot_commit', confidence: 1.0 };
  }

  // === AIDER (100% confidence) ===
  if (message.includes('Co-authored-by: aider') || message.includes('aider.chat')) {
    return { tool: 'aider', method: 'co_author_trailer', confidence: 1.0 };
  }

  // === CURSOR (70-90% confidence) ===
  if (message.includes('Co-Authored-By: Cursor') || message.includes('cursor.com')) {
    return { tool: 'cursor', method: 'co_author_trailer', confidence: 0.9 };
  }

  // === DEVIN (100% confidence) ===
  if (committer === 'devin-ai-integration[bot]' || author.includes('Devin AI')) {
    return { tool: 'devin', method: 'bot_commit', confidence: 1.0 };
  }

  // === WINDSURF (90% confidence) ===
  if (message.includes('Co-Authored-By: Windsurf') || message.includes('codeium.com')) {
    return { tool: 'windsurf', method: 'co_author_trailer', confidence: 0.9 };
  }

  // === LOVABLE (100% confidence) ===
  if (committer === 'lovable[bot]' || message.includes('lovable.dev')) {
    return { tool: 'lovable', method: 'bot_commit', confidence: 1.0 };
  }

  return null;
}
