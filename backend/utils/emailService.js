const nodemailer = require('nodemailer');

const createTransporter = () => {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,   
            pass: process.env.EMAIL_PASS    
        }
    });
};

const emailWrapper = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0; padding:0; background:#f8f0fb; font-family:'Poppins',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f0fb; padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0"
               style="background:white; border-radius:16px; overflow:hidden;
                      box-shadow:0 4px 20px rgba(0,0,0,0.08); max-width:600px; width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#ff85a2,#ffb7c5);
                       padding:30px 40px; text-align:center;">
              <h1 style="margin:0; color:white; font-size:28px; font-weight:700;
                         letter-spacing:1px;">
                ☁️ CloudBake
              </h1>
              <p style="margin:6px 0 0; color:rgba(255,255,255,0.9); font-size:14px;">
                Heavenly pastries, delivered to you
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#fdf2ff; padding:20px 40px; text-align:center;
                       border-top:1px solid #f0e0f5;">
              <p style="margin:0; color:#aaa; font-size:12px; line-height:1.6;">
                © 2024 CloudBake · All rights reserved<br>
                <span style="color:#ffb7c5;">This is an automated email — please do not reply.</span>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

const emailButton = (text, url) => `
  <div style="text-align:center; margin:28px 0 8px;">
    <a href="${url}"
       style="background:linear-gradient(135deg,#ff85a2,#ffb7c5);
              color:white; text-decoration:none; padding:14px 36px;
              border-radius:30px; font-weight:700; font-size:15px;
              display:inline-block; box-shadow:0 4px 14px rgba(255,133,162,0.35);">
      ${text}
    </a>
  </div>`;

const infoRow = (label, value) => `
  <tr>
    <td style="padding:10px 0; color:#888; font-size:14px; width:40%;
               border-bottom:1px solid #f5f5f5;">${label}</td>
    <td style="padding:10px 0; color:#333; font-weight:600; font-size:14px;
               border-bottom:1px solid #f5f5f5;">${value}</td>
  </tr>`;

const sendOrderConfirmationEmail = async ({ to, name, orderId, items, total, paymentMethod, address }) => {
    const transporter = createTransporter();

    const itemRows = items.map(item => `
      <tr>
        <td style="padding:12px 0; font-size:14px; color:#333;
                   border-bottom:1px solid #f9f9f9;">
          ${item.name}
        </td>
        <td style="padding:12px 0; font-size:14px; color:#888;
                   text-align:center; border-bottom:1px solid #f9f9f9;">
          ×${item.qty || item.quantity || 1}
        </td>
        <td style="padding:12px 0; font-size:14px; font-weight:600; color:#ff85a2;
                   text-align:right; border-bottom:1px solid #f9f9f9;">
          NPR ${((item.qty || item.quantity || 1) * item.price).toFixed(0)}
        </td>
      </tr>`).join('');

    const html = emailWrapper(`
      <h2 style="margin:0 0 6px; color:#333; font-size:22px;">
        🎉 Order Confirmed!
      </h2>
      <p style="color:#888; margin:0 0 24px; font-size:15px;">
        Hi <strong style="color:#333;">${name}</strong>, your order has been received
        and we're already getting the oven ready!
      </p>

      <!-- Order details -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
        ${infoRow('Order ID',        '#' + String(orderId).slice(-8).toUpperCase())}
        ${infoRow('Payment Method',  paymentMethod)}
        ${infoRow('Delivery Address',address)}
        ${infoRow('Estimated Time',  '30 – 45 minutes')}
      </table>

      <!-- Items -->
      <h3 style="margin:0 0 12px; color:#333; font-size:16px;">Your Items</h3>
      <table width="100%" cellpadding="0" cellspacing="0"
             style="border-top:2px solid #f0f0f0; margin-bottom:16px;">
        ${itemRows}
        <tr>
          <td colspan="2" style="padding:14px 0; font-size:15px; font-weight:700; color:#333;">
            Total
          </td>
          <td style="padding:14px 0; font-size:18px; font-weight:700; color:#ff85a2;
                     text-align:right;">
            NPR ${total}
          </td>
        </tr>
      </table>

      <p style="color:#888; font-size:14px; line-height:1.6; margin:0 0 4px;">
        We'll send you another email once your order is out for delivery.
        Thank you for choosing CloudBake! 🍰
      </p>
    `);

    await transporter.sendMail({
        from:    `"CloudBake 🍰" <${process.env.EMAIL_USER}>`,
        to,
        subject: `✅ Order Confirmed — #${String(orderId).slice(-8).toUpperCase()} | CloudBake`,
        html
    });

    console.log(`✅ Order confirmation email sent to ${to}`);
};

const sendWelcomeEmail = async ({ to, name }) => {
    const transporter = createTransporter();

    const html = emailWrapper(`
      <h2 style="margin:0 0 6px; color:#333; font-size:22px;">
        Welcome to CloudBake! 🎂
      </h2>
      <p style="color:#888; margin:0 0 20px; font-size:15px;">
        Hi <strong style="color:#333;">${name}</strong> — we're thrilled to have you on board.
        Your account is all set and you're ready to start ordering.
      </p>

      <div style="background:#fdf2ff; border-radius:12px; padding:20px 24px; margin:0 0 24px;">
        <h3 style="margin:0 0 12px; color:#d11aff; font-size:15px;">
          🏅 You've already earned 100 Loyalty Points!
        </h3>
        <p style="margin:0; color:#666; font-size:14px; line-height:1.6;">
          Keep ordering to unlock <strong>Silver</strong> (500 pts) and
          <strong>Gold</strong> (1500 pts) perks — including discounts,
          free delivery, and exclusive birthday bonuses.
        </p>
      </div>

      ${emailButton('Start Ordering', `${process.env.FRONTEND_URL || 'http://localhost:3000'}/menu.html`)}

      <p style="color:#bbb; font-size:12px; text-align:center; margin:16px 0 0;">
        If you didn't create this account, you can safely ignore this email.
      </p>
    `);

    await transporter.sendMail({
        from:    `"CloudBake 🍰" <${process.env.EMAIL_USER}>`,
        to,
        subject: '🎉 Welcome to CloudBake — Your Account is Ready!',
        html
    });

    console.log(`✅ Welcome email sent to ${to}`);
};


const sendLoginNotificationEmail = async ({ to, name, time, browser }) => {
    const transporter = createTransporter();

    const html = emailWrapper(`
      <h2 style="margin:0 0 6px; color:#333; font-size:22px;">
        🔐 New Login Detected
      </h2>
      <p style="color:#888; margin:0 0 24px; font-size:15px;">
        Hi <strong style="color:#333;">${name}</strong>, we noticed a new sign-in
        to your CloudBake account.
      </p>

      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
        ${infoRow('Time',    time)}
        ${infoRow('Browser', browser || 'Unknown')}
      </table>

      <div style="background:#fff8f0; border-left:4px solid #ffb347; border-radius:8px;
                  padding:16px 20px; margin-bottom:20px;">
        <p style="margin:0; color:#666; font-size:14px; line-height:1.6;">
          <strong>Wasn't you?</strong> Please change your password immediately and
          contact our support team.
        </p>
      </div>

      ${emailButton('Go to My Account', `${process.env.FRONTEND_URL || 'http://localhost:3000'}/account.html`)}
    `);

    await transporter.sendMail({
        from:    `"CloudBake 🍰" <${process.env.EMAIL_USER}>`,
        to,
        subject: '🔐 New Login to Your CloudBake Account',
        html
    });

    console.log(`✅ Login notification email sent to ${to}`);
};

const sendContactFormEmail = async ({ name, email, subject, message }) => {
    const transporter = createTransporter();

    const userHtml = emailWrapper(`
      <h2 style="margin:0 0 6px; color:#333; font-size:22px;">
        We've received your message! 💌
      </h2>
      <p style="color:#888; margin:0 0 20px; font-size:15px;">
        Hi <strong style="color:#333;">${name}</strong>, thank you for reaching out.
        Our team will get back to you within <strong>24 hours</strong>.
      </p>

      <div style="background:#f9f9f9; border-radius:12px; padding:20px 24px; margin:0 0 20px;">
        <p style="margin:0 0 6px; font-size:13px; color:#aaa; text-transform:uppercase;
                  letter-spacing:0.5px;">Your message</p>
        <p style="margin:0; font-size:15px; color:#444; line-height:1.7;">${message}</p>
      </div>

      <p style="color:#888; font-size:14px; line-height:1.6; margin:0;">
        Need urgent help? Reply to this email or reach us at
        <a href="mailto:${process.env.EMAIL_USER}"
           style="color:#ff85a2;">${process.env.EMAIL_USER}</a>.
      </p>
    `);

    await transporter.sendMail({
        from:    `"CloudBake 🍰" <${process.env.EMAIL_USER}>`,
        to:      email,
        subject: `💌 We got your message, ${name}! | CloudBake`,
        html:    userHtml
    });

    const adminHtml = emailWrapper(`
      <h2 style="margin:0 0 6px; color:#333; font-size:20px;">
        📩 New Contact Form Submission
      </h2>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
        ${infoRow('Name',    name)}
        ${infoRow('Email',   email)}
        ${infoRow('Subject', subject || 'General Enquiry')}
      </table>
      <div style="background:#f9f9f9; border-radius:12px; padding:20px 24px; margin-top:20px;">
        <p style="margin:0 0 6px; font-size:13px; color:#aaa; text-transform:uppercase;
                  letter-spacing:0.5px;">Message</p>
        <p style="margin:0; font-size:15px; color:#444; line-height:1.7;">${message}</p>
      </div>
    `);

    await transporter.sendMail({
        from:    `"CloudBake Forms" <${process.env.EMAIL_USER}>`,
        to:      process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
        subject: `📩 New Contact: ${subject || 'General Enquiry'} — from ${name}`,
        html:    adminHtml
    });

    console.log(`✅ Contact form emails sent (user: ${email})`);
};


const sendCustomOrderEmail = async ({ to, name, orderId, occasion, tiers, base, icing, decorations, eventDate, guestCount, specialRequest }) => {
    const transporter = createTransporter();

    const html = emailWrapper(`
      <h2 style="margin:0 0 6px; color:#333; font-size:22px;">
        👑 Your Special Cake Request is Received!
      </h2>
      <p style="color:#888; margin:0 0 24px; font-size:15px;">
        Hi <strong style="color:#333;">${name}</strong>, we've received your special
        occasion cake request and our cake artists are excited to make it happen!
      </p>

      <div style="background:linear-gradient(135deg,#fdf2ff,#fff0f7);
                  border-radius:12px; padding:20px 24px; margin:0 0 24px;
                  border-left:4px solid #d11aff;">
        <h3 style="margin:0 0 14px; color:#d11aff; font-size:15px;">
          Your Cake Details
        </h3>
        <table width="100%" cellpadding="0" cellspacing="0">
          ${infoRow('Request ID',  '#' + String(orderId).slice(-8).toUpperCase())}
          ${occasion   ? infoRow('Occasion',    occasion)   : ''}
          ${tiers      ? infoRow('Tiers',        tiers)      : ''}
          ${base       ? infoRow('Base Flavor',  base)       : ''}
          ${icing      ? infoRow('Icing',         icing)      : ''}
          ${decorations && decorations.length ? infoRow('Decorations', decorations.join(', ')) : ''}
          ${eventDate  ? infoRow('Event Date',   eventDate)  : ''}
          ${guestCount ? infoRow('Guests',       guestCount) : ''}
        </table>
        ${specialRequest ? `
          <div style="margin-top:14px; padding-top:14px; border-top:1px solid #f0e0f5;">
            <p style="margin:0 0 4px; font-size:12px; color:#aaa; text-transform:uppercase;">Special Notes</p>
            <p style="margin:0; font-size:14px; color:#555;">${specialRequest}</p>
          </div>` : ''}
      </div>

      <p style="color:#888; font-size:14px; line-height:1.6; margin:0 0 4px;">
        Our team will call you within <strong>24 hours</strong> to confirm
        every detail and finalize your quote. Special cakes require
        <strong>5–7 days</strong> advance notice.
      </p>
    `);

    await transporter.sendMail({
        from:    `"CloudBake 🍰" <${process.env.EMAIL_USER}>`,
        to,
        subject: `👑 Special Cake Request Confirmed — #${String(orderId).slice(-8).toUpperCase()} | CloudBake`,
        html
    });

    console.log(`✅ Custom order email sent to ${to}`);
};

module.exports = {
    sendOrderConfirmationEmail,
    sendWelcomeEmail,
    sendLoginNotificationEmail,
    sendContactFormEmail,
    sendCustomOrderEmail
};