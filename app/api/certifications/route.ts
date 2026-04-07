import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyCertification, detectIssuerFromUrl } from '@/lib/proofs/certification';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await supabase
    .from('profiles').select('id').eq('user_id', user.id).single();
  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });

  const { data: certs } = await supabase
    .from('certifications').select('*').eq('profile_id', profile.id).order('created_at', { ascending: false });

  return NextResponse.json(certs || []);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await supabase
    .from('profiles').select('id').eq('user_id', user.id).single();
  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });

  const body = await request.json();
  const { cert_name, cert_url, cert_id, issued_at } = body;

  if (!cert_name || !cert_url) {
    return NextResponse.json({ error: 'cert_name and cert_url are required' }, { status: 400 });
  }

  const issuer = detectIssuerFromUrl(cert_url);
  const verification = verifyCertification(cert_url);

  const { data: cert, error } = await supabase
    .from('certifications')
    .insert({
      profile_id: profile.id,
      cert_name,
      issuer,
      cert_url,
      cert_id: cert_id || null,
      issued_at: issued_at || null,
      verification_status: verification.verification_status,
      verification_method: verification.verification_method,
      verified_at: verification.verification_status === 'auto_verified' ? new Date().toISOString() : null,
    })
    .select()
    .single();

  if (error) {
    console.error('Certification error:', error.message);
    return NextResponse.json({ error: 'Operation failed' }, { status: 400 });
  }
  return NextResponse.json(cert);
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
    .from('certifications').delete().eq('id', id).eq('profile_id', profile.id);

  if (error) {
    console.error('Certification error:', error.message);
    return NextResponse.json({ error: 'Operation failed' }, { status: 400 });
  }
  return NextResponse.json({ success: true });
}
