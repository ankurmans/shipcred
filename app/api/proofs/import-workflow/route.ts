import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { parseN8nWorkflow } from '@/lib/proofs/n8n-parser';

async function computeHash(content: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await supabase
    .from('profiles').select('id').eq('user_id', user.id).single();
  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });

  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  const projectName = formData.get('project_name') as string | null;

  if (!file) return NextResponse.json({ error: 'file is required' }, { status: 400 });

  // Size limit: 1MB
  if (file.size > 1_000_000) {
    return NextResponse.json({ error: 'File too large (max 1MB)' }, { status: 400 });
  }

  const content = await file.text();

  // Parse and validate the n8n workflow
  const analysis = parseN8nWorkflow(content);
  if (!analysis.valid) {
    return NextResponse.json({ error: analysis.error || 'Invalid n8n workflow' }, { status: 400 });
  }

  if (analysis.complexity_score < 10) {
    return NextResponse.json({
      error: 'Workflow too simple to count as proof. Add more nodes and connections.',
    }, { status: 400 });
  }

  // Content hash for deduplication
  const contentHash = await computeHash(content);

  const admin = createAdminClient();

  // Check if this exact workflow was already imported (by anyone)
  const { data: existing } = await admin
    .from('external_proofs')
    .select('id, profile_id')
    .eq('verification_method', 'json_import')
    .filter('platform_data->>content_hash', 'eq', contentHash)
    .single();

  if (existing) {
    if (existing.profile_id === profile.id) {
      return NextResponse.json({ error: 'You have already imported this workflow' }, { status: 409 });
    }
    return NextResponse.json({
      error: 'This workflow has already been imported by another member.',
    }, { status: 409 });
  }

  // Upload sanitized workflow to Supabase Storage
  const storagePath = `workflows/${profile.id}/${Date.now()}.json`;
  const sanitizedJson = JSON.stringify(analysis.sanitized_workflow, null, 2);

  const { error: storageError } = await admin.storage
    .from('files')
    .upload(storagePath, sanitizedJson, { contentType: 'application/json' });

  if (storageError) {
    return NextResponse.json({ error: 'Failed to store workflow' }, { status: 500 });
  }

  const { data: publicUrl } = admin.storage.from('files').getPublicUrl(storagePath);

  // Insert into external_proofs
  const { data: proof, error } = await admin
    .from('external_proofs')
    .insert({
      profile_id: profile.id,
      source_type: 'n8n',
      project_url: publicUrl.publicUrl,
      project_name: projectName || `n8n workflow (${analysis.node_count} nodes)`,
      verification_status: 'verified',
      verification_method: 'json_import',
      verified_at: new Date().toISOString(),
      platform_data: {
        content_hash: contentHash,
        node_count: analysis.node_count,
        connection_count: analysis.connection_count,
        node_types: analysis.node_types,
        has_ai_nodes: analysis.has_ai_nodes,
        trigger_type: analysis.trigger_type,
        complexity_score: analysis.complexity_score,
      },
      proof_score: 30,
    })
    .select()
    .single();

  if (error) {
    console.error('Workflow import error:', error.message);
    return NextResponse.json({ error: 'Failed to import workflow' }, { status: 400 });
  }

  return NextResponse.json({
    proof,
    analysis: {
      node_count: analysis.node_count,
      connection_count: analysis.connection_count,
      node_types: analysis.node_types,
      has_ai_nodes: analysis.has_ai_nodes,
      trigger_type: analysis.trigger_type,
      complexity_score: analysis.complexity_score,
    },
  });
}
