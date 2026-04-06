import type { GitHubAPICommit, AITool, AIDetectionMethod } from '@/types';

interface AIDetection {
  tool: AITool;
  method: AIDetectionMethod;
  confidence: number;
}

export function detectAITool(commit: GitHubAPICommit): AIDetection | null {
  const message = commit.commit.message;
  const author = commit.commit.author?.name || '';
  const authorEmail = commit.commit.author?.email || '';
  const committer = commit.committer?.login || '';
  const committerName = commit.commit.committer?.name || '';

  // ═══════════════════════════════════════════════════
  // CLAUDE CODE (100% confidence)
  // Co-Authored-By: Claude <noreply@anthropic.com>
  // Generated with Claude Code / claude.com/claude-code
  // ═══════════════════════════════════════════════════
  if (message.includes('Co-Authored-By: Claude') && message.includes('noreply@anthropic.com')) {
    return { tool: 'claude_code', method: 'co_author_trailer', confidence: 1.0 };
  }
  if (message.includes('Generated with Claude Code') || message.includes('claude.com/claude-code')) {
    return { tool: 'claude_code', method: 'co_author_trailer', confidence: 1.0 };
  }

  // ═══════════════════════════════════════════════════
  // GITHUB COPILOT (100% confidence)
  // Commits as github-copilot[bot]
  // ═══════════════════════════════════════════════════
  if (committer === 'github-copilot[bot]' || author === 'github-copilot[bot]') {
    return { tool: 'copilot', method: 'bot_commit', confidence: 1.0 };
  }

  // ═══════════════════════════════════════════════════
  // OPENAI CODEX CLI (100% confidence)
  // Co-Authored-By with @openai.com email
  // ═══════════════════════════════════════════════════
  if (message.includes('noreply@openai.com') || message.includes('@openai.com')) {
    return { tool: 'codex', method: 'co_author_trailer', confidence: 1.0 };
  }
  if (message.includes('Co-Authored-By: OpenAI') || message.includes('Generated with OpenAI')) {
    return { tool: 'codex', method: 'co_author_trailer', confidence: 1.0 };
  }

  // ═══════════════════════════════════════════════════
  // AIDER (100% confidence)
  // Co-authored-by: aider (https://aider.chat)
  // aider: prefix in commit messages
  // ═══════════════════════════════════════════════════
  if (message.includes('Co-authored-by: aider') || message.includes('aider.chat')) {
    return { tool: 'aider', method: 'co_author_trailer', confidence: 1.0 };
  }
  if (/^aider:/im.test(message)) {
    return { tool: 'aider', method: 'commit_message', confidence: 0.95 };
  }

  // ═══════════════════════════════════════════════════
  // DEVIN (100% confidence)
  // Commits as devin-ai-integration[bot] or co-authored-by devin-ai
  // ═══════════════════════════════════════════════════
  if (committer === 'devin-ai-integration[bot]' || author.includes('Devin AI')) {
    return { tool: 'devin', method: 'bot_commit', confidence: 1.0 };
  }
  if (message.toLowerCase().includes('co-authored-by: devin-ai') || message.toLowerCase().includes('co-authored-by: devin')) {
    return { tool: 'devin', method: 'co_author_trailer', confidence: 1.0 };
  }

  // ═══════════════════════════════════════════════════
  // GOOGLE JULES (100% confidence)
  // Commits as google-labs-jules[bot]
  // ═══════════════════════════════════════════════════
  if (committer === 'google-labs-jules[bot]' || author === 'google-labs-jules[bot]') {
    return { tool: 'jules', method: 'bot_commit', confidence: 1.0 };
  }

  // ═══════════════════════════════════════════════════
  // GEMINI CODE ASSIST (100% confidence)
  // Co-Authored-By: gemini-code-assist[bot]
  // ═══════════════════════════════════════════════════
  if (committer === 'gemini-code-assist[bot]' || message.includes('gemini-code-assist[bot]')) {
    return { tool: 'gemini', method: 'bot_commit', confidence: 1.0 };
  }

  // ═══════════════════════════════════════════════════
  // LOVABLE (100% confidence)
  // Commits as lovable[bot] or includes lovable.dev
  // ═══════════════════════════════════════════════════
  if (committer === 'lovable[bot]' || message.includes('lovable.dev')) {
    return { tool: 'lovable', method: 'bot_commit', confidence: 1.0 };
  }

  // ═══════════════════════════════════════════════════
  // BOLT.NEW (100% confidence)
  // GitHub App: bolt-new-by-stackblitz[bot]
  // ═══════════════════════════════════════════════════
  if (committer === 'bolt-new-by-stackblitz[bot]' || committer === 'bolt[bot]') {
    return { tool: 'bolt', method: 'bot_commit', confidence: 1.0 };
  }
  if (message.includes('bolt.new') || message.includes('stackblitz.com')) {
    return { tool: 'bolt', method: 'commit_message', confidence: 0.85 };
  }

  // ═══════════════════════════════════════════════════
  // REPLIT AGENT (90% confidence)
  // Commits with @replit.com email or replit-agent patterns
  // ═══════════════════════════════════════════════════
  if (committer === 'replit[bot]' || committer === 'replit-agent[bot]') {
    return { tool: 'replit', method: 'bot_commit', confidence: 1.0 };
  }
  if (authorEmail.includes('@replit.com') || authorEmail.includes('noreply@replit.com')) {
    return { tool: 'replit', method: 'author_email', confidence: 0.9 };
  }
  if (message.includes('Replit Agent') || message.includes('replit.com')) {
    return { tool: 'replit', method: 'commit_message', confidence: 0.8 };
  }

  // ═══════════════════════════════════════════════════
  // V0.DEV (85% confidence)
  // Commits pushed from v0.dev workspace
  // ═══════════════════════════════════════════════════
  if (committer === 'v0[bot]' || message.includes('v0.dev')) {
    return { tool: 'v0', method: 'bot_commit', confidence: 0.9 };
  }

  // ═══════════════════════════════════════════════════
  // BASE44 (85% confidence)
  // Auto-commits from Base44 workspace
  // ═══════════════════════════════════════════════════
  if (committer === 'base44[bot]' || message.includes('base44.com')) {
    return { tool: 'base44', method: 'bot_commit', confidence: 0.9 };
  }
  if (authorEmail.includes('@base44.com')) {
    return { tool: 'base44', method: 'author_email', confidence: 0.85 };
  }

  // ═══════════════════════════════════════════════════
  // SAME.DEV (85% confidence)
  // ═══════════════════════════════════════════════════
  if (committer === 'same[bot]' || message.includes('same.dev') || message.includes('same.new')) {
    return { tool: 'same_dev', method: 'bot_commit', confidence: 0.9 };
  }

  // ═══════════════════════════════════════════════════
  // FIREBASE STUDIO (85% confidence)
  // Google's Firebase Studio / Project IDX
  // ═══════════════════════════════════════════════════
  if (committer === 'firebase-studio[bot]' || message.includes('firebase.studio') || message.includes('Firebase Studio')) {
    return { tool: 'firebase_studio', method: 'bot_commit', confidence: 0.85 };
  }
  if (committer === 'idx[bot]' || message.includes('Project IDX')) {
    return { tool: 'firebase_studio', method: 'bot_commit', confidence: 0.85 };
  }

  // ═══════════════════════════════════════════════════
  // PYTHAGORA / GPT PILOT (90% confidence)
  // ═══════════════════════════════════════════════════
  if (message.includes('pythagora') || message.includes('gpt-pilot') || message.includes('GPT Pilot')) {
    return { tool: 'pythagora', method: 'commit_message', confidence: 0.9 };
  }
  if (committer === 'pythagora[bot]') {
    return { tool: 'pythagora', method: 'bot_commit', confidence: 1.0 };
  }

  // ═══════════════════════════════════════════════════
  // CODY (Sourcegraph) (90% confidence)
  // ═══════════════════════════════════════════════════
  if (message.includes('Co-Authored-By: Cody') || message.includes('sourcegraph.com')) {
    return { tool: 'cody', method: 'co_author_trailer', confidence: 0.9 };
  }

  // ═══════════════════════════════════════════════════
  // CURSOR (70-90% confidence)
  // No default attribution, but user-configured trailers
  // ═══════════════════════════════════════════════════
  if (message.includes('Co-Authored-By: Cursor') || message.includes('cursor.com')) {
    return { tool: 'cursor', method: 'co_author_trailer', confidence: 0.9 };
  }

  // ═══════════════════════════════════════════════════
  // WINDSURF / CODEIUM (90% confidence)
  // ═══════════════════════════════════════════════════
  if (message.includes('Co-Authored-By: Windsurf') || message.includes('codeium.com')) {
    return { tool: 'windsurf', method: 'co_author_trailer', confidence: 0.9 };
  }

  return null;
}
