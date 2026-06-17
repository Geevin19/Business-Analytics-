import nodemailer from 'nodemailer'
import type { Transporter } from 'nodemailer'

const GMAIL_USER = process.env.GMAIL_USER!
const GMAIL_PASS = process.env.GMAIL_APP_PASSWORD!

let transporter: Transporter

async function initTransporter(): Promise<Transporter> {
  // 1) Try Gmail SMTP with app password
  if (GMAIL_USER && GMAIL_PASS) {
    const gmail = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: { user: GMAIL_USER, pass: GMAIL_PASS },
      tls: { rejectUnauthorized: false },
    })

    try {
      await gmail.verify()
      console.log(`✅ Gmail SMTP ready — sending as BizAnalytics <${GMAIL_USER}>`)
      return gmail
    } catch (err: any) {
      console.warn(`⚠️  Gmail SMTP rejected (${err.message}) — falling back to Ethereal`)
    }
  }

  // 2) Fallback: auto-create an Ethereal test account (perfect for dev)
  try {
    const testAccount = await nodemailer.createTestAccount()
    const ethereal = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: { user: testAccount.user, pass: testAccount.pass },
      tls: { rejectUnauthorized: false },
    })
    console.log(`✅ Ethereal SMTP ready — preview emails at https://ethereal.email/login`)
    console.log(`   📧 User: ${testAccount.user}`)
    console.log(`   🔑 Pass: ${testAccount.pass}`)
    return ethereal
  } catch (err: any) {
    console.error('❌ Failed to create Ethereal account:', err.message)
    // 3) Last resort: a dummy transporter that logs instead of sending
    console.warn('⚠️  No SMTP available — emails will be logged to console only')
    return nodemailer.createTransport({
      host: 'localhost',
      port: 1025,
      ignoreTLS: true,
    } as any)
  }
}

// Initialize transporter on first import
const transporterPromise = initTransporter()

// All sends are non-blocking — a failed email never breaks a login/register
async function safeSend(to: string, subject: string, html: string, label: string) {
  try {
    const t = await transporterPromise
    const info = await t.sendMail({ from: `BizAnalytics <${GMAIL_USER || 'noreply@bizanalytics.dev'}>`, to, subject, html })
    console.log(`✅ Email [${label}] → ${to}`)
    // If using Ethereal, print the preview URL
    if (info.messageId && nodemailer.getTestMessageUrl(info)) {
      console.log(`   📬 Preview: ${nodemailer.getTestMessageUrl(info)}`)
    }
  } catch (err: any) {
    console.warn(`⚠️  Email [${label}] skipped:`, err.message)
  }
}

function base(body: string) {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:20px;background:#060d1a;font-family:Inter,Arial,sans-serif">
<div style="max-width:520px;margin:0 auto;background:#0b1220;border-radius:14px;border:1px solid #2d3748">
  <div style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:24px 32px;text-align:center;border-radius:14px 14px 0 0">
    <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700">BizAnalytics</h1>
    <p style="margin:4px 0 0;color:rgba(255,255,255,0.65);font-size:13px">Business Intelligence Platform</p>
  </div>
  <div style="padding:32px;color:#f1f5f9">${body}</div>
  <div style="padding:16px 32px;border-top:1px solid #1e2a3a;text-align:center;background:#080e1c;border-radius:0 0 14px 14px">
    <p style="margin:0;color:rgba(241,245,249,0.2);font-size:11px">© ${new Date().getFullYear()} BizAnalytics. All rights reserved.</p>
  </div>
</div></body></html>`
}

function btn(href: string, label: string) {
  return `<a href="${href}" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;margin-top:8px">${label}</a>`
}

export async function sendWelcomeEmail(to: string, name: string, verificationLink?: string | null) {
  const body = verificationLink
    ? `
    <h2 style="margin:0 0 12px;font-size:20px;color:#f1f5f9">Welcome aboard, ${name}!</h2>
    <p style="margin:0 0 20px;color:rgba(241,245,249,0.65);line-height:1.7;font-size:14px">
      Your BizAnalytics account has been created. Please verify your email address
      by clicking the button below to activate your account.
    </p>
    ${btn(verificationLink, 'Verify My Email')}
    <p style="margin:24px 0 0;color:rgba(241,245,249,0.3);font-size:12px">
      This link expires in 24 hours. If you didn't create this account, ignore this email.
    </p>`
    : `
    <h2 style="margin:0 0 12px;font-size:20px;color:#f1f5f9">Welcome aboard, ${name}!</h2>
    <p style="margin:0 0 20px;color:rgba(241,245,249,0.65);line-height:1.7;font-size:14px">
      Your BizAnalytics account is ready. Monitor KPIs, track sales, generate reports,
      and get AI-powered insights — all in one dashboard.
    </p>
    ${btn('http://localhost:3000/dashboard', 'Open My Dashboard')}
    <p style="margin:24px 0 0;color:rgba(241,245,249,0.25);font-size:12px">
      If you didn't create this account, ignore this email.
    </p>`

  await safeSend(to, `Welcome to BizAnalytics, ${name}!`, base(body), 'welcome')
}

export async function sendPasswordResetEmail(to: string, resetLink: string) {
  await safeSend(to, 'BizAnalytics — Reset your password', base(`
    <h2 style="margin:0 0 12px;font-size:20px;color:#f1f5f9">Reset your password</h2>
    <p style="margin:0 0 20px;color:rgba(241,245,249,0.65);line-height:1.7;font-size:14px">
      We received a request to reset your BizAnalytics password. Click below to set a new one.
    </p>
    ${btn(resetLink, 'Reset My Password')}
    <p style="margin:24px 0 0;color:rgba(241,245,249,0.3);font-size:12px">
      Didn't request this? Ignore this email. Link expires in 1 hour.
    </p>
  `), 'password-reset')
}

export async function sendLoginAlertEmail(to: string, name: string) {
  const time = new Date().toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' })
  await safeSend(to, 'BizAnalytics — New sign-in detected', base(`
    <h2 style="margin:0 0 12px;font-size:20px;color:#f1f5f9">New sign-in to your account</h2>
    <p style="margin:0 0 16px;color:rgba(241,245,249,0.65);line-height:1.7;font-size:14px">
      Hi <strong style="color:#f1f5f9">${name}</strong>, a new sign-in was detected on your BizAnalytics account.
    </p>
    <div style="background:rgba(255,255,255,0.05);border-radius:8px;padding:16px;margin-bottom:20px;font-size:13px;color:rgba(241,245,249,0.7)">
      <div><strong style="color:#f1f5f9">Time:</strong> ${time}</div>
    </div>
    ${btn('http://localhost:3000/auth/forgot-password', 'Secure My Account')}
    <p style="margin:20px 0 0;color:rgba(241,245,249,0.25);font-size:12px">If this was you, no action needed.</p>
  `), 'login-alert')
}

export async function sendNotificationEmail(to: string, title: string, message: string) {
  await safeSend(to, `BizAnalytics — ${title}`, base(`
    <h2 style="margin:0 0 12px;font-size:20px;color:#f1f5f9">${title}</h2>
    <p style="margin:0 0 20px;color:rgba(241,245,249,0.65);line-height:1.7;font-size:14px">${message}</p>
    ${btn('http://localhost:3000/notifications', 'View Notifications')}
  `), 'notification')
}