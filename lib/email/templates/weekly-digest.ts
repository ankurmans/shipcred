const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://gtmcommit.com';

export function weeklyDigestEmail(
  displayName: string,
  username: string,
  score: number,
  tier: string,
  rank: number | null,
  viewsThisWeek: number,
): { subject: string; html: string } {
  const tierLabel = tier.charAt(0).toUpperCase() + tier.slice(1);

  return {
    subject: `Your weekly GTM Commit digest — Score: ${score}`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f7f8fa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <div style="max-width:560px;margin:0 auto;padding:40px 20px">
    <div style="background:#fff;border-radius:16px;padding:40px;border:1px solid #f3f4f6">
      <div style="text-align:center;margin-bottom:24px">
        <div style="display:inline-block;background:linear-gradient(135deg,#FF5C00,#FF8533);color:#fff;font-weight:800;font-size:18px;padding:8px 20px;border-radius:20px">GTM Commit</div>
      </div>
      <h1 style="font-size:24px;font-weight:700;color:#1a1a1a;text-align:center;margin:0 0 16px">Weekly Digest</h1>
      <div style="display:flex;gap:16px;margin-bottom:24px">
        <div style="flex:1;background:#f7f8fa;border-radius:12px;padding:16px;text-align:center">
          <div style="font-size:32px;font-weight:800;color:#FF5C00">${score}</div>
          <div style="font-size:13px;color:#666">Score</div>
        </div>
        <div style="flex:1;background:#f7f8fa;border-radius:12px;padding:16px;text-align:center">
          <div style="font-size:32px;font-weight:800;color:#1a1a1a">${tierLabel}</div>
          <div style="font-size:13px;color:#666">Tier</div>
        </div>
        <div style="flex:1;background:#f7f8fa;border-radius:12px;padding:16px;text-align:center">
          <div style="font-size:32px;font-weight:800;color:#1a1a1a">${viewsThisWeek}</div>
          <div style="font-size:13px;color:#666">Views</div>
        </div>
      </div>
      ${rank ? `<p style="color:#666;font-size:14px;text-align:center;margin-bottom:24px">You're ranked <strong>#${rank}</strong> on the leaderboard.</p>` : ''}
      <div style="text-align:center">
        <a href="${APP_URL}/dashboard" style="display:inline-block;background:#FF5C00;color:#fff;padding:12px 32px;border-radius:999px;font-weight:600;font-size:15px;text-decoration:none">View Dashboard</a>
      </div>
      <p style="color:#ccc;font-size:12px;text-align:center;margin-top:32px">Talk is cheap. Commits aren't.</p>
    </div>
  </div>
</body>
</html>`,
  };
}
