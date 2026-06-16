import nodemailer from 'nodemailer'

// Verify env vars on startup
const GMAIL_USER = process.env.GMAIL_USER!
const GMAIL_PASS = process.env.GMAIL_APP_PASSWORD!

if (!GMAIL_USER || !GMAIL_PASS) {
  console.error('❌ GMAIL_USER or GMAIL_APP_PASSWORD not set in .env')
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
})

// Verify connection on startup
transporter.verify((error) => {
  if (error) {
    console.error('❌ Gmail SMTP connection failed:', error.message)
    console.error('   Check GMAIL_USER and GMAIL_APP_PASSWORD in backend/.env')
  } else {
    console.log('✅ Gmail SMTP ready — sending as BizAnalytics')
  }
})

const FROM = `BizAnalytics <${GMAIL_USER}>`

function baseTemplate(content: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:20px;background:#060d1a;font-family:Inter,Arial,sans-serif">
  <div style="max-width:520px;margin:0 auto;background:#0b1220;border-radius:14px;overflow:hidden;border:1px solid #2d3748;box-shadow:0 8px 32px rgba(0,0,0,0.4)">
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%);padding:28px 32px;text-align:center">
      <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.3px">BizAnalytics</h1>
      <p style="margin:6px 0 0;color:rgba(255,255,255,0.65);font-size:13px">Business Intelligence Platform</p>
    </div>
    <!-- Body -->
    <div style="padding:32px;color:#f1f5f9">
      ${content}
    </div>
    <!-- Footer -->
    <div style="padding:16px 32px;border-top:1px solid #1e2a3a;text-align:center;background:#080e1c">
      <p style="margin:0;color:rgba(241,245,249,0.2);font-size:11px">
        © ${new Date().getFullYear()} BizAnalytics. All rights reserved.<br/>
        This email was sent from an automated system. Please do not reply.
      </p>
    </div>
  </div>
</body>
</html>`
}

function btn(href: string, label: string): string {
  return `<a href="${href}" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#ffffff;padding:13px 30px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;margin-top:4px">${label}</a>`
}

// ── Welcome email on signup ───────────────────────────────────────────────
export async function sendWelcomeEmail(to: string, name: string): Promise<void> {
  await transporter.sendMail({
    from: FROM,
    to,
    subject: `Welcome to BizAnalytics, ${name}!`,
    html: baseTemplate(`
      <h2 style="margin:0 0 14px;font-size:20px;color:#f1f5f9">Welcome aboard, ${name}! 🎉</h2>
      <p style="margin:0 0 8px;color:rgba(241,245,249,0.65);line-height:1.7;font-size:14px">
        Your BizAnalytics account is active and ready to use.
      </p>
      <p style="margin:0 0 24px;color:rgba(241,245,249,0.65);line-height:1.7;font-size:14px">
        You can now monitor KPIs, track sales, generate reports, and get AI-powered predictions — all in one dashboard.
      </p>
      ${btn('http://localhost:3000/dashboard', 'Open My Dashboard')}
      <p style="margin:28px 0 0;color:rgba(241,245,249,0.25);font-size:12px">
        If you didn't create this account, please ignore this email.
      </p>
    `),
  })
  console.log(`✅ Welcome email sent to ${to}`)
}

// ── Password reset email ──────────────────────────────────────────────────
export async function sendPasswordResetEmail(to: string, resetLink: string): Promise<void> {
  await transporter.sendMail({
    from: FROM,
    to,
    subject: 'BizAnalytics — Reset your password',
    html: baseTemplate(`
      <h2 style="margin:0 0 14px;font-size:20px;color:#f1f5f9">Reset your password</h2>
      <p style="margin:0 0 24px;color:rgba(241,245,249,0.65);line-height:1.7;font-size:14px">
        We received a request to reset the password for your BizAnalytics account. 
        Click the button below to choose a new password.
      </p>
      ${btn(resetLink, 'Reset My Password')}
      <div style="margin-top:24px;padding:14px 16px;background:rgba(255,255,255,0.04);border-radius:8px;border-left:3px solid #6366f1">
        <p style="margin:0;color:rgba(241,245,249,0.45);font-size:12px;line-height:1.6">
          ⏱ This link expires in <strong style="color:rgba(241,245,249,0.7)">1 hour</strong>.<br/>
          🔒 If you didn't request this reset, your password is safe — just ignore this email.
        </p>
      </div>
    `),
  })
  console.log(`✅ Password reset email sent to ${to}`)
}

// ── Login alert email ─────────────────────────────────────────────────────
export async function sendLoginAlertEmail(to: string, name: string): Promise<void> {
  const time = new Date().toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' })
  await transporter.sendMail({
    from: FROM,
    to,
    subject: 'BizAnalytics — New sign-in to your account',
    html: baseTemplate(`
      <h2 style="margin:0 0 14px;font-size:20px;color:#f1f5f9">New sign-in detected</h2>
      <p style="margin:0 0 20px;color:rgba(241,245,249,0.65);line-height:1.7;font-size:14px">
        Hi <strong style="color:#f1f5f9">${name}</strong>, we noticed a new sign-in to your BizAnalytics account.
      </p>
      <div style="background:rgba(255,255,255,0.05);border-radius:10px;padding:18px 20px;margin-bottom:24px;font-size:13px;color:rgba(241,245,249,0.7);line-height:1.8">
        <div>📅 <strong style="color:#f1f5f9">Time:</strong> ${time}</div>
        <div>🌐 <strong style="color:#f1f5f9">Platform:</strong> BizAnalytics Web App</div>
      </div>
      <p style="margin:0 0 16px;color:rgba(241,245,249,0.5);font-size:13px">
        If this was you, no action is needed.
      </p>
      ${btn('http://localhost:3000/auth/forgot-password', 'Secure My Account')}
      <p style="margin:20px 0 0;color:rgba(241,245,249,0.25);font-size:12px">
        If this was you, ignore this email.
      </p>
    `),
  })
  console.log(`✅ Login alert email sent to ${to}`)
}

// ── Business notification email ───────────────────────────────────────────
export async function sendNotificationEmail(to: string, title: string, message: string): Promise<void> {
  await transporter.sendMail({
    from: FROM,
    to,
    subject: `BizAnalytics — ${title}`,
    html: baseTemplate(`
      <h2 style="margin:0 0 14px;font-size:20px;color:#f1f5f9">${title}</h2>
      <p style="margin:0 0 24px;color:rgba(241,245,249,0.65);line-height:1.7;font-size:14px">${message}</p>
      ${btn('http://localhost:3000/notifications', 'View All Notifications')}
    `),
  })
  console.log(`✅ Notification email sent to ${to}: ${title}`)
}
