import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyMetaTag } from '@/lib/proofs/meta-verify';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  }

  const { data: items } = await supabase
    .from('portfolio_items')
    .select('*')
    .eq('profile_id', profile.id)
    .order('display_order');

  return NextResponse.json(items || []);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  }

  const body = await request.json();

  // If a URL is provided, check for gtmcommit backlink/meta tag ownership
  let verificationStatus = 'self_reported';
  if (body.url) {
    try {
      // Use a dummy code — verifyMetaTag checks both meta tag AND backlinks
      const result = await verifyMetaTag(body.url, '__portfolio_check__');
      if (result.found && result.method === 'backlink') {
        verificationStatus = 'verified';
      }
    } catch {
      // Verification failed — stay as self_reported
    }
  }

  const { data: item, error } = await supabase
    .from('portfolio_items')
    .insert({
      profile_id: profile.id,
      title: body.title,
      description: body.description || null,
      url: body.url || null,
      screenshot_url: body.screenshot_url || null,
      category: body.category || null,
      tools_used: body.tools_used || [],
      verification_status: verificationStatus,
    })
    .select()
    .single();

  if (error) {
    console.error('Portfolio creation error:', error.message);
    return NextResponse.json({ error: 'Failed to add portfolio item' }, { status: 400 });
  }

  // Trigger score recalculation in the background
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://gtmcommit.com';
  fetch(`${baseUrl}/api/score/calculate`, {
    method: 'POST',
    headers: { cookie: request.headers.get('cookie') || '' },
  }).catch(() => {});

  return NextResponse.json(item);
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await supabase
    .from('profiles').select('id').eq('user_id', user.id).single();
  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });

  const body = await request.json();
  const { id, title, description, url, category, tools_used } = body;
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

  const updates: Record<string, unknown> = {};
  if (title !== undefined) updates.title = title;
  if (description !== undefined) updates.description = description || null;
  if (url !== undefined) updates.url = url || null;
  if (category !== undefined) updates.category = category || null;
  if (tools_used !== undefined) updates.tools_used = tools_used;

  const { data: item, error } = await supabase
    .from('portfolio_items')
    .update(updates)
    .eq('id', id)
    .eq('profile_id', profile.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(item);
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 });
  }

  const { error } = await supabase
    .from('portfolio_items')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Portfolio deletion error:', error.message);
    return NextResponse.json({ error: 'Failed to delete portfolio item' }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
