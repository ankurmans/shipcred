const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://gtmcommit.com';

export function vouchReceivedEmail(
  recipientName: string,
  voucherName: string,
  message: string | null,
  username: string,
): { subject: string; html: string } {
  return {
    subject: `${voucherName} vouched for you on GTM Commit!`,
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
      <h1 style="font-size:24px;font-weight:700;color:#1a1a1a;text-align:center;margin:0 0 8px">New Vouch!</h1>
      <p style="color:#666;text-align:center;margin:0 0 24px;font-size:15px"><strong>${voucherName}</strong> vouched for your work.</p>
      ${message ? `<div style="background:#f7f8fa;border-radius:12px;padding:16px;margin-bottom:24px;font-style:italic;color:#666;font-size:14px">"${message}"</div>` : ''}
      <p style="color:#666;font-size:14px;text-align:center;margin-bottom:24px">Community vouches boost your score. Keep shipping!</p>
      <div style="text-align:center">
        <a href="${APP_URL}/${username}" style="display:inline-block;background:#FF5C00;color:#fff;padding:12px 32px;border-radius:999px;font-weight:600;font-size:15px;text-decoration:none">View Profile</a>
      </div>
      <p style="color:#ccc;font-size:12px;text-align:center;margin-top:32px">Talk is cheap. Commits aren't.</p>
    </div>
  </div>
</body>
</html>`,
  };
}
