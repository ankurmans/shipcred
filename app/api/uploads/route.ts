import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

function detectFileType(filename: string): string | null {
  const lower = filename.toLowerCase();
  if (lower === 'claude.md' || lower.includes('claude')) return 'claude_md';
  if (lower === '.cursorrules' || lower.includes('cursorrules')) return 'cursorrules';
  if (lower.includes('mcp') && (lower.endsWith('.json') || lower.endsWith('.yaml') || lower.endsWith('.yml'))) return 'mcp_config';
  if (lower.endsWith('.md') || lower.endsWith('.yaml') || lower.endsWith('.yml') || lower.endsWith('.json')) return 'skill_file';
  return null;
}

function detectStructuralMarkers(content: string, fileType: string): string[] {
  const markers: string[] = [];

  if (fileType === 'claude_md') {
    if (content.includes('## ') || content.includes('# ')) markers.push('headings');
    if (content.includes('```')) markers.push('code_blocks');
    if (/tool|skill|command|instruction/i.test(content)) markers.push('tool_definitions');
    if (/system.?prompt|role|persona/i.test(content)) markers.push('system_prompt');
    if (/api|endpoint|fetch|http/i.test(content)) markers.push('api_refs');
  } else if (fileType === 'cursorrules') {
    if (/rule|pattern|convention/i.test(content)) markers.push('rules');
    if (/prefer|avoid|always|never/i.test(content)) markers.push('preferences');
  } else if (fileType === 'mcp_config') {
    if (/"mcpServers"|mcpServers/i.test(content)) markers.push('mcp_servers');
    if (/"command"|command:/i.test(content)) markers.push('commands');
    if (/"args"|args:/i.test(content)) markers.push('arguments');
  }

  return markers;
}

async function computeHash(content: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await supabase
    .from('profiles').select('id').eq('user_id', user.id).single();
  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });

  const { data: uploads } = await supabase
    .from('uploaded_files').select('*').eq('profile_id', profile.id).order('created_at', { ascending: false });

  return NextResponse.json(uploads || []);
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
  if (!file) return NextResponse.json({ error: 'file is required' }, { status: 400 });

  // Validate file type
  const fileType = detectFileType(file.name);
  if (!fileType) {
    return NextResponse.json({
      error: 'Unsupported file type. Upload CLAUDE.md, .cursorrules, MCP configs, or skill files.',
    }, { status: 400 });
  }

  // Read content
  const content = await file.text();

  // Size limits
  if (content.length > 500_000) {
    return NextResponse.json({ error: 'File too large (max 500KB)' }, { status: 400 });
  }

  // Compute hash for uniqueness check
  const contentHash = await computeHash(content);

  // Check global uniqueness
  const admin = createAdminClient();
  const { data: existing } = await admin
    .from('uploaded_files')
    .select('id, profile_id')
    .eq('content_hash', contentHash)
    .single();

  if (existing) {
    if (existing.profile_id === profile.id) {
      return NextResponse.json({ error: 'You have already uploaded this file' }, { status: 409 });
    }
    return NextResponse.json({
      error: 'This file has already been uploaded by another member. Please upload your original work.',
    }, { status: 409 });
  }

  // Parse structural markers
  const lineCount = content.split('\n').length;
  const markers = detectStructuralMarkers(content, fileType);
  const isParsedValid = markers.length >= 2;

  // Upload to Supabase Storage
  const storagePath = `uploads/${profile.id}/${Date.now()}-${file.name}`;
  const { error: storageError } = await admin.storage
    .from('files')
    .upload(storagePath, content, { contentType: 'text/plain' });

  if (storageError) {
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }

  const { data: publicUrl } = admin.storage.from('files').getPublicUrl(storagePath);

  // Insert record
  const { data: upload, error } = await admin
    .from('uploaded_files')
    .insert({
      profile_id: profile.id,
      file_type: fileType,
      file_name: file.name,
      content_hash: contentHash,
      file_size: content.length,
      line_count: lineCount,
      is_parsed_valid: isParsedValid,
      structural_markers_found: markers,
      parsing_notes: isParsedValid ? null : 'File lacks expected structural markers for its type',
      storage_url: publicUrl.publicUrl,
    })
    .select()
    .single();

  if (error) {
    console.error('Upload error:', error.message);
    return NextResponse.json({ error: 'Operation failed' }, { status: 400 });
  }
  return NextResponse.json(upload);
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

  const { data: profile } = await supabase
    .from('profiles').select('id').eq('user_id', user.id).single();
  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });

  const { error } = await supabase
    .from('uploaded_files').delete().eq('id', id).eq('profile_id', profile.id);

  if (error) {
    console.error('Upload error:', error.message);
    return NextResponse.json({ error: 'Operation failed' }, { status: 400 });
  }
  return NextResponse.json({ success: true });
}
