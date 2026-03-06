const UnsubscribeToken = require('../models/unsubscribeTokenDB');
const SmtpAccount = require('../models/SmtpAccount');
const Company = require('../models/companyDB');

/**
 * GET /api/unsubscribe/:token
 * No auth required — accessed directly from email client link.
 */
const handleUnsubscribe = async (req, res) => {
    const { token } = req.params;

    const page = (title, emoji, heading, body, accentFrom, accentTo) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${title} – MailStorm</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet"/>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}

    body{
      min-height:100vh;display:flex;align-items:center;justify-content:center;
      background:linear-gradient(135deg,#0a0a1a 0%,#0f172a 40%,#1a1035 100%);
      font-family:'Inter',system-ui,sans-serif;color:#e2e8f0;padding:24px;
      overflow:hidden;position:relative;
    }

    /* Floating glow orbs */
    .orb{position:fixed;border-radius:50%;filter:blur(80px);pointer-events:none;opacity:.35}
    .orb-1{width:420px;height:420px;background:radial-gradient(circle,${accentFrom},transparent);top:-80px;left:-100px;animation:float 8s ease-in-out infinite}
    .orb-2{width:350px;height:350px;background:radial-gradient(circle,${accentTo},transparent);bottom:-60px;right:-80px;animation:float 10s ease-in-out infinite reverse}
    .orb-3{width:200px;height:200px;background:radial-gradient(circle,#818cf8,transparent);top:50%;left:60%;animation:float 12s ease-in-out infinite}

    @keyframes float{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-30px) scale(1.05)}}

    /* Card */
    .card{
      position:relative;z-index:2;
      background:rgba(255,255,255,0.04);
      backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);
      border:1px solid rgba(255,255,255,0.08);border-radius:28px;
      padding:56px 44px;max-width:480px;width:100%;text-align:center;
      box-shadow:0 32px 64px rgba(0,0,0,0.5),0 0 120px rgba(99,102,241,0.08);
      animation:cardIn .6s cubic-bezier(.16,1,.3,1) both;
      animation-delay:1.5s;opacity:0;
    }
    @keyframes cardIn{from{opacity:0;transform:translateY(20px) scale(.96)}to{opacity:1;transform:translateY(0) scale(1)}}

    .emoji-icon{font-size:64px;display:block;margin-bottom:24px;
      animation:pop .4s cubic-bezier(.16,1,.3,1) both;animation-delay:1.7s;opacity:0}
    @keyframes pop{from{opacity:0;transform:scale(.5)}to{opacity:1;transform:scale(1)}}

    h1{
      font-size:1.85rem;font-weight:800;margin-bottom:14px;
      background:linear-gradient(135deg,${accentFrom},${accentTo});
      -webkit-background-clip:text;-webkit-text-fill-color:transparent;
      background-clip:text;
    }
    .body-text{font-size:1rem;color:#94a3b8;line-height:1.7;max-width:380px;margin:0 auto}

    .divider{
      width:48px;height:3px;margin:24px auto;border-radius:2px;
      background:linear-gradient(90deg,${accentFrom},${accentTo});opacity:.5;
    }

    .brand{font-size:.75rem;color:#475569;margin-top:8px}
    .brand a{
      background:linear-gradient(90deg,${accentFrom},${accentTo});
      -webkit-background-clip:text;-webkit-text-fill-color:transparent;
      background-clip:text;text-decoration:none;font-weight:600;
    }
    .brand a:hover{opacity:.8}

    /* ── Skeleton loader ── */
    .skeleton-wrapper{
      position:relative;z-index:2;
      max-width:480px;width:100%;padding:56px 44px;
      background:rgba(255,255,255,0.04);
      backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);
      border:1px solid rgba(255,255,255,0.08);border-radius:28px;
      box-shadow:0 32px 64px rgba(0,0,0,0.5);
      text-align:center;
      animation:skeletonOut .4s ease-out 1.3s both;
    }
    @keyframes skeletonOut{to{opacity:0;transform:scale(.96);pointer-events:none;position:absolute}}

    .shimmer{
      border-radius:12px;
      background:linear-gradient(90deg,rgba(255,255,255,0.04) 25%,rgba(255,255,255,0.08) 50%,rgba(255,255,255,0.04) 75%);
      background-size:800px 100%;
      animation:shimmer 1.8s infinite linear;
    }
    @keyframes shimmer{0%{background-position:-800px 0}100%{background-position:800px 0}}

    .sk-emoji{width:64px;height:64px;border-radius:50%;margin:0 auto 24px}
    .sk-title{width:200px;height:28px;margin:0 auto 14px}
    .sk-line1{width:300px;height:14px;margin:0 auto 10px}
    .sk-line2{width:240px;height:14px;margin:0 auto 10px}
    .sk-divider{width:48px;height:3px;margin:24px auto}
    .sk-brand{width:120px;height:12px;margin:0 auto}
  </style>
</head>
<body>
  <!-- Background orbs -->
  <div class="orb orb-1"></div>
  <div class="orb orb-2"></div>
  <div class="orb orb-3"></div>

  <!-- Skeleton loader (visible first, fades out) -->
  <div class="skeleton-wrapper">
    <div class="shimmer sk-emoji"></div>
    <div class="shimmer sk-title"></div>
    <div class="shimmer sk-line1"></div>
    <div class="shimmer sk-line2"></div>
    <div class="shimmer sk-divider"></div>
    <div class="shimmer sk-brand"></div>
  </div>

  <!-- Real content (fades in after skeleton) -->
  <div class="card">
    <span class="emoji-icon">${emoji}</span>
    <h1>${heading}</h1>
    <p class="body-text">${body}</p>
    <div class="divider"></div>
    <div class="brand">Powered by <a href="https://mailstorm.keshavturnomatics.com">MailStorm</a></div>
  </div>
</body>
</html>`;

    try {
        if (!token || token === 'unsubscribe') {
            return res.status(400).send(page(
                'Invalid Link', '⚠️', 'Invalid Link',
                'This unsubscribe link is invalid or malformed.',
                '#f59e0b', '#f97316'
            ));
        }

        // Atomically find the token and mark it used in one operation (prevents double-click race)
        const doc = await UnsubscribeToken.findOneAndUpdate(
            { token, used: false },
            { $set: { used: true } },
            { new: false } // return the original doc so we can read senderId/smtpAccountId
        );

        if (!doc) {
            // Either token doesn't exist or was already used
            const exists = await UnsubscribeToken.exists({ token });
            if (exists) {
                return res.status(200).send(page(
                    'Already Unsubscribed', '✅', 'Already Unsubscribed',
                    'You have already unsubscribed from this sender\'s emails. You will not receive any further emails from them.',
                    '#22c55e', '#10b981'
                ));
            }
            return res.status(404).send(page(
                'Link Not Found', '🔍', 'Link Not Found',
                'This unsubscribe link is invalid or has expired. Please contact the sender if you wish to stop receiving emails.',
                '#f59e0b', '#f97316'
            ));
        }

        // Increment the SMTP slot's unsubscribe count
        await SmtpAccount.findByIdAndUpdate(doc.smtpAccountId, { $inc: { unsubscribeCount: 1 } });

        // Mark the recipient company as unsubscribed — scoped to this sender only
        await Company.updateMany(
            { companyEmail: doc.recipientEmail, createdBy: doc.senderId },
            { $set: { unsubscribed: true } }
        );

        return res.status(200).send(page(
            'Unsubscribed', '🚫', 'Successfully Unsubscribed',
            'You have been successfully unsubscribed. You will no longer receive emails from this sender via MailStorm.',
            '#818cf8', '#a78bfa'
        ));
    } catch (error) {
        console.error('Error processing unsubscribe:', error);
        return res.status(500).send(page(
            'Error', '❌', 'Something went wrong',
            'We encountered an error while processing your request. Please try again later.',
            '#ef4444', '#f87171'
        ));
    }
};

module.exports = { handleUnsubscribe };
