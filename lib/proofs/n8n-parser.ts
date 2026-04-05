export interface N8nWorkflowAnalysis {
  valid: boolean;
  node_count: number;
  connection_count: number;
  node_types: string[];
  has_ai_nodes: boolean;
  trigger_type: string | null;
  complexity_score: number;
  sanitized_workflow: object;
  error?: string;
}

const AI_NODE_PATTERNS = [
  /openai/i, /anthropic/i, /claude/i, /langchain/i,
  /chatgpt/i, /huggingface/i, /ollama/i,
];

function countConnections(connections: Record<string, unknown>): number {
  let count = 0;
  try {
    for (const nodeConns of Object.values(connections)) {
      if (typeof nodeConns !== 'object' || !nodeConns) continue;
      for (const outputType of Object.values(nodeConns as Record<string, unknown>)) {
        if (!Array.isArray(outputType)) continue;
        for (const connArray of outputType) {
          if (Array.isArray(connArray)) count += connArray.length;
        }
      }
    }
  } catch {
    // Malformed connections — return what we counted
  }
  return count;
}

function stripCredentials(workflow: Record<string, unknown>): Record<string, unknown> {
  const copy = JSON.parse(JSON.stringify(workflow));

  if (Array.isArray(copy.nodes)) {
    for (const node of copy.nodes) {
      if (node && typeof node === 'object') {
        delete node.credentials;
        // Also strip any parameter values that look like secrets
        if (node.parameters && typeof node.parameters === 'object') {
          for (const [key, value] of Object.entries(node.parameters as Record<string, unknown>)) {
            if (typeof value === 'string' && /^(sk-|xox|ghp_|Bearer |token_)/i.test(value)) {
              (node.parameters as Record<string, string>)[key] = '[REDACTED]';
            }
          }
        }
      }
    }
  }

  // Remove top-level settings that might contain sensitive data
  delete copy.staticData;
  delete copy.settings?.executionOrder;

  return copy;
}

function detectTriggerType(nodes: Array<Record<string, unknown>>): string | null {
  if (nodes.length === 0) return null;

  // n8n convention: trigger node is typically the first node or has "trigger" in its type
  for (const node of nodes) {
    const nodeType = String(node.type || '').toLowerCase();
    if (nodeType.includes('webhook')) return 'webhook';
    if (nodeType.includes('cron') || nodeType.includes('schedule')) return 'schedule';
    if (nodeType.includes('trigger')) return 'trigger';
  }

  return 'manual';
}

export function parseN8nWorkflow(jsonString: string): N8nWorkflowAnalysis {
  const fail = (error: string): N8nWorkflowAnalysis => ({
    valid: false, node_count: 0, connection_count: 0, node_types: [],
    has_ai_nodes: false, trigger_type: null, complexity_score: 0,
    sanitized_workflow: {}, error,
  });

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(jsonString);
  } catch {
    return fail('Invalid JSON');
  }

  if (typeof parsed !== 'object' || parsed === null) {
    return fail('JSON is not an object');
  }

  const nodes = parsed.nodes;
  const connections = parsed.connections;

  if (!Array.isArray(nodes)) {
    return fail('Missing or invalid "nodes" array');
  }

  if (typeof connections !== 'object' || connections === null) {
    return fail('Missing or invalid "connections" object');
  }

  const nodeCount = nodes.length;
  if (nodeCount < 3) {
    return fail('Workflow too simple (minimum 3 nodes required)');
  }

  // Extract node types, stripping n8n-nodes-base. prefix
  const nodeTypes = [...new Set(
    nodes
      .map((n: Record<string, unknown>) => String(n.type || 'unknown'))
      .map((t: string) => t.replace(/^n8n-nodes-base\./i, '').replace(/@.*$/, ''))
  )];

  const connectionCount = countConnections(connections as Record<string, unknown>);

  const hasAiNodes = nodeTypes.some(t =>
    AI_NODE_PATTERNS.some(pattern => pattern.test(t))
  );

  const triggerType = detectTriggerType(nodes as Array<Record<string, unknown>>);

  // Complexity score: nodes + connections + AI bonus + type diversity
  const complexityScore = Math.min(100,
    nodeCount * 5 +
    connectionCount * 3 +
    (hasAiNodes ? 20 : 0) +
    nodeTypes.length * 3
  );

  const sanitizedWorkflow = stripCredentials(parsed);

  return {
    valid: true,
    node_count: nodeCount,
    connection_count: connectionCount,
    node_types: nodeTypes,
    has_ai_nodes: hasAiNodes,
    trigger_type: triggerType,
    complexity_score: complexityScore,
    sanitized_workflow: sanitizedWorkflow,
  };
}
