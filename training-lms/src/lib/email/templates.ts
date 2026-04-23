// HTML email templates for the Training LMS

/**
 * Format a date string like "April 28, 2026"
 */
function formatDateLong(dateStr: string): string {
  if (!dateStr) return 'TBD'
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return dateStr
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

/**
 * Generate the welcome email HTML for a new trainee.
 * Based on the approved design in welcome-email-preview.html.
 */
export function generateWelcomeEmailHTML(params: {
  fullName: string
  role: string
  trainingStartDate: string
  dashboardUrl?: string
}): string {
  const {
    fullName,
    role,
    trainingStartDate,
    dashboardUrl = 'https://storehub-learning-hub.vercel.app/dashboard/my-training',
  } = params

  const formattedDate = formatDateLong(trainingStartDate)

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Welcome to StoreHub Training</title>
</head>
<body style="margin:0;padding:0;background:#f5f4f3;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<div style="max-width:600px;margin:0 auto;padding:20px;">

  <!-- Header -->
  <div style="background:#1a1a1a;border-radius:16px 16px 0 0;padding:40px 36px 32px;text-align:center;">
    <div style="font-size:28px;margin-bottom:8px;">&#127891;</div>
    <h1 style="color:#ffffff;margin:0;font-size:24px;font-weight:600;letter-spacing:-0.3px;">Welcome to the Team!</h1>
    <p style="color:#a09d9a;margin:8px 0 0;font-size:14px;">Your training journey starts here</p>
  </div>

  <!-- Body -->
  <div style="background:#ffffff;padding:36px;border-radius:0 0 16px 16px;">

    <!-- Greeting -->
    <p style="color:#1a1a1a;font-size:16px;line-height:1.6;margin:0 0 20px;">
      Hi <strong>${escapeHtml(fullName)}</strong>,
    </p>
    <p style="color:#3d3b39;font-size:15px;line-height:1.7;margin:0 0 28px;">
      Welcome to StoreHub! I'm Andrea, and I'll be guiding you through your learning journey as you settle into your new role. We're excited to have you on board!
    </p>

    <!-- Start Date Card -->
    <div style="background:#fef7f0;border-left:4px solid #f06523;border-radius:8px;padding:20px 24px;margin-bottom:28px;">
      <div style="color:#a09d9a;font-size:12px;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">Training Starts</div>
      <div style="color:#1a1a1a;font-size:20px;font-weight:600;">${escapeHtml(formattedDate)}</div>
      <div style="color:#6b6966;font-size:13px;margin-top:4px;">Role: ${escapeHtml(role)}</div>
    </div>

    <!-- CTA Button -->
    <div style="text-align:center;margin-bottom:32px;">
      <a href="${escapeHtml(dashboardUrl)}" style="display:inline-block;background:#f06523;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:600;letter-spacing:0.2px;">Open Your Training Dashboard &#8594;</a>
      <p style="color:#a09d9a;font-size:12px;margin:10px 0 0;">Access your modules, track progress, and find all learning materials</p>
    </div>

    <!-- Divider -->
    <hr style="border:none;border-top:1px solid #eae9e8;margin:28px 0;">

    <!-- Training Journey -->
    <h2 style="color:#1a1a1a;font-size:16px;font-weight:600;margin:0 0 16px;">&#128203; Your Training Journey</h2>

    <div style="margin-bottom:24px;">
      <div style="display:flex;margin-bottom:12px;">
        <div style="background:#e8f4fd;color:#1a6dba;font-size:11px;font-weight:700;padding:4px 10px;border-radius:12px;white-space:nowrap;margin-right:12px;height:fit-content;">DAY 1-2</div>
        <div>
          <div style="color:#1a1a1a;font-size:14px;font-weight:500;">Product Training</div>
          <div style="color:#6b6966;font-size:13px;">Self-study with Andrea — learn the what, why & how</div>
        </div>
      </div>
      <div style="display:flex;margin-bottom:12px;">
        <div style="background:#fef3e6;color:#d4700a;font-size:11px;font-weight:700;padding:4px 10px;border-radius:12px;white-space:nowrap;margin-right:12px;height:fit-content;">DAY 3+</div>
        <div>
          <div style="color:#1a1a1a;font-size:14px;font-weight:500;">Role-Specific Training</div>
          <div style="color:#6b6966;font-size:13px;">Hands-on sessions tailored to your role</div>
        </div>
      </div>
    </div>

    <!-- Divider -->
    <hr style="border:none;border-top:1px solid #eae9e8;margin:28px 0;">

    <!-- Checklist -->
    <h2 style="color:#1a1a1a;font-size:16px;font-weight:600;margin:0 0 16px;">&#9989; Before Day 1</h2>

    <div style="margin-bottom:24px;">
      <div style="padding:10px 0;border-bottom:1px solid #f5f4f3;display:flex;align-items:center;">
        <span style="color:#a09d9a;margin-right:10px;">&#9744;</span>
        <span style="color:#3d3b39;font-size:14px;">MacBook fully set up and charged</span>
      </div>
      <div style="padding:10px 0;border-bottom:1px solid #f5f4f3;display:flex;align-items:center;">
        <span style="color:#a09d9a;margin-right:10px;">&#9744;</span>
        <span style="color:#3d3b39;font-size:14px;">iPad ready (borrow from HR if needed)</span>
      </div>
      <div style="padding:10px 0;border-bottom:1px solid #f5f4f3;display:flex;align-items:center;">
        <span style="color:#a09d9a;margin-right:10px;">&#9744;</span>
        <span style="color:#3d3b39;font-size:14px;">Explore your Training Dashboard</span>
      </div>
    </div>

    <!-- Divider -->
    <hr style="border:none;border-top:1px solid #eae9e8;margin:28px 0;">

    <!-- FAQ -->
    <h2 style="color:#1a1a1a;font-size:16px;font-weight:600;margin:0 0 16px;">&#10067; Quick FAQ</h2>

    <div style="margin-bottom:24px;">
      <div style="margin-bottom:16px;">
        <div style="color:#1a1a1a;font-size:14px;font-weight:500;margin-bottom:4px;">How should I prepare for Day 1?</div>
        <div style="color:#6b6966;font-size:13px;line-height:1.5;">Visit your Training Dashboard and confirm your devices are ready. You'll start with product training via self-study.</div>
      </div>
      <div style="margin-bottom:16px;">
        <div style="color:#1a1a1a;font-size:14px;font-weight:500;margin-bottom:4px;">What if I have technical issues?</div>
        <div style="color:#6b6966;font-size:13px;line-height:1.5;">Reach me directly at <a href="mailto:andrea.kaur@storehub.com" style="color:#f06523;text-decoration:none;">andrea.kaur@storehub.com</a></div>
      </div>
      <div style="margin-bottom:16px;">
        <div style="color:#1a1a1a;font-size:14px;font-weight:500;margin-bottom:4px;">Will there be Q&A time?</div>
        <div style="color:#6b6966;font-size:13px;line-height:1.5;">Absolutely! Each session includes dedicated Q&A, and I'm always available for support.</div>
      </div>
    </div>

    <!-- Pro Tip -->
    <div style="background:#f5f4f3;border-radius:8px;padding:16px 20px;margin-bottom:24px;">
      <div style="font-size:13px;color:#6b6966;line-height:1.5;">
        &#128161; <strong style="color:#1a1a1a;">Pro Tip:</strong> Start exploring your Training Dashboard before Day 1 to get a head start on the fundamentals.
      </div>
    </div>

    <!-- Sign off -->
    <p style="color:#3d3b39;font-size:15px;line-height:1.7;margin:0 0 20px;">
      Looking forward to meeting you and supporting your success at StoreHub!
    </p>

    <div style="margin-top:24px;">
      <p style="color:#1a1a1a;font-size:14px;font-weight:500;margin:0;">Andrea K.</p>
      <p style="color:#a09d9a;font-size:13px;margin:4px 0 0;">Senior Training & Knowledge Base Specialist</p>
      <p style="color:#a09d9a;font-size:13px;margin:2px 0 0;">StoreHub</p>
    </div>
  </div>

  <!-- Footer -->
  <div style="text-align:center;padding:20px;font-size:11px;color:#a09d9a;">
    This is an automated message from the StoreHub Learning Hub.
  </div>

</div>
</body>
</html>`
}

/**
 * Escape HTML to prevent XSS in email templates.
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
