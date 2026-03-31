const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT, 10) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Send an email notification.
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - Email HTML body
 */
async function sendEmail(to, subject, html) {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      html,
    });
  } catch (err) {
    console.error('[Email] Failed to send:', err.message);
  }
}

/**
 * Notify seller that their listing was approved.
 */
async function sendListingApprovedEmail(sellerEmail, carTitle) {
  await sendEmail(
    sellerEmail,
    'Your Car Listing Has Been Approved!',
    `<h2>Congratulations!</h2>
     <p>Your listing <strong>${carTitle}</strong> has been approved and is now visible on the marketplace.</p>`
  );
}

/**
 * Notify seller that their listing was rejected.
 */
async function sendListingRejectedEmail(sellerEmail, carTitle, reason) {
  await sendEmail(
    sellerEmail,
    'Your Car Listing Was Rejected',
    `<h2>Listing Update</h2>
     <p>Your listing <strong>${carTitle}</strong> was not approved.</p>
     <p><strong>Reason:</strong> ${reason || 'No reason provided.'}</p>
     <p>Please update your listing and resubmit.</p>`
  );
}

/**
 * Notify about a force-deleted listing.
 */
async function sendListingForceDeletedEmail(sellerEmail, carTitle) {
  await sendEmail(
    sellerEmail,
    'Your Car Listing Has Been Permanently Removed',
    `<h2>Listing Removed</h2>
     <p>Your listing <strong>${carTitle}</strong> has been permanently removed by an administrator.</p>`
  );
}

/**
 * Notify user that their seller request was approved.
 */
async function sendSellerRequestApprovedEmail(userEmail, userName) {
  await sendEmail(
    userEmail,
    'Your Seller Request Has Been Approved!',
    `<h2>Congratulations, ${userName}!</h2>
     <p>Your request to become a seller has been approved.</p>
     <p>You can now start listing vehicles on the marketplace.</p>`
  );
}

/**
 * Notify user that their seller request was rejected.
 */
async function sendSellerRequestRejectedEmail(userEmail, userName, reason) {
  await sendEmail(
    userEmail,
    'Your Seller Request Was Not Approved',
    `<h2>Seller Request Update</h2>
     <p>Hi ${userName}, your request to become a seller was not approved.</p>
     <p><strong>Reason:</strong> ${reason || 'No reason provided.'}</p>
     <p>You may submit a new request after addressing the above.</p>`
  );
}

module.exports = {
  sendEmail,
  sendListingApprovedEmail,
  sendListingRejectedEmail,
  sendListingForceDeletedEmail,
  sendSellerRequestApprovedEmail,
  sendSellerRequestRejectedEmail,
};
