import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyMetaTag } from '@/lib/proofs/meta-verify';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { item_id } = await request.json();
  if (!item_id) {
    return NextResponse.json({ error: 'item_id is required' }, { status: 400 });
  }

  const { data: profile } = await supabase
    .from('profiles').select('id').eq('user_id', user.id).single();

  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  }

  const { data: item } = await supabase
    .from('portfolio_items')
    .select('*')
    .eq('id', item_id)
    .eq('profile_id', profile.id)
    .single();

  if (!item) {
    return NextResponse.json({ error: 'Portfolio item not found' }, { status: 404 });
  }

  if (!item.url) {
    return NextResponse.json({ error: 'Portfolio item has no URL to verify' }, { status: 400 });
  }

  if (item.verification_status === 'verified') {
    return NextResponse.json({ already_verified: true, message: 'Already verified' });
  }

  // Check for gtmcommit backlink on the page
  const result = await verifyMetaTag(item.url, '__portfolio_check__');

  if (result.found && result.method === 'backlink') {
    await supabase
      .from('portfolio_items')
      .update({ verification_status: 'verified' })
      .eq('id', item_id);

    // Trigger score recalculation in the background
    const origin = request.headers.get('origin') || request.headers.get('host') || '';
    const baseUrl = origin.startsWith('http') ? origin : `https://${origin}`;
    fetch(`${baseUrl}/api/score/calculate`, {
      method: 'POST',
      headers: { cookie: request.headers.get('cookie') || '' },
    }).catch(() => {});

    return NextResponse.json({
      verified: true,
      message: 'Verified! GTM Commit link detected on your project.',
    });
  }

  return NextResponse.json({
    verified: false,
    message: 'GTM Commit link not found on your project. Add a badge or link to gtmcommit.com to verify ownership.',
  });
}
