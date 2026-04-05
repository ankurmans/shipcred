import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { verifyProof } from '@/lib/proofs/verify';
import { verifyDeploymentContent, isOldEnoughToVerify } from '@/lib/proofs/anti-gaming';

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

  // Anti-gaming: 24hr minimum age check
  if (!isOldEnoughToVerify(proof.created_at)) {
    return NextResponse.json(
      { error: 'Deployments must be at least 24 hours old before verification.' },
      { status: 400 }
    );
  }

  // Run platform verification
  const result = await verifyProof(proof.project_url);

  // Anti-gaming: blank template detection for verified URLs
  // Skip for automation platforms — they render platform UI, not user HTML
  const SKIP_CONTENT_CHECK = ['clay', 'n8n', 'make'];
  if (result.verification_status === 'verified' && !SKIP_CONTENT_CHECK.includes(result.source_type)) {
    const contentCheck = await verifyDeploymentContent(proof.project_url);
    if (!contentCheck.valid) {
      await admin.from('external_proofs').update({
        verification_status: 'failed',
        verification_method: result.verification_method,
        platform_data: { ...result.platform_data, anti_gaming: contentCheck.reason },
        proof_score: 0,
      }).eq('id', proof_id);

      return NextResponse.json({
        ...result,
        verification_status: 'failed',
        anti_gaming_reason: contentCheck.reason,
      });
    }
  }

  // URL-only verification = lower score. Ownership verification (meta tag) gives higher score.
  const proofScore = result.verification_status === 'verified'
    ? (proof.ownership_verified ? 30 : (result.source_type !== 'custom_url' ? 15 : 10))
    : 5;

  await admin.from('external_proofs').update({
    verification_status: result.verification_status,
    verification_method: result.verification_method,
    platform_data: result.platform_data,
    verified_at: result.verification_status === 'verified' ? new Date().toISOString() : null,
    proof_score: proofScore,
  }).eq('id', proof_id);

  // Trigger score recalculation in the background
  const origin = request.headers.get('origin') || request.headers.get('host') || '';
  const baseUrl = origin.startsWith('http') ? origin : `https://${origin}`;
  fetch(`${baseUrl}/api/score/calculate`, {
    method: 'POST',
    headers: { cookie: request.headers.get('cookie') || '' },
  }).catch(() => {});

  return NextResponse.json(result);
}
