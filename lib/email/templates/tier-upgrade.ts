const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://gtmcommit.com';

const TIER_SYMBOL: Record<string, string> = {
  shipper: '[Shipper]',
  builder: '[Builder]',
  captain: '[Captain]',
  legend: '[Legend]',
};

export function tierUpgradeEmail(
  displayName: string,
  username: string,
  newTier: string,
  score: number,
): { subject: string; html: string } {
  const tierLabel = newTier.charAt(0).toUpperCase() + newTier.slice(1);
  return {
    subject: `You're now a ${tierLabel} on GTM Commit!`,
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
      <div style="text-align:center;font-size:32px;font-weight:800;color:#FF5C00;margin-bottom:16px">${TIER_SYMBOL[newTier] || tierLabel}</div>
      <h1 style="font-size:24px;font-weight:700;color:#1a1a1a;text-align:center;margin:0 0 8px">${tierLabel} Tier Unlocked!</h1>
      <p style="color:#666;text-align:center;margin:0 0 24px;font-size:15px">${displayName}, your GTM Commit Score is now <strong style="color:#FF5C00">${score}</strong>.</p>
      <div style="background:#f7f8fa;border-radius:12px;padding:20px;margin-bottom:24px;text-align:center">
        <p style="color:#666;font-size:14px;margin:0">Share this achievement! Drop your profile on LinkedIn and let people know you're a verified ${tierLabel}.</p>
      </div>
      <div style="text-align:center">
        <a href="${APP_URL}/${username}" style="display:inline-block;background:#FF5C00;color:#fff;padding:12px 32px;border-radius:999px;font-weight:600;font-size:15px;text-decoration:none">Share Your Profile</a>
      </div>
      <p style="color:#ccc;font-size:12px;text-align:center;margin-top:32px">Talk is cheap. Commits aren't.</p>
    </div>
  </div>
</body>
</html>`,
  };
}
