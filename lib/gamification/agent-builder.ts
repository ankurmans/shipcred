/**
 * Agent Builder Badge Detection
 *
 * Qualifies a profile for the "Agent Builder" badge based on signals
 * that prove they build autonomous AI agents, not just use AI assistants.
 *
 * Requires 2+ qualifying signals from:
 * 1. MCP config uploaded (builds tool-using agents)
 * 2. CLAUDE.md with tool definitions (configures agents)
 * 3. 3+ distinct AI tools in commits (multi-agent workflow)
 * 4. n8n workflow with AI nodes imported (automation + AI)
 * 5. Automation platform proofs: Clay + (n8n or Make) (orchestration stack)
 * 6. Skill files uploaded (agent customization)
 */

export interface AgentBuilderResult {
  qualifies: boolean;
  signals: string[];
  signalCount: number;
}

export function detectAgentBuilder(data: {
  uploadedFiles: { file_type: string; is_parsed_valid: boolean; structural_markers_found?: string[] }[];
  commits: { ai_tool_detected: string | null }[];
  externalProofs: { verification_status: string; source_type: string; platform_data: Record<string, unknown> }[];
  toolDeclarations: { is_verified: boolean; tool_name?: string }[];
}): AgentBuilderResult {
  const signals: string[] = [];

  // Signal 1: MCP config uploaded
  const hasMcpConfig = data.uploadedFiles.some(
    f => f.file_type === 'mcp_config' && f.is_parsed_valid
  );
  if (hasMcpConfig) signals.push('mcp_config');

  // Signal 2: CLAUDE.md with tool/agent definitions
  const hasClaudeMd = data.uploadedFiles.some(f => {
    if (f.file_type !== 'claude_md' || !f.is_parsed_valid) return false;
    const markers = f.structural_markers_found || [];
    return markers.includes('tool_definitions') || markers.includes('api_refs');
  });
  if (hasClaudeMd) signals.push('claude_md_tools');

  // Signal 3: 3+ distinct AI tools (from declarations or commits)
  const aiTools = new Set<string>();
  data.toolDeclarations.filter(t => t.is_verified && t.tool_name).forEach(t => aiTools.add(t.tool_name!));
  data.commits.filter(c => c.ai_tool_detected).forEach(c => aiTools.add(c.ai_tool_detected!));
  if (aiTools.size >= 3) signals.push('multi_tool');

  // Signal 4: n8n workflow with AI nodes
  const hasAiWorkflow = data.externalProofs.some(
    p => p.source_type === 'n8n' &&
      p.verification_status === 'verified' &&
      p.platform_data?.has_ai_nodes === true
  );
  if (hasAiWorkflow) signals.push('ai_workflow');

  // Signal 5: Automation stack (Clay + n8n/Make)
  const verifiedProofs = data.externalProofs.filter(p => p.verification_status === 'verified');
  const hasClay = verifiedProofs.some(p => p.source_type === 'clay');
  const hasAutomation = verifiedProofs.some(p => p.source_type === 'n8n' || p.source_type === 'make');
  if (hasClay && hasAutomation) signals.push('automation_stack');

  // Signal 6: Skill files uploaded (agent customization artifacts)
  const hasSkillFiles = data.uploadedFiles.some(
    f => f.file_type === 'skill_file' && f.is_parsed_valid
  );
  if (hasSkillFiles) signals.push('skill_files');

  // Signal 7: Verified tool declarations for agent-centric tools
  const agentTools = ['claude_code', 'devin', 'codex', 'jules', 'cody'];
  const hasAgentToolVerified = data.toolDeclarations.some(
    t => t.is_verified && t.tool_name && agentTools.includes(t.tool_name)
  );
  // Only counts if combined with another code-gen tool
  const hasCodeGenTool = data.toolDeclarations.some(
    t => t.is_verified && t.tool_name && ['cursor', 'copilot', 'windsurf', 'aider'].includes(t.tool_name)
  );
  if (hasAgentToolVerified && hasCodeGenTool) signals.push('agent_tool_combo');

  return {
    qualifies: signals.length >= 2,
    signals,
    signalCount: signals.length,
  };
}
