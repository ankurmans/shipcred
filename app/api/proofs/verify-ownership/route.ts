import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { verifyMetaTag } from '@/lib/proofs/meta-verify';

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

  if (!proof.verification_code) {
    return NextResponse.json({ error: 'No verification code for this proof' }, { status: 400 });
  }

  if (proof.ownership_verified) {
    return NextResponse.json({ already_verified: true, message: 'Ownership already verified' });
  }

  // Check meta tag
  const result = await verifyMetaTag(proof.project_url, proof.verification_code);

  if (result.found) {
    // Upgrade the proof
    await admin.from('external_proofs').update({
      ownership_verified: true,
      ownership_verified_at: result.checkedAt,
      verification_status: 'verified',
      verification_method: 'meta_tag',
      verified_at: result.checkedAt,
      proof_score: proof.source_type !== 'custom_url' ? 30 : 20,
    }).eq('id', proof_id);

    return NextResponse.json({
      verified: true,
      message: 'Ownership verified! Meta tag found.',
    });
  }

  return NextResponse.json({
    verified: false,
    message: `Meta tag not found. Make sure your site's <head> contains: <meta name="gtmcommit-verify" content="${proof.verification_code}">`,
  });
}
