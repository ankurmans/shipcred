import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { reVerifyProof } from '@/lib/proofs/anti-gaming';
import { calculateGtmCommitScore, scoreToTier } from '@/lib/scoring/calculate';

// Weekly cron job to re-verify all verified external proofs
// Call this from Vercel Cron or an external scheduler
// Secured by CRON_SECRET env var

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admin = createAdminClient();

  const { data: proofs } = await admin
    .from('external_proofs')
    .select('id, project_url, profile_id')
    .eq('verification_status', 'verified');

  if (!proofs || proofs.length === 0) {
    return NextResponse.json({ message: 'No proofs to re-verify', checked: 0 });
  }

  let failed = 0;
  const affectedProfiles = new Set<string>();

  for (const proof of proofs) {
    const stillLive = await reVerifyProof(proof.project_url);

    if (!stillLive) {
      await admin.from('external_proofs').update({
        verification_status: 'failed',
        proof_score: 0,
      }).eq('id', proof.id);

      failed++;
      affectedProfiles.add(proof.profile_id);
    }
  }

  // Recalculate scores for affected profiles
  for (const profileId of affectedProfiles) {
    const [commitsRes, portfolioRes, vouchesRes, toolsRes, proofsRes, videosRes, contentRes, certsRes, uploadsRes, profileRes] = await Promise.all([
      admin.from('github_commits').select('ai_tool_detected, committed_at, repo_full_name').eq('profile_id', profileId),
      admin.from('portfolio_items').select('vouch_count').eq('profile_id', profileId),
      admin.from('vouches').select('id').eq('vouchee_id', profileId),
      admin.from('tool_declarations').select('is_verified, tool_name').eq('profile_id', profileId),
      admin.from('external_proofs').select('verification_status, source_type').eq('profile_id', profileId),
      admin.from('video_proofs').select('url_verified, duration_seconds, category, vouch_count').eq('profile_id', profileId),
      admin.from('content_proofs').select('url_verified, platform, vouch_count').eq('profile_id', profileId),
      admin.from('certifications').select('verification_status, issuer, vouch_count').eq('profile_id', profileId),
      admin.from('uploaded_files').select('is_parsed_valid, vouch_count, file_type').eq('profile_id', profileId),
      admin.from('profiles').select('bio, avatar_url, display_name, website_url, linkedin_url, twitter_handle, role').eq('id', profileId).single(),
    ]);

    const p = profileRes.data;
    const score = calculateGtmCommitScore({
      commits: commitsRes.data || [],
      portfolioItems: portfolioRes.data || [],
      vouchCount: vouchesRes.data?.length || 0,
      toolDeclarations: toolsRes.data || [],
      externalProofs: proofsRes.data || [],
      videoProofs: videosRes.data || [],
      contentProofs: contentRes.data || [],
      certifications: certsRes.data || [],
      uploadedFiles: uploadsRes.data || [],
      profile: p ? { bio: p.bio, avatar_url: p.avatar_url, display_name: p.display_name, website_url: p.website_url, linkedin_url: p.linkedin_url, twitter_handle: p.twitter_handle, role: p.role } : undefined,
    });

    const tier = scoreToTier(score.total);

    await admin.from('profiles').update({
      gtmcommit_score: score.total,
      gtmcommit_tier: tier,
      score_breakdown: score,
    }).eq('id', profileId);
  }

  return NextResponse.json({
    checked: proofs.length,
    failed,
    profilesRecalculated: affectedProfiles.size,
  });
}
