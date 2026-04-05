import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { verifyProof } from '@/lib/proofs/verify';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { proof_id } = await request.json();
  if (!proof_id) {
    return NextResponse.json({ error: 'proof_id is required' }, { status: 400 });
  }

  // Verify ownership
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .single();

  const admin = createAdminClient();
  const { data: proof } = await admin
    .from('external_proofs')
    .select('*')
    .eq('id', proof_id)
    .eq('profile_id', profile?.id)
    .single();

  if (!proof) {
    return NextResponse.json({ error: 'Proof not found' }, { status: 404 });
  }

  const result = await verifyProof(proof.project_url);

  await admin.from('external_proofs').update({
    verification_status: result.verification_status,
    verification_method: result.verification_method,
    platform_data: result.platform_data,
    verified_at: result.verification_status === 'verified' ? new Date().toISOString() : null,
    proof_score: result.verification_status === 'verified'
      ? (result.source_type !== 'custom_url' ? 25 : 15)
      : 5,
  }).eq('id', proof_id);

  return NextResponse.json(result);
}
