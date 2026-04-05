const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://gtmcommit.com';

export function welcomeEmail(displayName: string, username: string): { subject: string; html: string } {
  return {
    subject: `Welcome to GTM Commit, ${displayName}!`,
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
      <h1 style="font-size:24px;font-weight:700;color:#1a1a1a;text-align:center;margin:0 0 8px">Welcome, ${displayName}!</h1>
      <p style="color:#666;text-align:center;margin:0 0 24px;font-size:15px">Your profile is live. Here's what to do next:</p>
      <div style="background:#f7f8fa;border-radius:12px;padding:20px;margin-bottom:24px">
        <div style="margin-bottom:12px"><strong style="color:#1a1a1a">1. Connect GitHub</strong><br><span style="color:#666;font-size:14px">We'll auto-detect your AI-assisted commits</span></div>
        <div style="margin-bottom:12px"><strong style="color:#1a1a1a">2. Add Proof of Work</strong><br><span style="color:#666;font-size:14px">Videos, content, certifications, deployed projects</span></div>
        <div><strong style="color:#1a1a1a">3. Share Your Profile</strong><br><span style="color:#666;font-size:14px">Drop <code style="background:#fff7ed;color:#FF5C00;padding:2px 6px;border-radius:4px;font-size:13px">gtmcommit.com/${username}</code> on LinkedIn</span></div>
      </div>
      <div style="text-align:center">
        <a href="${APP_URL}/dashboard" style="display:inline-block;background:#FF5C00;color:#fff;padding:12px 32px;border-radius:999px;font-weight:600;font-size:15px;text-decoration:none">Go to Dashboard</a>
      </div>
      <p style="color:#ccc;font-size:12px;text-align:center;margin-top:32px">Talk is cheap. Commits aren't.</p>
    </div>
  </div>
</body>
</html>`,
  };
}
